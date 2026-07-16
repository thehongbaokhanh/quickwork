<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      :class="[
        'flex w-full items-center gap-3 border border-slate-200 bg-white text-left font-black text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus-visible:border-sky-300 focus-visible:ring-4 focus-visible:ring-sky-100',
        size === 'sm' ? 'h-10 rounded-xl px-3 text-sm' : 'h-12 rounded-2xl px-4 text-sm'
      ]"
      :aria-label="ariaLabel"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click.stop="toggleMenu"
      @keydown.down.prevent="openMenu"
      @keydown.enter.prevent="toggleMenu"
      @keydown.space.prevent="toggleMenu"
      @keydown.escape.stop="closeMenu"
    >
      <Icon v-if="icon" :name="icon" class="h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
      <span class="min-w-0 flex-1 truncate">{{ selectedLabel }}</span>
      <Icon
        name="uil:angle-down"
        :class="['h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200', isOpen ? 'rotate-180' : '']"
        aria-hidden="true"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-1 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-2xl shadow-slate-200/70 ring-1 ring-slate-950/5"
      >
        <div class="quickwork-scroll-select max-h-56 overflow-y-auto pr-1" role="listbox" :aria-label="ariaLabel">
          <button
            v-for="option in options"
            :key="String(option.value)"
            type="button"
            :class="[
              'flex w-full items-center gap-3 px-3 text-left text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
              size === 'sm' ? 'min-h-10 rounded-xl' : 'min-h-12 rounded-2xl',
              option.value === modelValue
                ? 'bg-sky-50 text-sky-700'
                : 'text-slate-700 hover:bg-slate-50 hover:text-sky-700'
            ]"
            role="option"
            :aria-selected="option.value === modelValue"
            @click="selectOption(option.value)"
          >
            <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
            <Icon
              v-if="option.value === modelValue"
              name="uil:check"
              class="h-5 w-5 shrink-0 text-sky-600"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type SelectValue = string | number

const props = withDefaults(defineProps<{
  modelValue: SelectValue
  options: Array<{ value: SelectValue; label: string }>
  ariaLabel: string
  icon?: string
  size?: 'md' | 'sm'
}>(), {
  icon: '',
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: SelectValue]
}>()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const selectedLabel = computed(() => {
  const selected = props.options.find((option) => option.value === props.modelValue)
  return selected?.label || props.options[0]?.label || 'Chọn'
})

function openMenu() {
  isOpen.value = true
}

function closeMenu() {
  isOpen.value = false
}

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function selectOption(value: SelectValue) {
  emit('update:modelValue', value)
  closeMenu()
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Node)) return
  if (!rootRef.value?.contains(target)) closeMenu()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
.quickwork-scroll-select {
  scrollbar-color: #bae6fd #f8fafc;
  scrollbar-width: thin;
}

.quickwork-scroll-select::-webkit-scrollbar {
  width: 8px;
}

.quickwork-scroll-select::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.quickwork-scroll-select::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 999px;
}

.quickwork-scroll-select::-webkit-scrollbar-thumb {
  background: #bae6fd;
  border: 2px solid #f8fafc;
  border-radius: 999px;
}

.quickwork-scroll-select::-webkit-scrollbar-thumb:hover {
  background: #38bdf8;
}
</style>
