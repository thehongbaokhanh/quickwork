<template>
  <NuxtLink
    to="/"
    :class="[
      'inline-flex items-center rounded-2xl bg-white shadow-sm ring-1 ring-white/10 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40',
      compact ? 'px-2.5 py-2' : 'px-3 py-2.5'
    ]"
    :aria-label="`${systemName} - về trang chủ`"
  >
    <img
      src="/images/brand/quickwork-wordmark-transparent.png"
      :alt="systemName"
      :class="compact ? 'h-8 w-auto object-contain' : 'h-10 w-auto object-contain'"
    >
  </NuxtLink>
</template>

<script setup lang="ts">
const { systemName } = usePlatformSettings()

withDefaults(defineProps<{
  compact?: boolean
}>(), {
  compact: false
})
</script>
