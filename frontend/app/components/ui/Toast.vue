<template>
  <Teleport to="body">
    <div
      aria-atomic="true"
      aria-live="assertive"
      class="pointer-events-none fixed inset-0 z-[2147483647] flex items-start justify-center px-4 py-5 sm:justify-end sm:p-6"
    >
      <div class="flex w-full max-w-[430px] flex-col items-stretch space-y-3">
        <TransitionGroup
          enter-active-class="transform ease-out duration-300 transition"
          enter-from-class="-translate-y-3 opacity-0 sm:translate-y-0 sm:translate-x-4"
          enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-for="toast in toasts"
            :key="toast.id"
            role="status"
            :class="[
              'pointer-events-auto relative w-full overflow-hidden rounded-3xl border bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] ring-1 ring-slate-950/5',
              getToastTheme(toast.type).cardClass
            ]"
          >
            <div :class="['absolute inset-y-4 left-0 w-1.5 rounded-r-full', getToastTheme(toast.type).accentClass]"></div>
            <div class="flex items-start gap-3 px-4 py-4 pl-5 sm:px-5 sm:pl-6">
              <div
                :class="[
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1',
                  getToastTheme(toast.type).iconClass
                ]"
              >
                <Icon :name="getToastTheme(toast.type).icon" class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1 pt-0.5">
                <p class="text-[15px] font-black leading-5 text-slate-950">{{ toast.title }}</p>
                <p v-if="toast.message" class="mt-1 text-[13px] font-semibold leading-5 text-slate-600">{{ toast.message }}</p>
              </div>
              <button
                type="button"
                @click="removeToast(toast.id)"
                class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-100"
              >
                <span class="sr-only">Đóng thông báo</span>
                <Icon name="uil:times" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
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
