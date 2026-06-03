import { supabase } from '../lib/supabase'

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

        const fileExt = file.name.split('.').pop().toLowerCase()
        const timestamp = Date.now()
        // Path pattern: {userId}/{timestamp}.{ext}  → matches storage RLS policy
        const filePath = `${user.id}/${timestamp}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                upsert: true,           // Replace if already exists
                contentType: file.type,
            })

        if (uploadError) throw uploadError

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        // Cache-busting: force browser to reload the new image
        return `${data.publicUrl}?t=${timestamp}`
    }
}
