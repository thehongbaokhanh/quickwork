<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="fixed inset-0 bg-gray-500/70 transition-opacity" @click="emit('cancel')"></div>

    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg p-6">
        <div class="sm:flex sm:items-start">
          <div :class="[
            'mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10',
            isDanger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
          ]">
            <Icon :name="isDanger ? 'uil:exclamation-triangle' : 'uil:info-circle'" class="w-6 h-6" />
          </div>
          <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 class="text-base font-semibold leading-6 text-gray-900">{{ title }}</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">{{ message }}</p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
          <button
            type="button"
            :class="[
              'inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm sm:w-auto transition-colors',
              isDanger ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
            ]"
            @click="emit('confirm')"
          >
            Xác nhận
          </button>
          <button
            type="button"
            class="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            @click="emit('cancel')"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  title: string
  message: string
  isDanger?: boolean
}

withDefaults(defineProps<Props>(), {
  isDanger: false
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>