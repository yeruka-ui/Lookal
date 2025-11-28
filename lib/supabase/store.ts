import { supabase } from './client'
import type { StoreSettings, StoreSettingsUpdate } from './types'

/**
 * Fetch store settings from the database
 * Returns the first (and only) store settings record
 */
export async function getStoreSettings(): Promise<StoreSettings | null> {
    const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single()

    if (error) {
        // If no settings exist yet, return null
        if (error.code === 'PGRST116') {
            return null
        }
        console.error('Error fetching store settings:', error)
        throw error
    }

    return data
}

/**
 * Update store settings
 * If no settings exist, creates a new record
 */
export async function updateStoreSettings(updates: StoreSettingsUpdate): Promise<StoreSettings> {
    // First, try to get existing settings
    const existing = await getStoreSettings()

    if (existing) {
        // Update existing settings
        const { data, error } = await supabase
            .from('store_settings')
            .update(updates)
            .eq('id', existing.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating store settings:', error)
            throw error
        }

        return data
    } else {
        // Create new settings
        const { data, error } = await supabase
            .from('store_settings')
            .insert({
                store_name: updates.store_name || 'My Store',
                store_description: updates.store_description || 'Welcome to my store',
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating store settings:', error)
            throw error
        }

        return data
    }
}
