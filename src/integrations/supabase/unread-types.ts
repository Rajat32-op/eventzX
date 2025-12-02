// Extended types for unread message tracking system
// These types extend the auto-generated Supabase types

export interface MessageRead {
  id: string;
  message_id: string;
  user_id: string;
  chat_id: string;
  chat_type: 'private' | 'group';
  read_at: string | null;
  created_at: string;
}

export interface UserChatMetadata {
  id: string;
  user_id: string;
  chat_id: string;
  chat_type: 'private' | 'group';
  unread_count: number;
  last_read_at: string | null;
  last_message_at: string | null;
  updated_at: string;
}

// RPC function parameter types
export interface MarkMessagesAsReadParams {
  p_user_id: string;
  p_chat_id: string;
  p_chat_type: 'private' | 'group';
}

export interface GetUnreadCountParams {
  p_user_id: string;
  p_chat_id: string;
  p_chat_type: 'private' | 'group';
}

export interface GetTotalUnreadCountParams {
  p_user_id: string;
}
