<template>
  <article
    :class="[
      'group relative flex min-h-[188px] cursor-pointer flex-col rounded-2xl border bg-white p-4 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
      active
        ? 'border-sky-400 bg-sky-50/60 shadow-xl shadow-sky-100/70 ring-2 ring-sky-100'
        : 'border-slate-200 shadow-sm shadow-slate-200/45 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-200/70'
    ]"
    :style="{ borderColor: jobTypeMeta.border }"
  >
    <div class="flex min-w-0 gap-4">
      <span
        :class="[
          'flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-sm font-extrabold text-white shadow-sm',
          job.logoClass
        ]"
      >
        {{ job.logo }}
      </span>

      <div class="min-w-0">
        <span
          class="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold"
          :style="{ backgroundColor: jobTypeMeta.background, color: jobTypeMeta.text }"
        >
          <Icon :name="jobTypeMeta.icon" class="h-3.5 w-3.5" aria-hidden="true" />
          <span class="truncate">{{ job.type }}</span>
        </span>

        <h3
          class="mt-2 line-clamp-1 cursor-help text-[17px] font-extrabold leading-6 text-slate-950 decoration-sky-300 underline-offset-4 transition hover:text-sky-700 hover:underline focus:outline-none focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-sky-100"
          :title="job.title"
          tabindex="0"
          @mouseenter.stop="emitPreview"
          @mouseleave.stop="emitPreviewClose"
          @focus="emitPreview"
          @blur="emitPreviewClose"
        >
          {{ job.title }}
        </h3>

        <p class="mt-2 truncate text-sm font-semibold text-slate-500">
          {{ job.company }}
        </p>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 text-sm font-bold text-slate-700">
      <span class="inline-flex max-w-full items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
        <Icon name="uil:money-bill" class="h-4 w-4 text-sky-600" aria-hidden="true" />
        {{ job.salary }}
      </span>
      <span class="inline-flex max-w-full items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
        <Icon name="uil:map-marker" class="h-4 w-4 text-sky-600" aria-hidden="true" />
        {{ job.location }}
      </span>
    </div>

    <div class="mt-auto flex justify-end border-t border-slate-100 pt-3">
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
import type { DisplayJob } from '~/utils/jobDisplay'
import { getJobTypeMeta } from '~/utils/jobTypeMeta'

const props = defineProps<{
  job: DisplayJob
  active?: boolean
  isFavorite?: boolean
  isFavoriteLoading?: boolean
}>()

const emit = defineEmits<{
  save: [job: DisplayJob]
  preview: [job: DisplayJob, anchor: PreviewAnchor]
  previewClose: []
}>()

const jobTypeMeta = computed(() => getJobTypeMeta(props.job.type))

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
