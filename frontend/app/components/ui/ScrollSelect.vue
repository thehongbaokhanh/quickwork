<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      :class="[
        'flex w-full items-center gap-3 border bg-white text-left font-black shadow-sm transition focus:outline-none focus-visible:ring-4',
        sizeClass,
        toneClasses.button
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
      <Icon v-if="icon" :name="icon" :class="['h-5 w-5 shrink-0', toneClasses.icon]" aria-hidden="true" />
      <span class="min-w-0 flex-1 truncate">{{ selectedLabel }}</span>
      <Icon
        name="uil:angle-down"
        :class="['h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200', isOpen ? 'rotate-180' : '']"
        aria-hidden="true"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      :enter-from-class="menuTransitionOffsetClass"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      :leave-to-class="menuTransitionOffsetClass"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute left-0 right-0 z-40 overflow-hidden border bg-white shadow-2xl shadow-slate-200/70 ring-1 ring-slate-950/5',
          menuPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          menuRadiusClass,
          toneClasses.menu
        ]"
      >
        <div class="quickwork-scroll-select max-h-56 overflow-y-auto" role="listbox" :aria-label="ariaLabel">
          <button
            v-for="(option, optionIndex) in options"
            :key="String(option.value)"
            type="button"
            :class="[
              'flex w-full items-center gap-3 px-3 text-left text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
              optionSizeClass,
              optionIndex < options.length - 1 ? 'border-b border-slate-100' : '',
              option.value === modelValue
                ? toneClasses.optionActive
                : ['text-slate-700', toneClasses.optionHover]
            ]"
            role="option"
            :aria-selected="option.value === modelValue"
            @click="selectOption(option.value)"
          >
            <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
            <Icon
              v-if="option.value === modelValue"
              name="uil:check"
              :class="['h-5 w-5 shrink-0', toneClasses.check]"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

type SelectTone = 'sky' | 'slate' | 'amber' | 'rose' | 'emerald'
type SelectValue = string | number

const props = withDefaults(defineProps<{
  modelValue: SelectValue
  options: Array<{ value: SelectValue; label: string }>
  ariaLabel: string
  icon?: string
  size?: 'md' | 'sm' | 'filter'
  tone?: SelectTone
}>(), {
  icon: '',
  size: 'md',
  tone: 'sky'
})

const emit = defineEmits<{
  'update:modelValue': [value: SelectValue]
}>()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const menuPlacement = ref<'top' | 'bottom'>('bottom')

const MAX_MENU_HEIGHT = 224
const MENU_OFFSET = 12

const selectedLabel = computed(() => {
  const selected = props.options.find((option) => option.value === props.modelValue)
  return selected?.label || props.options[0]?.label || 'Chọn'
})

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'h-10 rounded-xl px-3 text-sm'
  if (props.size === 'filter') return 'h-11 rounded-md px-3 text-sm'
  return 'h-12 rounded-2xl px-4 text-sm'
})

const optionSizeClass = computed(() => {
  if (props.size === 'sm') return 'min-h-10'
  if (props.size === 'filter') return 'min-h-11'
  return 'min-h-12'
})

const menuRadiusClass = computed(() => props.size === 'filter' ? 'rounded-md' : 'rounded-2xl')

const menuTransitionOffsetClass = computed(() => (
  menuPlacement.value === 'top' ? 'translate-y-1 opacity-0' : '-translate-y-1 opacity-0'
))

const toneClasses = computed(() => {
  const classes: Record<SelectTone, {
    button: string
    icon: string
    menu: string
    optionActive: string
    optionHover: string
    check: string
  }> = {
    sky: {
      button: 'border-slate-200 text-slate-700 hover:border-sky-200 hover:bg-sky-50 focus-visible:border-sky-300 focus-visible:ring-sky-100',
      icon: 'text-sky-600',
      menu: 'border-sky-200',
      optionActive: 'bg-sky-50 text-sky-700',
      optionHover: 'hover:bg-sky-50 hover:text-sky-700',
      check: 'text-sky-600'
    },
    slate: {
      button: 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:border-slate-400 focus-visible:ring-slate-100',
      icon: 'text-slate-600',
      menu: 'border-slate-200',
      optionActive: 'bg-slate-900 text-white',
      optionHover: 'hover:bg-slate-50 hover:text-slate-950',
      check: 'text-white'
    },
    amber: {
      button: 'border-amber-100 text-slate-700 hover:border-amber-200 hover:bg-amber-50 focus-visible:border-amber-300 focus-visible:ring-amber-100',
      icon: 'text-amber-600',
      menu: 'border-amber-200',
      optionActive: 'bg-amber-50 text-amber-700',
      optionHover: 'hover:bg-amber-50 hover:text-amber-700',
      check: 'text-amber-600'
    },
    rose: {
      button: 'border-rose-100 text-slate-700 hover:border-rose-200 hover:bg-rose-50 focus-visible:border-rose-300 focus-visible:ring-rose-100',
      icon: 'text-rose-600',
      menu: 'border-rose-200',
      optionActive: 'bg-rose-50 text-rose-700',
      optionHover: 'hover:bg-rose-50 hover:text-rose-700',
      check: 'text-rose-600'
    },
    emerald: {
      button: 'border-emerald-100 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 focus-visible:border-emerald-300 focus-visible:ring-emerald-100',
      icon: 'text-emerald-600',
      menu: 'border-emerald-200',
      optionActive: 'bg-emerald-50 text-emerald-700',
      optionHover: 'hover:bg-emerald-50 hover:text-emerald-700',
      check: 'text-emerald-600'
    }
  }

  return classes[props.tone]
})

function estimatedMenuHeight() {
  const itemHeight = props.size === 'sm' ? 40 : props.size === 'filter' ? 44 : 48
  return Math.min(Math.max(props.options.length, 1) * itemHeight, MAX_MENU_HEIGHT)
}

function updateMenuPlacement() {
  const rect = rootRef.value?.getBoundingClientRect()
  if (!rect) return

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight
  const spaceBelow = viewportHeight - rect.bottom
  const spaceAbove = rect.top
  const requiredSpace = estimatedMenuHeight() + MENU_OFFSET

  menuPlacement.value = spaceBelow < requiredSpace && spaceAbove > spaceBelow ? 'top' : 'bottom'
}

async function openMenu() {
  isOpen.value = true
  await nextTick()
  updateMenuPlacement()
}

function closeMenu() {
  isOpen.value = false
}

function toggleMenu() {
  if (isOpen.value) {
    closeMenu()
    return
  }

  openMenu()
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

function handleWindowChange() {
  if (isOpen.value) updateMenuPlacement()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('resize', handleWindowChange)
  window.addEventListener('scroll', handleWindowChange, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('resize', handleWindowChange)
  window.removeEventListener('scroll', handleWindowChange, true)
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
