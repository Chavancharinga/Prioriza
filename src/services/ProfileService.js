import { supabase } from '../lib/supabase'

async function convertIconToPng(file) {
    const isIcon = file.type === 'image/x-icon' || file.type === 'image/vnd.microsoft.icon' || file.name.toLowerCase().endsWith('.ico')
    if (!isIcon) return file

    if (typeof document === 'undefined') {
        throw new Error('Formato .ico não suportado neste navegador. Use PNG, JPG ou WEBP para a foto de perfil.')
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
                    reject(new Error('O navegador não conseguiu ler este ficheiro .ico.'))
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
                else reject(new Error('Não foi possível converter o ficheiro .ico para PNG.'))
            }, 'image/png')
        })

        return new File([blob], file.name.replace(/\.ico$/i, '.png'), { type: 'image/png' })
    } catch (error) {
        throw new Error(`Não foi possível converter o .ico para PNG. Use PNG, JPG ou WEBP. Detalhe: ${error.message}`)
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

    // Upload Avatar - uses {userId}/{timestamp}.ext path for RLS compatibility
    async uploadAvatar(file) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const uploadFile = await convertIconToPng(file)
        const fileExt = uploadFile.name.split('.').pop().toLowerCase()
        const timestamp = Date.now()
        // Path pattern: {userId}/{timestamp}.{ext}  → matches storage RLS policy
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
