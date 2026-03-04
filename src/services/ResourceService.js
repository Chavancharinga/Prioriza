import { supabase } from '../lib/supabase'

export const ResourceService = {
    // Get resources for a specific task
    async getResources(taskId) {
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .eq('task_id', taskId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Create a new resource linked to a task
    async createResource(taskId, url, title = '') {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('resources')
            .insert([{
                task_id: taskId,
                url,
                title: title || url,
            }])
            .select('*')
            .single()

        if (error) throw error
        return data
    },

    // Delete a resource
    async deleteResource(id) {
        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}
