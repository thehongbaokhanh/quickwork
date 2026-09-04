<template>
  <div class="relative h-full min-h-[320px] w-full overflow-hidden rounded-xl bg-slate-100">
    <div ref="mapElement" class="h-full w-full" />
    <div v-if="loading" class="absolute inset-0 z-[500] flex items-center justify-center bg-slate-100/90 text-sm font-bold text-slate-500">
      <Icon name="uil:spinner-alt" class="mr-2 h-5 w-5 animate-spin text-sky-600" />Đang tải bản đồ vệ tinh...
    </div>
    <div v-if="editable" class="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg bg-slate-950/75 px-3 py-2 text-[11px] font-bold text-white shadow">
      Nhấp, kéo marker hoặc kéo bản đồ để chọn vị trí
    </div>
    <span class="pointer-events-none absolute bottom-3 left-3 z-[500] max-w-[calc(100%-1.5rem)] truncate rounded-lg bg-white/90 px-2.5 py-1.5 text-[10px] font-bold text-slate-700 shadow">{{ label || 'Chưa cập nhật địa điểm' }}</span>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import 'leaflet/dist/leaflet.css'

const props = withDefaults(defineProps<{ latitude?: string, longitude?: string, label?: string, zoom?: number, editable?: boolean }>(), { latitude: '', longitude: '', label: '', zoom: 16, editable: false })
const emit = defineEmits<{ choose: [point: { latitude: string, longitude: string }] }>()
const mapElement = ref<HTMLElement | null>(null)
const loading = ref(true)
let leaflet: typeof import('leaflet') | null = null
let map: import('leaflet').Map | null = null
let marker: import('leaflet').Marker | null = null
let userDraggingMap = false

function coordinates() {
  const latitude = Number(props.latitude)
  const longitude = Number(props.longitude)
  return Number.isFinite(latitude) && Number.isFinite(longitude) && props.latitude !== '' && props.longitude !== ''
    ? { latitude, longitude }
    : null
}

function placeMarker(latitude: number, longitude: number, zoom = false) {
  if (!leaflet || !map) return
  const point = leaflet.latLng(latitude, longitude)
  if (!marker) {
    marker = leaflet.marker(point, {
      draggable: props.editable,
      icon: leaflet.divIcon({ className: 'qw-location-pin-wrap', html: '<span class="qw-location-pin"></span>', iconSize: [34, 44], iconAnchor: [17, 42] })
    }).addTo(map)
    marker.on('dragend', () => {
      const position = marker?.getLatLng()
      if (position) emitPoint(position.lat, position.lng)
    })
  } else {
    marker.setLatLng(point)
    marker.dragging?.[props.editable ? 'enable' : 'disable']()
  }
  if (zoom) map.setView(point, props.zoom, { animate: true })
}

function emitPoint(latitude: number, longitude: number) {
  placeMarker(latitude, longitude)
  emit('choose', { latitude: latitude.toFixed(7), longitude: longitude.toFixed(7) })
}

onMounted(async () => {
  if (!mapElement.value) return
  leaflet = await import('leaflet')
  const current = coordinates()
  map = leaflet.map(mapElement.value, { zoomControl: true, attributionControl: true }).setView(current ? [current.latitude, current.longitude] : [14.0583, 108.2772], current ? props.zoom : 5)
  leaflet.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
  }).addTo(map)
  leaflet.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    opacity: 0.9,
    attribution: 'Labels &copy; Esri'
  }).addTo(map)
  if (current) placeMarker(current.latitude, current.longitude)
  map.on('click', (event) => { if (props.editable) emitPoint(event.latlng.lat, event.latlng.lng) })
  map.on('dragstart', () => { userDraggingMap = props.editable })
  map.on('dragend', () => {
    if (!userDraggingMap || !map) return
    userDraggingMap = false
    const center = map.getCenter()
    emitPoint(center.lat, center.lng)
  })
  loading.value = false
  await nextTick()
  map.invalidateSize()
})

watch(() => [props.latitude, props.longitude], () => {
  const current = coordinates()
  if (current) placeMarker(current.latitude, current.longitude, true)
})
watch(() => props.zoom, (zoom) => { if (map && coordinates()) map.setZoom(zoom) })
watch(() => props.editable, (editable) => marker?.dragging?.[editable ? 'enable' : 'disable']())
onBeforeUnmount(() => { map?.remove(); map = null; marker = null })
</script>

<style>
.qw-location-pin-wrap { background: transparent; border: 0; }
.qw-location-pin { display: block; width: 34px; height: 34px; border: 5px solid white; border-radius: 50% 50% 50% 0; background: #0284c7; box-shadow: 0 8px 18px rgb(15 23 42 / 35%); transform: rotate(-45deg); }
.qw-location-pin::after { content: ''; position: absolute; width: 9px; height: 9px; margin: 7px; border-radius: 999px; background: white; }
</style>
