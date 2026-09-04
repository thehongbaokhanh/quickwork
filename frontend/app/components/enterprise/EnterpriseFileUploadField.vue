<template>
  <div class="min-w-0">
    <input ref="input" type="file" class="sr-only" :accept="accept" :disabled="uploading" @change="onInput">
    <div
      :class="['relative h-40 overflow-hidden rounded-2xl border-2 border-dashed p-4 transition', dragging ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-slate-50/70', uploading ? 'pointer-events-none opacity-70' : 'cursor-pointer hover:border-sky-300']"
      role="button"
      tabindex="0"
      @click="input?.click()"
      @keydown.enter.prevent="input?.click()"
      @keydown.space.prevent="input?.click()"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <button v-if="removable && displayUrl" type="button" :aria-label="removeLabel" class="absolute right-3 top-3 z-10 inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white/95 px-2.5 text-xs font-bold text-slate-600 shadow-sm hover:text-rose-600" @click.stop="emit('remove')"><Icon name="uil:trash-alt" class="h-4 w-4" />Xóa</button>
      <div v-if="displayUrl" class="flex h-full min-w-0 items-center gap-4 pr-16">
        <img v-if="image" :src="displayUrl" alt="Xem trước tệp" :class="['shrink-0 rounded-xl object-cover', cover ? 'h-24 w-36' : 'h-20 w-20']">
        <span v-else class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm"><Icon name="uil:file-alt" class="h-6 w-6" /></span>
        <div class="min-w-0 flex-1"><p class="truncate text-sm font-bold text-slate-900">{{ fileName }}</p><p class="mt-1 text-xs font-medium text-slate-500">{{ uploading ? 'Đang tải lên...' : 'Đã sẵn sàng' }}</p></div>
        <span class="shrink-0 text-sm font-bold text-sky-700">{{ uploading ? 'Đang tải' : 'Thay file' }}</span>
      </div>
      <div v-else class="flex h-full flex-col items-center justify-center text-center">
        <span class="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm"><Icon :name="uploading ? 'svg-spinners:180-ring' : 'uil:cloud-upload'" class="h-6 w-6" /></span>
        <p class="mt-3 text-sm font-bold text-slate-900">{{ label }}</p>
        <p class="mt-1 text-sm text-slate-500">hoặc <span class="font-bold text-sky-700">Chọn tệp</span></p>
        <p class="mt-2 text-xs font-medium text-slate-400">{{ help }}</p>
      </div>
    </div>
    <p class="mt-2 min-h-4 truncate text-xs font-bold text-rose-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ modelValue?: string, accept: string, label: string, help: string, uploading?: boolean, error?: string, image?: boolean, cover?: boolean, removable?: boolean, removeLabel?: string }>(), { modelValue: '', uploading: false, error: '', image: false, cover: false, removable: false, removeLabel: 'Xóa tệp' })
const emit = defineEmits<{ file: [file: File], remove: [] }>()
const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const preview = ref('')
const selectedName = ref('')
const displayUrl = computed(() => preview.value || props.modelValue)
const fileName = computed(() => selectedName.value || decodeName(props.modelValue))

watch(() => props.modelValue, () => { if (!props.modelValue && preview.value) clearPreview() })
function decodeName(value: string) { try { return decodeURIComponent(new URL(value).pathname.split('/').pop() || 'Tệp đã tải lên') } catch { return 'Tệp đã tải lên' } }
function select(file?: File) {
  if (!file || props.uploading) return
  selectedName.value = file.name
  if (props.image) { clearPreview(); preview.value = URL.createObjectURL(file) }
  emit('file', file)
}
function onInput(event: Event) { select((event.target as HTMLInputElement).files?.[0]); if (input.value) input.value.value = '' }
function onDrop(event: DragEvent) { dragging.value = false; select(event.dataTransfer?.files?.[0]) }
function clearPreview() { if (preview.value) URL.revokeObjectURL(preview.value); preview.value = '' }
onBeforeUnmount(clearPreview)
</script>
