<template>
  <img
    v-if="resolvedLogoUrl && !loadFailed"
    :src="resolvedLogoUrl"
    :alt="`Logo ${companyName}`"
    class="h-full w-full bg-white object-contain p-1.5"
    @error="loadFailed = true"
  >
  <template v-else>{{ initials }}</template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  logoUrl?: string
  companyName: string
  initials: string
}>()

const config = useRuntimeConfig()
const loadFailed = ref(false)

const resolvedLogoUrl = computed(() => {
  const source = String(props.logoUrl || '').trim()
  if (!source) return ''
  if (/^(?:https?:)?\/\//i.test(source) || source.startsWith('data:') || source.startsWith('blob:')) return source
  const backendOrigin = String(config.public.apiBase || '').replace(/\/api\/v1\/?$/, '')
  return `${backendOrigin}${source.startsWith('/') ? '' : '/'}${source}`
})

watch(() => props.logoUrl, () => {
  loadFailed.value = false
})
</script>
