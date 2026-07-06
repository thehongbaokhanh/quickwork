<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/admin/dashboard')
    }
  ]
})
</script>

<template>
  <div></div>
</template>
