<template>
  <span v-if="job.isPersonalized" class="relative inline-flex" @click.stop>
    <button
      ref="triggerRef"
      type="button"
      :class="[
        'inline-flex items-center gap-1.5 rounded-full border px-3 font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
        compact ? 'h-8 text-xs' : 'h-9 text-xs',
        scoreTone.badge
      ]"
      :aria-describedby="tooltipId"
      :aria-label="`${scorePercent}% phù hợp. Trỏ chuột hoặc focus để xem cách tính điểm.`"
      @mouseenter="handleTriggerEnter"
      @mouseleave="handleTriggerLeave"
      @focus="handleTriggerFocus"
      @blur="handleTriggerBlur"
      @click.stop="openTooltip"
      @keydown.esc.stop="closeTooltip"
    >
      <Icon name="uil:check-circle" class="h-4 w-4" aria-hidden="true" />
      {{ scorePercent }}% phù hợp
      <Icon name="uil:info-circle" class="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
    </button>

    <Teleport to="body">
      <span
        v-if="isOpen"
        :id="tooltipId"
        ref="tooltipRef"
        role="tooltip"
        class="fixed z-[100] max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xl shadow-slate-300/70"
        :style="tooltipStyle"
        @mouseenter="handleTooltipEnter"
        @mouseleave="handleTooltipLeave"
        @click.stop
      >
        <span class="flex items-start justify-between gap-3">
          <span>
            <span class="block text-sm font-black text-slate-950">Cách tính điểm phù hợp</span>
            <span class="mt-0.5 block text-[11px] font-semibold text-slate-500">Điểm từng tiêu chí trên thang 10.</span>
          </span>
          <span :class="['rounded-full px-2.5 py-1 text-xs font-black', scoreTone.summary]">{{ matchScore }}/10</span>
        </span>

        <span class="mt-3 block space-y-2">
          <span v-for="criterion in criteria" :key="criterion.key" class="block">
            <span class="flex items-center justify-between gap-3 text-[11px] font-bold">
              <span class="text-slate-600">{{ criterion.label }}</span>
              <span class="text-slate-950">{{ criterion.score }}/10</span>
            </span>
            <span class="mt-1 block h-1.5 overflow-hidden rounded-full bg-slate-100">
              <span class="block h-full rounded-full bg-sky-500" :style="{ width: `${criterion.score * 10}%` }" />
            </span>
          </span>
        </span>

        <span v-if="job.matchStrengths?.length" class="mt-3 block border-t border-slate-100 pt-3 text-[11px] leading-5 text-emerald-700">
          <strong>Điểm mạnh:</strong> {{ job.matchStrengths.join('; ') }}
        </span>
        <span v-if="job.matchGaps?.length" class="mt-1 block text-[11px] leading-5 text-amber-700">
          <strong>Cần cải thiện:</strong> {{ job.matchGaps.join('; ') }}
        </span>
      </span>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import type { DisplayJob, JobMatchBreakdown } from '~/utils/jobDisplay'

const props = withDefaults(defineProps<{
  job: DisplayJob
  align?: 'left' | 'right'
  compact?: boolean
}>(), {
  align: 'left',
  compact: false
})

const emit = defineEmits<{
  openChange: [open: boolean]
}>()

const tooltipId = `job-match-${useId()}`
const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})
const isOpen = ref(false)
const isTriggerHovered = ref(false)
const isTriggerFocused = ref(false)
const isTooltipHovered = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

const definitions: Array<{ key: keyof JobMatchBreakdown; label: string }> = [
  { key: 'location', label: 'Địa điểm' },
  { key: 'category', label: 'Ngành nghề' },
  { key: 'salary', label: 'Mức lương' },
  { key: 'jobType', label: 'Loại hình' },
  { key: 'skills', label: 'Kỹ năng' },
  { key: 'experience', label: 'Kinh nghiệm' },
  { key: 'education', label: 'Học vấn' }
]

const matchScore = computed(() => roundOne(props.job.matchScore || 0))
const scorePercent = computed(() => Math.round(matchScore.value * 10))
const criteria = computed(() => definitions.map((definition) => {
  const score = roundOne(props.job.matchBreakdown?.[definition.key] || 0)
  return {
    ...definition,
    score
  }
}))
const scoreTone = computed(() => {
  if (matchScore.value >= 8) return { badge: 'border-emerald-200 bg-emerald-50 text-emerald-700', summary: 'bg-emerald-50 text-emerald-700' }
  if (matchScore.value >= 6.5) return { badge: 'border-sky-200 bg-sky-50 text-sky-700', summary: 'bg-sky-50 text-sky-700' }
  if (matchScore.value >= 5) return { badge: 'border-amber-200 bg-amber-50 text-amber-700', summary: 'bg-amber-50 text-amber-700' }
  return { badge: 'border-rose-200 bg-rose-50 text-rose-700', summary: 'bg-rose-50 text-rose-700' }
})

function roundOne(value: number) {
  return Math.round(value * 10) / 10
}

function clearCloseTimer() {
  if (!closeTimer) return
  clearTimeout(closeTimer)
  closeTimer = null
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum))
}

function updateTooltipPosition() {
  if (!isOpen.value || !triggerRef.value || !tooltipRef.value) return

  const viewportMargin = 12
  const tooltipGap = 10
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const tooltipWidth = Math.min(320, viewportWidth - viewportMargin * 2)
  const tooltipHeight = tooltipRect.height
  const canOpenAbove = triggerRect.top >= tooltipHeight + tooltipGap + viewportMargin
  const preferredTop = canOpenAbove
    ? triggerRect.top - tooltipHeight - tooltipGap
    : triggerRect.bottom + tooltipGap
  const preferredLeft = props.align === 'right'
    ? triggerRect.right - tooltipWidth
    : triggerRect.left

  tooltipStyle.value = {
    top: `${Math.round(clamp(preferredTop, viewportMargin, viewportHeight - tooltipHeight - viewportMargin))}px`,
    left: `${Math.round(clamp(preferredLeft, viewportMargin, viewportWidth - tooltipWidth - viewportMargin))}px`,
    width: `${Math.round(tooltipWidth)}px`
  }
}

async function openTooltip() {
  clearCloseTimer()
  if (!isOpen.value) {
    isOpen.value = true
    emit('openChange', true)
  }

  await nextTick()
  if (isOpen.value) updateTooltipPosition()
}

function closeTooltip() {
  clearCloseTimer()
  if (!isOpen.value) return
  isOpen.value = false
  emit('openChange', false)
}

function scheduleClose() {
  clearCloseTimer()
  closeTimer = setTimeout(() => {
    if (isTriggerHovered.value || isTriggerFocused.value || isTooltipHovered.value) return
    closeTooltip()
  }, 180)
}

function handleTriggerEnter() {
  isTriggerHovered.value = true
  void openTooltip()
}

function handleTriggerLeave() {
  isTriggerHovered.value = false
  scheduleClose()
}

function handleTriggerFocus() {
  isTriggerFocused.value = true
  void openTooltip()
}

function handleTriggerBlur() {
  isTriggerFocused.value = false
  scheduleClose()
}

function handleTooltipEnter() {
  isTooltipHovered.value = true
  clearCloseTimer()
}

function handleTooltipLeave() {
  isTooltipHovered.value = false
  scheduleClose()
}

onMounted(() => {
  window.addEventListener('resize', updateTooltipPosition)
  window.addEventListener('scroll', updateTooltipPosition, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateTooltipPosition)
  window.removeEventListener('scroll', updateTooltipPosition, true)
  closeTooltip()
})
</script>
