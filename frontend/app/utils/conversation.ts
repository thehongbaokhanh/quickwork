import type { ConversationListItem, ConversationMessage } from '~/services/conversation.service'

export function conversationTimestamp(conversation: ConversationListItem) {
  return new Date(conversation.last_message_at || conversation.last_message?.created_at || 0).getTime()
}

export function sortConversations(items: ConversationListItem[]) {
  return [...items].sort((first, second) => conversationTimestamp(second) - conversationTimestamp(first))
}

export function mergeConversationMessages(current: ConversationMessage[], incoming: ConversationMessage[]) {
  const byID = new Map<number, ConversationMessage>()
  for (const message of [...current, ...incoming]) {
    if (message?.id) byID.set(Number(message.id), message)
  }
  return [...byID.values()].sort((first, second) => {
    const byID = Number(first.id) - Number(second.id)
    if (byID !== 0) return byID
    return new Date(first.created_at || 0).getTime() - new Date(second.created_at || 0).getTime()
  })
}

export function isOwnConversationMessage(message: ConversationMessage | undefined, currentUserID: string | number | null | undefined) {
  if (!message || currentUserID === null || currentUserID === undefined || currentUserID === '') return false
  return String(message.sender_id) === String(currentUserID)
}

export function formatConversationTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const isSameDay = date.toDateString() === now.toDateString()
  return date.toLocaleString('vi-VN', isSameDay
    ? { hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: '2-digit' })
}

export function formatMessageTime(value?: string, includeDate = false) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const isSameDay = date.toDateString() === now.toDateString()
  if (!includeDate && isSameDay) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    ...(includeDate ? { year: 'numeric' } : {})
  })
}

export function getConversationError(error: any, fallback: string) {
  const code = error?.data?.errors?.code || error?.data?.error?.code
  const messages: Record<string, string> = {
    MESSAGE_CONTENT_REQUIRED: 'Vui lòng nhập nội dung tin nhắn.',
    MESSAGE_CONTENT_TOO_LONG: 'Tin nhắn chỉ được tối đa 2.000 ký tự.',
    CONVERSATION_FORBIDDEN: 'Bạn không có quyền truy cập hội thoại này.',
    CONVERSATION_CLOSED: 'Hội thoại hiện chỉ cho phép xem lịch sử.',
    CONVERSATION_NOT_FOUND: 'Không tìm thấy hội thoại hoặc hội thoại đã bị xóa.'
  }
  return messages[String(code || '')] || error?.data?.message || error?.message || fallback
}
