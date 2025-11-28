import { supabase } from './client'
import type { Conversation, Message, MessageInsert } from './types'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Fetch all conversations from the database
 */
export async function getConversations(): Promise<Conversation[]> {
    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false })

    if (error) {
        console.error('Error fetching conversations:', error)
        throw error
    }

    return data || []
}

/**
 * Fetch all messages for a specific conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching messages:', error)
        throw error
    }

    return data || []
}

/**
 * Send a new message and update conversation
 */
export async function sendMessage(
    conversationId: string,
    sender: 'buyer' | 'seller',
    text: string
): Promise<Message> {
    // Insert the message
    const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender,
            text,
        })
        .select()
        .single()

    if (messageError) {
        console.error('Error sending message:', messageError)
        throw messageError
    }

    // Update the conversation's last message
    const { error: conversationError } = await supabase
        .from('conversations')
        .update({
            last_message: text,
            last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId)

    if (conversationError) {
        console.error('Error updating conversation:', conversationError)
        // Don't throw here, message was sent successfully
    }

    return message
}

/**
 * Mark a conversation as read
 */
export async function markConversationAsRead(conversationId: string): Promise<void> {
    const { error } = await supabase
        .from('conversations')
        .update({ unread: false })
        .eq('id', conversationId)

    if (error) {
        console.error('Error marking conversation as read:', error)
        throw error
    }
}

/**
 * Subscribe to real-time messages for a specific conversation
 */
export function subscribeToConversation(
    conversationId: string,
    callback: (message: Message) => void
): RealtimeChannel {
    const channel = supabase
        .channel(`messages-${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
                if (payload.new) {
                    callback(payload.new as Message)
                }
            }
        )
        .subscribe()

    return channel
}

/**
 * Subscribe to all conversation updates
 */
export function subscribeToConversations(callback: (conversation: Conversation) => void): RealtimeChannel {
    const channel = supabase
        .channel('conversations-changes')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'conversations',
            },
            (payload) => {
                if (payload.new) {
                    callback(payload.new as Conversation)
                }
            }
        )
        .subscribe()

    return channel
}
