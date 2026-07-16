<template>
  <CandidateCollectionView
    mode="saved"
    title="Ứng viên đã lưu"
    eyebrow="Danh sách quan tâm"
    description="Theo dõi các ứng viên đã được đánh dấu lưu từ dữ liệu ứng tuyển của doanh nghiệp."
    empty-title="Chưa có ứng viên đã lưu"
    empty-description="Khi dữ liệu hệ thống có ứng viên được đánh dấu lưu, hồ sơ sẽ xuất hiện ở đây để bạn xem lại nhanh."
    accent-icon="uil:bookmark"
    empty-icon="uil:bookmark"
    accent-pill-class="bg-sky-50 text-sky-700"
    empty-icon-class="bg-sky-50 text-sky-600"
  />
</template>

<script setup lang="ts">
import CandidateCollectionView from '~/components/enterprise/CandidateCollectionView.vue'

definePageMeta({
  layout: 'enterprise',
  middleware: ['company']
})
</script>
