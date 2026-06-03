import { supabase } from '../lib/supabase'

export const GamificationService = {
    // Award XP to the current user and check for Level Up
    async awardXp(xpAmount) {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // 1. Get current profiles stats
            const { data: profile, error: fetchErr } = await supabase
                .from('profiles')
                .select('xp, level, streak, last_activity_date')
                .eq('id', user.id)
                .single()

            if (fetchErr) throw fetchErr

            let newXp = (profile.xp || 0) + xpAmount
            let newLevel = profile.level || 1
            let levelUp = false

            // XP_PER_LEVEL: 1000 XP to level up (max level 10, then XP caps at 1000)
            const XP_PER_LEVEL = 1000

            if (xpAmount >= 0) {
                while (newXp >= XP_PER_LEVEL && newLevel < 10) {
                    newXp -= XP_PER_LEVEL
                    newLevel += 1
                    levelUp = true
                }
                // At max level (10), cap XP at 1000 (prestige full bar)
                if (newLevel >= 10 && newXp > XP_PER_LEVEL) {
                    newXp = XP_PER_LEVEL
                }
            } else {
                while (newXp < 0 && newLevel > 1) {
                    newLevel -= 1
                    newXp += XP_PER_LEVEL
                }
                if (newXp < 0) {
                    newXp = 0
                }
            }

            const todayStr = new Date().toISOString().split('T')[0]

            // 2. Perform daily streak validation during XP award
            let newStreak = profile.streak || 0
            if (!profile.last_activity_date) {
                newStreak = 1
            } else {
                const today = new Date(todayStr)
                const lastAct = new Date(profile.last_activity_date)
                const diffTime = today - lastAct
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

                if (diffDays === 1) {
                    newStreak += 1 // Consecutive day
                } else if (diffDays > 1) {
                    newStreak = 1 // Streak broken, reset to 1
                }
                // If diffDays === 0, user already completed activity today, streak remains same
            }

            // 3. Update profiles table
            const { data: updatedProfile, error: updateErr } = await supabase
                .from('profiles')
                .update({
                    xp: newXp,
                    level: newLevel,
                    streak: newStreak,
                    last_activity_date: todayStr
                })
                .eq('id', user.id)
                .select()
                .single()

            if (updateErr) throw updateErr

            // Dispatch event for UI reactivity (e.g. Header)
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('xp-updated'))
                window.dispatchEvent(new CustomEvent('xp-changed', { detail: { amount: xpAmount } }))
            }

            return {
                levelUp,
                newLevel,
                currentXp: newXp,
                xpNeeded: 1000, // always 1000 XP per level
                streak: newStreak,
                profile: updatedProfile
            }
        } catch (err) {
            console.error('Error in awardXp:', err)
            throw err
        }
    },

    // Fetch user gamification stats
    async getUserStats() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('xp, level, streak, last_activity_date')
                .eq('id', user.id)
                .single()

            if (error) throw error
            
            // Check streak status (reset if missed yesterday)
            if (profile && profile.last_activity_date) {
                const today = new Date(new Date().toISOString().split('T')[0])
                const lastAct = new Date(profile.last_activity_date)
                const diffTime = today - lastAct
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
                
                if (diffDays > 1) {
                    // Reset streak to 0
                    const { data: updated } = await supabase
                        .from('profiles')
                        .update({ streak: 0 })
                        .eq('id', user.id)
                        .select()
                        .single()
                    return updated
                }
            }

            return profile
        } catch (err) {
            console.error('Error fetching user stats:', err)
            return null
        }
    },

    // Check overdue tasks and apply -20 XP penalty once per task
    async checkOverdueTasksAndPenalize() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return { penalizedCount: 0 }

            const nowStr = new Date().toISOString()

            // Fetch incomplete overdue tasks that haven't been penalized yet
            const { data: overdueTasks, error } = await supabase
                .from('tasks')
                .select('id, title')
                .eq('user_id', user.id)
                .neq('status', 'Feito')
                .lt('due_date', nowStr)
                .eq('overdue_penalized', false)

            if (error) throw error
            if (!overdueTasks || overdueTasks.length === 0) return { penalizedCount: 0 }

            const taskIds = overdueTasks.map(t => t.id)

            // Mark them as penalized in database
            const { error: updateErr } = await supabase
                .from('tasks')
                .update({ overdue_penalized: true })
                .in('id', taskIds)

            if (updateErr) throw updateErr

            // Deduct XP (50 XP per overdue task, scaled to 1000 XP/level system)
            const totalDeduction = overdueTasks.length * 50
            await this.awardXp(-totalDeduction)

            // Trigger window event for notifications
            if (typeof window !== 'undefined') {
                const event = new CustomEvent('tasks-overdue-penalty', {
                    detail: {
                        tasks: overdueTasks,
                        deduction: totalDeduction
                    }
                })
                window.dispatchEvent(event)
            }

            return {
                penalizedCount: overdueTasks.length,
                deduction: totalDeduction,
                tasks: overdueTasks
            }
        } catch (err) {
            console.error('Error checking overdue tasks:', err)
            return { penalizedCount: 0 }
        }
    }
}
