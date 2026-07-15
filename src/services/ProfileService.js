import { supabase } from '../lib/supabase'

async function normalizeAvatarToPng(file) {
    const isIcon = file.type === 'image/x-icon' || file.type === 'image/vnd.microsoft.icon' || file.name.toLowerCase().endsWith('.ico')
    const isPng = file.type === 'image/png' && file.name.toLowerCase().endsWith('.png')
    const isImage = file.type?.startsWith('image/') || isIcon

    if (!isImage) {
        throw new Error('Formato inválido. Use PNG, JPG, JPEG, WEBP ou ICO.')
    }

    if (isPng && !isIcon) return file

    if (typeof document === 'undefined') {
        throw new Error('Este navegador não conseguiu processar a imagem. Use PNG, JPG, JPEG ou WEBP.')
    }

    try {
        let imageSource
        if (typeof createImageBitmap === 'function') {
            try {
                imageSource = await createImageBitmap(file)
            } catch {
                imageSource = null
            }
        }

        if (!imageSource) {
            const objectUrl = URL.createObjectURL(file)
            imageSource = await new Promise((resolve, reject) => {
                const image = new Image()
                image.onload = () => {
                    URL.revokeObjectURL(objectUrl)
                    resolve(image)
                }
                image.onerror = () => {
                    URL.revokeObjectURL(objectUrl)
                    reject(new Error('O navegador não conseguiu ler esta imagem.'))
                }
                image.src = objectUrl
            })
        }

        const canvas = document.createElement('canvas')
        canvas.width = imageSource.width
        canvas.height = imageSource.height
        const context = canvas.getContext('2d')
        context.drawImage(imageSource, 0, 0)
        imageSource.close?.()

        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(result => {
                if (result) resolve(result)
                else reject(new Error('Não foi possível converter a imagem para PNG.'))
            }, 'image/png')
        })

        const safeBaseName = file.name.replace(/\.[^.]+$/i, '') || 'avatar'
        return new File([blob], `${safeBaseName}.png`, { type: 'image/png' })
    } catch (error) {
        throw new Error(`Não foi possível preparar a imagem. Use PNG, JPG, JPEG ou WEBP. Detalhe: ${error.message}`)
    }
}

export const ProfileService = {
    // Get current user profile
    async getProfile() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            // If profile doesn't exist (e.g. old user), return basic info from auth
            if (error.code === 'PGRST116') {
                return {
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || '',
                    avatar_url: user.user_metadata?.avatar_url || ''
                }
            }
            throw error
        }

        return { ...data, email: user.email }
    },

    // Update profile
    async updateProfile(updates) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                ...updates,
                updated_at: new Date().toISOString(),
            })

        if (error) throw error
        return true
    },

    async updateWorkHours(workHours) {
        const currentProfile = await this.getProfile()
        const currentPreferences = currentProfile.preferências || {}
        const nextPreferences = {
            ...currentPreferences,
            work_hours: {
                ...(currentPreferences.work_hours || {}),
                ...workHours
            }
        }

        await this.updateProfile({ preferências: nextPreferences })
        const persistedProfile = await this.getProfile()
        return persistedProfile.preferências?.work_hours || {}
    },

    // Upload Avatar - uses {userId}/{timestamp}.ext path for RLS compatibility
    async uploadAvatar(file) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const uploadFile = await normalizeAvatarToPng(file)
        const fileExt = 'png'
        const timestamp = Date.now()
        // Path pattern: {userId}/{timestamp}.{ext} matches storage RLS policy
        const filePath = `${user.id}/${timestamp}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, uploadFile, {
                upsert: true,           // Replace if already exists
                contentType: uploadFile.type || 'image/png',
            })

        if (uploadError) throw uploadError

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        // Cache-busting: force browser to reload the new image
        return `${data.publicUrl}?t=${timestamp}`
    }
}
