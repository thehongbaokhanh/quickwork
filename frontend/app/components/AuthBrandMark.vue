<template>
  <NuxtLink
    to="/"
    class="inline-flex items-center gap-3 rounded-lg outline-none transition focus-visible:ring-4 focus-visible:ring-sky-100"
    :aria-label="`${systemName} - về trang chủ`"
  >
    <img
      src="/images/brand/quickwork-wordmark-transparent.png"
      :alt="systemName"
      class="h-12 w-auto object-contain"
    >
  </NuxtLink>
</template>

<script setup lang="ts">
const { systemName } = usePlatformSettings()
</script>
