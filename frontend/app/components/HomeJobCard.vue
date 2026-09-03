<template>
  <article
    :class="[
      'group relative flex h-[248px] min-h-[248px] cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white p-4 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
      active
        ? 'border-sky-400 bg-sky-50/60 shadow-xl shadow-sky-100/70 ring-2 ring-sky-100'
        : primarySignal?.cardClass || 'border-slate-200 shadow-sm shadow-slate-200/45 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-200/70'
    ]"
    :style="!primarySignal && !active ? { borderColor: jobTypeMeta.border } : undefined"
  >
    <div
      v-if="primarySignal"
      :class="['pointer-events-none absolute inset-y-0 left-0 w-1', primarySignal.accentClass]"
      aria-hidden="true"
    />
    <div class="mb-3 flex min-h-6 flex-wrap items-center gap-1.5">
      <span
        v-for="signal in signals"
        :key="signal.key"
        :class="['inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide', signal.badgeClass]"
        :title="signal.title"
      >
        <Icon :name="signal.icon" class="h-3.5 w-3.5" aria-hidden="true" />
        {{ signal.label }}
      </span>
    </div>
    <div class="flex min-w-0 gap-4">
      <span
        :class="[
          'flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-sm font-extrabold text-white shadow-sm',
          job.logoClass
        ]"
      >
        <HomeCompanyLogo :logo-url="job.logoUrl" :company-name="job.company" :initials="job.logo" />
      </span>

      <div class="min-w-0">
        <span
          class="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold"
          :style="{ backgroundColor: jobTypeMeta.border, color: jobTypeMeta.text }"
        >
          <Icon :name="jobTypeMeta.icon" class="h-3.5 w-3.5" aria-hidden="true" />
          <span class="truncate">{{ job.type }}</span>
        </span>

        <h3 class="mt-2 line-clamp-1 text-[17px] font-extrabold leading-6">
          <NuxtLink
            :to="`/jobs/${job.id}`"
            class="cursor-pointer text-slate-950 decoration-sky-300 underline-offset-4 transition hover:text-sky-700 hover:underline focus:outline-none focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-sky-100"
            :title="job.title"
            @mouseenter.stop="emitPreview"
            @mouseleave.stop="emitPreviewClose"
            @focus="emitPreview"
            @blur="emitPreviewClose"
          >
            {{ job.title }}
          </NuxtLink>
        </h3>

        <p class="mt-2 truncate text-sm font-semibold text-slate-500">
          {{ job.company }}
        </p>
      </div>
    </div>

    <div class="mt-4 flex min-h-7 min-w-0 flex-nowrap gap-2 text-sm font-bold text-slate-700">
      <span class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
        <Icon name="uil:money-bill" class="h-4 w-4 text-sky-600" aria-hidden="true" />
        {{ job.salary }}
      </span>
      <span class="inline-flex min-w-0 items-center gap-1.5 overflow-hidden rounded-full bg-slate-100 px-3 py-1" :title="job.location">
        <Icon name="uil:map-marker" class="h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
        <span class="truncate">{{ displayLocation }}</span>
      </span>
    </div>

    <div class="mt-auto flex min-h-12 shrink-0 items-end justify-between gap-3 border-t border-slate-100 pt-3">
      <JobMatchScoreBadge
        :job="job"
        @open-change="emit('matchTooltipChange', job.id, $event)"
      />
      <button
        type="button"
        :class="[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-70',
          isFavorite
            ? 'border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100'
            : 'border-sky-100 bg-white text-sky-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
        ]"
        :disabled="isFavoriteLoading"
        :aria-label="`${isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'} việc ${job.title}`"
        :aria-pressed="isFavorite"
        @click.stop="$emit('save', job)"
      >
        <Icon :name="isFavoriteLoading ? 'svg-spinners:180-ring' : 'uil:heart'" class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HomeCompanyLogo from '~/components/home/CompanyLogo.vue'
import JobMatchScoreBadge from '~/components/JobMatchScoreBadge.vue'
import { type DisplayJob, formatJobLocation } from '~/utils/jobDisplay'
import type { JobVisualSignal } from '~/utils/jobSignals'
import { getJobTypeMeta } from '~/utils/jobTypeMeta'

const props = defineProps<{
  job: DisplayJob
  active?: boolean
  isFavorite?: boolean
  isFavoriteLoading?: boolean
  signals?: JobVisualSignal[]
}>()

const emit = defineEmits<{
  save: [job: DisplayJob]
  preview: [job: DisplayJob, anchor: PreviewAnchor]
  previewClose: []
  matchTooltipChange: [jobId: number, open: boolean]
}>()

const jobTypeMeta = computed(() => getJobTypeMeta(props.job.type))
const displayLocation = computed(() => formatJobLocation(props.job.location))
const signals = computed(() => props.signals || [])
const primarySignal = computed(() => signals.value[0])

interface PreviewAnchor {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

function emitPreview(event: MouseEvent | FocusEvent) {
  const target = event.currentTarget
  if (!(target instanceof HTMLElement)) return

  const card = target.closest('article')
  const rect = (card instanceof HTMLElement ? card : target).getBoundingClientRect()
  emit('preview', props.job, {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height
  })
}

function emitPreviewClose() {
  emit('previewClose')
}
</script>
