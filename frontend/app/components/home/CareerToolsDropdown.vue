<template>
  <section
    :id="menuId"
    class="absolute left-1/2 top-full z-[70] mt-3 w-[680px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-2xl shadow-slate-300/60"
    aria-label="Công cụ nghề nghiệp"
    role="menu"
    @click.stop
  >
    <div
      v-for="(section, sectionIndex) in careerToolSections"
      :key="section.title"
      :class="['min-w-0', sectionIndex > 0 ? 'mt-3 border-t border-slate-100 pt-3' : '']"
    >
      <p class="px-3 text-[11px] font-black uppercase text-slate-400">{{ section.title }}</p>
      <div class="mt-1.5 grid gap-1">
        <template v-for="item in section.items" :key="item.label">
          <NuxtLink
            v-if="item.to"
            :to="item.to"
            class="group/menu grid min-h-[56px] grid-cols-[40px_170px_minmax(0,1fr)] items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            role="menuitem"
            @click="emit('close')"
          >
            <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', item.iconClass]">
              <Icon :name="item.icon" class="h-5 w-5" aria-hidden="true" />
            </span>
            <strong class="whitespace-nowrap text-sm font-extrabold text-slate-900 group-hover/menu:text-sky-700">{{ item.label }}</strong>
            <small class="min-w-0 truncate whitespace-nowrap text-xs font-medium text-slate-500">{{ item.description }}</small>
          </NuxtLink>

          <button
            v-else
            type="button"
            class="grid min-h-[56px] w-full grid-cols-[40px_170px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-3 py-2 text-left text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            role="menuitem"
            @click="emit('develop', item.label)"
          >
            <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', item.iconClass]">
              <Icon :name="item.icon" class="h-5 w-5" aria-hidden="true" />
            </span>
            <strong class="whitespace-nowrap text-sm font-extrabold text-slate-800">{{ item.label }}</strong>
            <small class="min-w-0 truncate whitespace-nowrap text-xs font-medium">{{ item.description }}</small>
            <small class="shrink-0 rounded bg-slate-100 px-2 py-1 text-[9px] font-black uppercase text-slate-500">Sắp có</small>
          </button>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { careerToolSections } from '~/data/careerTools'

defineProps<{
  menuId: string
}>()

const emit = defineEmits<{
  close: []
  develop: [feature: string]
}>()
</script>
