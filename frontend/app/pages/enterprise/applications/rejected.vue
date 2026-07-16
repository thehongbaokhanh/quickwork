<template>
  <CandidateCollectionView
    mode="rejected"
    title="Ứng viên bị từ chối"
    eyebrow="Hồ sơ đã phản hồi"
    description="Tổng hợp các ứng viên đã bị từ chối để nhà tuyển dụng dễ rà soát lịch sử xử lý."
    empty-title="Chưa có ứng viên bị từ chối"
    empty-description="Các hồ sơ bị từ chối từ danh sách ứng viên sẽ được đồng bộ vào trang này."
    accent-icon="uil:times-circle"
    empty-icon="uil:user-times"
    accent-pill-class="bg-rose-50 text-rose-700"
    empty-icon-class="bg-rose-50 text-rose-600"
  />
</template>

<script setup lang="ts">
import CandidateCollectionView from '~/components/enterprise/CandidateCollectionView.vue'

definePageMeta({
  layout: 'enterprise',
  middleware: ['company']
})
</script>
