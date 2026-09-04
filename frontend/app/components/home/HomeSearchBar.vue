<template>
  <form
    class="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/70"
    role="search"
    aria-label="Tìm kiếm việc làm"
    @submit.prevent="$emit('submit')"
  >
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="flex min-h-[56px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100">
        <span class="sr-only">Vị trí, kỹ năng hoặc công ty</span>
        <Icon name="uil:search" class="h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
        <input
          :value="modelValue.keyword"
          type="search"
          class="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Vị trí, kỹ năng, công ty"
          autocomplete="off"
          @input="handleInput('keyword', $event)"
        >
      </label>

      <label class="flex min-h-[56px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100">
        <span class="sr-only">Địa điểm</span>
        <Icon name="uil:map-marker" class="h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
        <input
          :value="modelValue.location"
          type="search"
          class="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Địa điểm"
          autocomplete="off"
          @input="handleInput('location', $event)"
        >
      </label>

      <div class="relative" @click.stop>
        <button
          type="button"
          class="flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-left transition hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus-visible:border-sky-300 focus-visible:ring-4 focus-visible:ring-sky-100"
          aria-label="Loại hình công việc"
          aria-haspopup="listbox"
          :aria-expanded="isTypeMenuOpen"
          aria-controls="home-search-type-menu"
          @click="isTypeMenuOpen = !isTypeMenuOpen"
          @keydown.escape="isTypeMenuOpen = false"
        >
          <Icon name="uil:briefcase-alt" class="h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <span class="min-w-0 flex-1 truncate text-[15px] font-bold text-slate-900">
            {{ modelValue.type }}
          </span>
          <Icon
            name="uil:angle-down"
            :class="['h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200', isTypeMenuOpen ? 'rotate-180' : '']"
            aria-hidden="true"
          />
        </button>

        <div
          v-if="isTypeMenuOpen"
          id="home-search-type-menu"
          class="home-search-type-menu absolute left-0 top-[calc(100%+8px)] z-40 max-h-[116px] w-full overflow-y-auto rounded-[22px] border border-slate-200 bg-white p-1 shadow-2xl shadow-slate-200/70"
          role="listbox"
        >
          <button
            v-for="option in jobTypeOptions"
            :key="option"
            type="button"
            :class="[
              'flex h-[52px] w-full items-center gap-3 px-4 text-left text-[15px] font-bold transition first:rounded-t-[18px] last:rounded-b-[18px] focus:outline-none focus-visible:bg-sky-50 focus-visible:ring-4 focus-visible:ring-sky-100',
              modelValue.type === option
                ? 'bg-sky-50 text-sky-700'
                : 'bg-white text-slate-800 hover:bg-sky-50 hover:text-sky-700'
            ]"
            role="option"
            :aria-selected="modelValue.type === option"
            @click="selectType(option)"
          >
            <Icon name="uil:briefcase-alt" class="h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
            <span class="truncate">{{ option }}</span>
          </button>
        </div>
      </div>

      <button
        type="submit"
        class="inline-flex min-h-[56px] min-w-[120px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-sky-600 px-7 text-[15px] font-bold text-white transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
      >
        <Icon name="uil:search" class="h-5 w-5" aria-hidden="true" />
        Tìm kiếm
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { HomeSearchState } from '~/composables/useHomeJobs'

const props = defineProps<{
  modelValue: HomeSearchState
  jobTypeOptions: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: HomeSearchState]
  submit: []
}>()

const isTypeMenuOpen = ref(false)

function handleInput(key: keyof HomeSearchState, event: Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: target.value
  })
}

function selectType(type: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    type
  })
  isTypeMenuOpen.value = false
}

function closeTypeMenu() {
  isTypeMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('click', closeTypeMenu)
})

onUnmounted(() => {
  window.removeEventListener('click', closeTypeMenu)
})
</script>

<style scoped>
.home-search-type-menu {
  scrollbar-color: #bae6fd #f8fafc;
  scrollbar-width: thin;
}

.home-search-type-menu::-webkit-scrollbar {
  width: 6px;
}

.home-search-type-menu::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.home-search-type-menu::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 999px;
}

.home-search-type-menu::-webkit-scrollbar-thumb {
  background: #bae6fd;
  border-radius: 999px;
}

.home-search-type-menu::-webkit-scrollbar-thumb:hover {
  background: #38bdf8;
}
</style>
