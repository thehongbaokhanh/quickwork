import apiClient from './api'

export type ConversationApplicationStatus = 'APPLIED' | 'ACCEPTED' | 'REJECTED'
export type ConversationInterviewResult = 'HIRED' | 'REJECTED' | 'NO_SHOW' | ''

export interface ConversationParticipant {
  id: number
  name: string
  avatar?: string
}

export interface ConversationJobSummary {
  id: number
  title: string
}

export interface ConversationMessage {
  id: number
  conversation_id?: number
  sender_id: number
  receiver_id?: number
  type: 'TEXT' | 'SYSTEM'
  content: string
  is_read: boolean
  read_at?: string
  created_at: string
  updated_at?: string
}

export interface ConversationListItem {
  id: number
  job_application_id: number
  job: ConversationJobSummary
  participant: ConversationParticipant
  application_status: ConversationApplicationStatus
  interview_result?: ConversationInterviewResult
  last_message?: ConversationMessage
  unread_count: number
  is_closed: boolean
  can_send_messages: boolean
  locked_reason?: string
  last_message_at?: string
}

export interface PagePagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface ConversationListResult {
  items: ConversationListItem[]
  pagination: PagePagination
}

export interface MessageCursorResult {
  items: ConversationMessage[]
  next_before_id?: number | null
  has_more: boolean
}

export interface OpenConversationResult {
  id: number
  job_application_id: number
}

export interface SendMessageResult {
  conversation: OpenConversationResult
  message: ConversationMessage
}

export interface ConversationApiResponse<T> {
  success: boolean
  message?: string
  data: T
  errors?: { code?: string } | string
}

export interface ConversationListParams {
  page?: number
  page_size?: number
}

export interface MessageCursorParams {
  before_id?: number
  limit?: number
}

export const ConversationService = {
  list(params: ConversationListParams = {}) {
    return apiClient.get<ConversationApiResponse<ConversationListResult>>('/conversations', { query: params })
  },

  unreadCount() {
    return apiClient.get<ConversationApiResponse<{ unread_count: number }>>('/conversations/unread-count')
  },

  openByApplication(applicationId: string | number) {
    return apiClient.post<ConversationApiResponse<OpenConversationResult>>(`/job-applications/${applicationId}/conversation`)
  },

  listMessages(conversationId: string | number, params: MessageCursorParams = {}) {
    return apiClient.get<ConversationApiResponse<MessageCursorResult>>(`/conversations/${conversationId}/messages`, { query: params })
  },

  sendByApplication(applicationId: string | number, body: { content: string }) {
    return apiClient.post<ConversationApiResponse<SendMessageResult>>(`/job-applications/${applicationId}/messages`, body)
  },

  sendByConversation(conversationId: string | number, body: { content: string }) {
    return apiClient.post<ConversationApiResponse<SendMessageResult>>(`/conversations/${conversationId}/messages`, body)
  },

  markRead(conversationId: string | number) {
    return apiClient.put<ConversationApiResponse<{ updated_messages: number }>>(`/conversations/${conversationId}/read`)
  }
}
