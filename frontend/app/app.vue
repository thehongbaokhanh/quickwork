<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToast />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'

const route = useRoute()
const { systemName, loadPlatformSettings } = usePlatformSettings()

useHead(() => ({
  titleTemplate: title => title ? `${title} | ${systemName.value}` : systemName.value
}))

onMounted(() => {
  // /admin/settings already returns the same platform aggregate in its single
  // required GET, so starting there must not make a duplicate public request.
  if (route.path !== '/admin/settings') void loadPlatformSettings()
})

watch(() => route.path, (path) => {
  if (path !== '/admin/settings') void loadPlatformSettings()
})
</script>
