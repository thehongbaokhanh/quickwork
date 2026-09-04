import { computed, onScopeDispose, ref, toValue, type MaybeRefOrGetter } from 'vue'
import {
  ConversationService,
  type ConversationListItem,
  type ConversationMessage
} from '~/services/conversation.service'
import {
  getConversationError,
  mergeConversationMessages,
  sortConversations
} from '~/utils/conversation'

type LoadConversationOptions = {
  silent?: boolean
  targetID?: string | number
  preserveSelection?: boolean
  selectFirst?: boolean
}

export function useConversationChat(options: {
  currentUserID: MaybeRefOrGetter<string | number | null | undefined>
  conversationPageSize?: number
  messageLimit?: number
  pollInterval?: number
}) {
  const conversations = ref<ConversationListItem[]>([])
  const selectedConversationID = ref<number | null>(null)
  const messages = ref<ConversationMessage[]>([])
  const conversationsLoading = ref(false)
  const messagesLoading = ref(false)
  const loadingOlder = ref(false)
  const backgroundRefreshing = ref(false)
  const sending = ref(false)
  const conversationError = ref('')
  const messageError = ref('')
  const sendError = ref('')
  const nextBeforeID = ref<number | null>(null)
  const hasMoreMessages = ref(false)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  const selectedConversation = computed(() => (
    conversations.value.find(item => item.id === selectedConversationID.value) || null
  ))
  const currentUserID = computed(() => toValue(options.currentUserID))
  const canSendMessages = computed(() => Boolean(
    selectedConversation.value
    && selectedConversation.value.can_send_messages !== false
    && !selectedConversation.value.is_closed
  ))

  async function loadConversations(loadOptions: LoadConversationOptions = {}) {
    try {
      if (loadOptions.silent) backgroundRefreshing.value = true
      else conversationsLoading.value = true
      conversationError.value = ''

      const response = await ConversationService.list({
        page: 1,
        page_size: options.conversationPageSize || 50
      })
      const items = response?.success && Array.isArray(response.data?.items) ? response.data.items : []
      conversations.value = sortConversations(items)

      const previousID = selectedConversationID.value
      const requestedID = loadOptions.targetID === undefined ? null : Number(loadOptions.targetID)
      const targetID = loadOptions.preserveSelection ? previousID : (requestedID || previousID)
      const target = conversations.value.find(item => item.id === targetID)
        || (loadOptions.selectFirst === false ? null : conversations.value[0])
        || null

      if (!target) {
        selectedConversationID.value = null
        messages.value = []
        return null
      }

      const selectionChanged = target.id !== previousID
      selectedConversationID.value = target.id
      if (selectionChanged || !loadOptions.silent) {
        await loadMessages(target.id, { silent: loadOptions.silent })
        await markRead(target.id)
      }
      return target
    } catch (error: any) {
      if (!loadOptions.silent) {
        conversationError.value = getConversationError(error, 'Không thể tải danh sách hội thoại.')
      }
      return null
    } finally {
      conversationsLoading.value = false
      backgroundRefreshing.value = false
    }
  }

  async function selectConversation(conversation: ConversationListItem | number) {
    const id = typeof conversation === 'number' ? conversation : conversation.id
    if (!conversations.value.some(item => item.id === id)) return false
    selectedConversationID.value = id
    sendError.value = ''
    await loadMessages(id)
    await markRead(id)
    return true
  }

  async function loadMessages(conversationID = selectedConversationID.value, loadOptions: { silent?: boolean } = {}) {
    if (!conversationID) return false
    try {
      if (!loadOptions.silent) messagesLoading.value = true
      messageError.value = ''
      const response = await ConversationService.listMessages(conversationID, {
        limit: options.messageLimit || 30
      })
      const items = response?.success && Array.isArray(response.data?.items) ? response.data.items : []
      if (loadOptions.silent) {
        messages.value = mergeConversationMessages(messages.value, items)
      } else {
        messages.value = mergeConversationMessages([], items)
        nextBeforeID.value = response.data?.next_before_id || null
        hasMoreMessages.value = Boolean(response.data?.has_more)
      }
      return true
    } catch (error: any) {
      if (!loadOptions.silent) {
        messageError.value = getConversationError(error, 'Không thể tải nội dung hội thoại.')
        messages.value = []
      }
      return false
    } finally {
      messagesLoading.value = false
    }
  }

  async function loadOlderMessages() {
    const conversationID = selectedConversationID.value
    if (!conversationID || !hasMoreMessages.value || !nextBeforeID.value || loadingOlder.value) return false
    try {
      loadingOlder.value = true
      const response = await ConversationService.listMessages(conversationID, {
        before_id: nextBeforeID.value,
        limit: options.messageLimit || 30
      })
      const items = response?.success && Array.isArray(response.data?.items) ? response.data.items : []
      messages.value = mergeConversationMessages(items, messages.value)
      nextBeforeID.value = response.data?.next_before_id || null
      hasMoreMessages.value = Boolean(response.data?.has_more)
      return true
    } catch (error: any) {
      messageError.value = getConversationError(error, 'Không thể tải thêm tin nhắn cũ.')
      return false
    } finally {
      loadingOlder.value = false
    }
  }

  async function markRead(conversationID = selectedConversationID.value) {
    if (!conversationID) return false
    try {
      await ConversationService.markRead(conversationID)
      const conversation = conversations.value.find(item => item.id === conversationID)
      if (conversation) conversation.unread_count = 0
      messages.value = messages.value.map(message => (
        String(message.sender_id) === String(currentUserID.value)
          ? message
          : { ...message, is_read: true, read_at: message.read_at || new Date().toISOString() }
      ))
      return true
    } catch {
      return false
    }
  }

  async function sendMessage(rawContent: string) {
    const conversation = selectedConversation.value
    const content = rawContent.trim()
    sendError.value = ''
    if (!conversation || sending.value) return null
    if (!content) {
      sendError.value = 'Vui lòng nhập nội dung tin nhắn.'
      return null
    }
    if ([...content].length > 2000) {
      sendError.value = 'Tin nhắn chỉ được tối đa 2.000 ký tự.'
      return null
    }
    if (!canSendMessages.value) {
      sendError.value = conversation.locked_reason || 'Hội thoại hiện chỉ cho phép xem lịch sử.'
      return null
    }

    try {
      sending.value = true
      const response = await ConversationService.sendByConversation(conversation.id, { content })
      if (!response?.success || !response.data?.message) throw new Error(response?.message || 'Không thể gửi tin nhắn.')
      messages.value = mergeConversationMessages(messages.value, [response.data.message])
      await loadConversations({ silent: true, preserveSelection: true })
      return response.data.message
    } catch (error: any) {
      sendError.value = getConversationError(error, 'Không thể gửi tin nhắn. Vui lòng thử lại.')
      return null
    } finally {
      sending.value = false
    }
  }

  async function poll() {
    if (import.meta.client && document.hidden) return
    if (conversationsLoading.value || messagesLoading.value || loadingOlder.value || sending.value || backgroundRefreshing.value) return
    await loadConversations({ silent: true, preserveSelection: true })
    if (selectedConversationID.value) {
      await loadMessages(selectedConversationID.value, { silent: true })
      await markRead(selectedConversationID.value)
    }
  }

  function startPolling() {
    if (!import.meta.client || pollTimer) return
    pollTimer = setInterval(poll, options.pollInterval || 5000)
  }

  function stopPolling() {
    if (!pollTimer) return
    clearInterval(pollTimer)
    pollTimer = null
  }

  onScopeDispose(stopPolling)

  return {
    conversations,
    selectedConversation,
    selectedConversationID,
    messages,
    conversationsLoading,
    messagesLoading,
    loadingOlder,
    backgroundRefreshing,
    sending,
    conversationError,
    messageError,
    sendError,
    hasMoreMessages,
    canSendMessages,
    loadConversations,
    selectConversation,
    loadMessages,
    loadOlderMessages,
    markRead,
    sendMessage,
    startPolling,
    stopPolling
  }
}
