<template>
  <div aria-live="assertive" class="pointer-events-none fixed inset-0 z-[80] flex items-start justify-center px-4 py-5 sm:justify-end sm:p-6">
    <div class="flex w-full max-w-sm flex-col items-stretch space-y-3">
      <TransitionGroup
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto w-full overflow-hidden rounded-[22px] border bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.12)] ring-1 ring-slate-950/5 backdrop-blur-xl',
            getToastTheme(toast.type).cardClass
          ]"
        >
          <div class="relative">
            <div :class="['absolute inset-x-5 top-0 h-1 rounded-b-full', getToastTheme(toast.type).accentClass]"></div>
            <div class="flex items-start gap-3 px-4 py-3.5">
              <div
                :class="[
                  'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1',
                  getToastTheme(toast.type).iconClass
                ]"
              >
                <Icon :name="getToastTheme(toast.type).icon" class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[13px] font-extrabold leading-5 text-slate-950">{{ toast.title }}</p>
                <p v-if="toast.message" class="mt-0.5 text-[12px] font-semibold leading-5 text-slate-500">{{ toast.message }}</p>
              </div>
              <button
                type="button"
                @click="removeToast(toast.id)"
                class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-4 focus:ring-sky-100"
              >
                <span class="sr-only">Đóng thông báo</span>
                <Icon name="uil:times" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()

const toastThemes = {
  success: {
    icon: 'uil:check-circle',
    cardClass: 'border-sky-100',
    accentClass: 'bg-sky-500',
    iconClass: 'bg-sky-50 text-sky-700 ring-sky-100'
  },
  error: {
    icon: 'uil:times-circle',
    cardClass: 'border-rose-100',
    accentClass: 'bg-rose-500',
    iconClass: 'bg-rose-50 text-rose-600 ring-rose-100'
  },
  warning: {
    icon: 'uil:exclamation-triangle',
    cardClass: 'border-amber-100',
    accentClass: 'bg-amber-500',
    iconClass: 'bg-amber-50 text-amber-600 ring-amber-100'
  },
  info: {
    icon: 'uil:info-circle',
    cardClass: 'border-sky-100',
    accentClass: 'bg-sky-500',
    iconClass: 'bg-sky-50 text-sky-700 ring-sky-100'
  }
}

const getToastTheme = (type: keyof typeof toastThemes) => toastThemes[type] || toastThemes.info
</script>
