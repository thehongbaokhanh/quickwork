<template>
  <EnterpriseMessageCenter :initial-conversation-id="conversationId" />
</template>

<script setup lang="ts">
const route = useRoute()
const conversationId = computed(() => String(route.params.id || ''))
</script>
