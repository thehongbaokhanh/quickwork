<template>
  <div class="mx-auto max-w-6xl space-y-6 py-6">
    <section class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div class="grid gap-5 bg-slate-950 px-5 py-6 text-white lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-7">
        <div class="min-w-0">
          <NuxtLink
            to="/enterprise/jobs"
            class="mb-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-slate-100 transition hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/20"
          >
            <Icon name="uil:arrow-left" class="h-4 w-4" />
            Quay lại danh sách
          </NuxtLink>
          <h1 class="text-2xl font-black leading-tight tracking-normal md:text-3xl">Đăng tin tuyển dụng mới</h1>
          <p class="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
            Tạo bản nháp hoặc gửi admin duyệt trực tiếp. Thông tin bên dưới sẽ hiển thị với ứng viên sau khi tin được phê duyệt.
          </p>
        </div>
        <div class="grid gap-2 rounded-3xl border border-white/10 bg-white/10 p-2 text-xs font-bold text-slate-200 sm:min-w-[25rem] sm:grid-cols-2">
          <button
            v-for="choice in publishChoices"
            :key="choice.value"
            type="button"
            :aria-pressed="selectedPublishStatus === choice.value"
            :class="[
              'group rounded-2xl border px-3 py-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/25',
              selectedPublishStatus === choice.value
                ? 'border-sky-300 bg-sky-400 text-slate-950 shadow-lg shadow-sky-950/10'
                : 'border-white/10 bg-white/10 text-slate-200 hover:bg-white/15'
            ]"
            @click="setPublishStatus(choice.value)"
          >
            <span class="flex items-center gap-2">
              <Icon
                :name="choice.icon"
                :class="['h-4 w-4', selectedPublishStatus === choice.value ? 'text-sky-900' : 'text-sky-200']"
              />
              <span :class="selectedPublishStatus === choice.value ? 'text-slate-800/75' : 'text-slate-400'">{{ choice.eyebrow }}</span>
            </span>
            <span :class="['mt-1 block text-sm font-black', selectedPublishStatus === choice.value ? 'text-slate-950' : 'text-white']">
              {{ choice.title }}
            </span>
          </button>
        </div>
      </div>
    </section>

    <div v-if="errorMessage" class="flex items-start gap-3 rounded-3xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
      <Icon name="uil:exclamation-triangle" class="mt-0.5 h-5 w-5 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <form class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" @submit.prevent>
      <div class="space-y-6">
        <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div class="mb-5 flex items-center gap-3">
            <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Icon name="uil:file-plus-alt" class="h-5 w-5" />
            </span>
            <div>
              <h2 class="text-base font-black text-slate-950">Thông tin chính</h2>
              <p class="text-xs font-semibold text-slate-500">Những trường cốt lõi giúp ứng viên nhận diện cơ hội.</p>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="md:col-span-2">
              <span class="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tiêu đề công việc <span class="text-rose-500">*</span></span>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="VD: Thực tập sinh Marketing, Backend Developer..."
                class="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label>
              <span class="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Mức lương <span class="text-rose-500">*</span></span>
              <input
                v-model="form.salary"
                type="text"
                required
                placeholder="VD: 6 - 9 triệu"
                class="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label>
              <span class="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Số lượng tuyển <span class="text-rose-500">*</span></span>
              <input
                v-model.number="form.slots"
                type="number"
                min="1"
                required
                placeholder="Nhập số lượng"
                class="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <div class="md:col-span-2 space-y-4">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span class="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Địa điểm làm việc</span>
                  <p class="text-xs font-semibold text-slate-500">Chọn lần lượt thành phố, phường/xã theo dữ liệu hành chính 2025 rồi nhập số nhà hoặc tên đường.</p>
                </div>
                <button
                  v-if="selectedCity || selectedWard || streetAddress"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                  @click="resetLocation"
                >
                  <Icon name="uil:refresh" class="h-4 w-4" />
                  Chọn lại
                </button>
              </div>

              <div ref="locationPickerRef" class="grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-3 lg:grid-cols-3">
                <div class="relative">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    :aria-expanded="openLocationDropdown === 'city'"
                    :class="[
                      'group flex min-h-[82px] w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                      selectedCity || openLocationDropdown === 'city'
                        ? 'border-sky-300 text-sky-700 shadow-sm shadow-sky-100'
                        : 'border-slate-100 text-slate-500 hover:border-sky-200'
                    ]"
                    @click.stop="toggleLocationDropdown('city')"
                  >
                    <span class="min-w-0">
                      <span class="block text-[11px] font-black uppercase tracking-wider">Thành phố</span>
                      <span class="mt-1 block truncate text-sm font-black text-slate-950">{{ selectedCity || 'Chọn thành phố' }}</span>
                    </span>
                    <Icon
                      name="uil:angle-down"
                      :class="['h-5 w-5 shrink-0 text-slate-400 transition-transform', openLocationDropdown === 'city' ? 'rotate-180 text-sky-600' : '']"
                    />
                  </button>

                  <Transition name="qw-location-fade">
                    <div
                      v-if="openLocationDropdown === 'city'"
                      class="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-2xl shadow-sky-100/70 ring-1 ring-sky-950/5"
                    >
                      <div class="qw-location-scroll max-h-60 overflow-y-auto" role="listbox" aria-label="Chọn thành phố">
                        <button
                          v-for="city in cityOptions"
                          :key="city.value"
                          type="button"
                          :aria-selected="selectedCity === city.value"
                          class="flex min-h-14 w-full items-center gap-3 border-b border-slate-100 px-4 text-left transition last:border-b-0 hover:bg-sky-50 focus:outline-none focus-visible:bg-sky-50"
                          role="option"
                          @click="selectCity(city)"
                        >
                          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                            <Icon name="uil:map-marker" class="h-5 w-5" />
                          </span>
                          <span class="min-w-0 flex-1">
                            <span class="block truncate text-sm font-black text-slate-950">{{ city.label }}</span>
                            <span class="mt-0.5 block truncate text-xs font-semibold text-slate-500">{{ city.helper }}</span>
                          </span>
                          <Icon v-if="selectedCity === city.value" name="uil:check" class="h-5 w-5 shrink-0 text-sky-600" />
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>

                <Transition name="qw-location-fade">
                  <div v-if="selectedCityOption" class="relative">
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      :aria-expanded="openLocationDropdown === 'ward'"
                      :class="[
                        'group flex min-h-[82px] w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                        selectedWard || openLocationDropdown === 'ward'
                          ? 'border-sky-300 text-sky-700 shadow-sm shadow-sky-100'
                          : 'border-slate-100 text-slate-500 hover:border-sky-200'
                      ]"
                      @click.stop="toggleLocationDropdown('ward')"
                    >
                      <span class="min-w-0">
                        <span class="block text-[11px] font-black uppercase tracking-wider">Phường / xã</span>
                        <span class="mt-1 block truncate text-sm font-black text-slate-950">{{ selectedWard || 'Chọn phường / xã' }}</span>
                      </span>
                      <Icon
                        name="uil:angle-down"
                        :class="['h-5 w-5 shrink-0 text-slate-400 transition-transform', openLocationDropdown === 'ward' ? 'rotate-180 text-sky-600' : '']"
                      />
                    </button>

                    <Transition name="qw-location-fade">
                      <div
                        v-if="openLocationDropdown === 'ward'"
                        class="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-2xl shadow-sky-100/70 ring-1 ring-sky-950/5"
                      >
                        <div class="qw-location-scroll max-h-60 overflow-y-auto" role="listbox" aria-label="Chọn phường hoặc xã">
                          <button
                            v-for="ward in wardOptions"
                            :key="ward"
                            type="button"
                            :aria-selected="selectedWard === ward"
                            class="flex min-h-12 w-full items-center gap-3 border-b border-slate-100 px-4 text-left text-sm font-black transition last:border-b-0 hover:bg-sky-50 focus:outline-none focus-visible:bg-sky-50"
                            role="option"
                            @click="selectWard(ward)"
                          >
                            <Icon name="uil:location-point" class="h-5 w-5 shrink-0 text-sky-600" />
                            <span class="min-w-0 flex-1 truncate text-slate-800">{{ ward }}</span>
                            <Icon v-if="selectedWard === ward" name="uil:check" class="h-5 w-5 shrink-0 text-sky-600" />
                          </button>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </Transition>

                <Transition name="qw-location-fade">
                  <label v-if="selectedWard" class="block">
                    <span class="flex min-h-[82px] flex-col justify-center rounded-2xl border border-sky-300 bg-white px-4 py-3 shadow-sm shadow-sky-100">
                      <span class="mb-2 block text-[11px] font-black uppercase tracking-wider text-sky-700">Địa chỉ chi tiết</span>
                      <input
                        v-model="streetAddress"
                        type="text"
                        placeholder="Số nhà, tên đường, tòa nhà..."
                        class="h-8 w-full border-0 bg-transparent p-0 text-sm font-black text-slate-950 outline-none placeholder:text-slate-400 focus:ring-0"
                      />
                    </span>
                  </label>
                </Transition>
              </div>

              <div v-if="form.location" class="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sky-900">
                <Icon name="uil:map-pin-alt" class="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                <div class="min-w-0">
                  <p class="text-xs font-black uppercase tracking-wider text-sky-700">Địa chỉ sẽ lưu</p>
                  <p class="mt-1 text-sm font-black leading-6 text-slate-950">{{ form.location }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div class="mb-5 flex items-center gap-3">
            <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Icon name="uil:clipboard-notes" class="h-5 w-5" />
            </span>
            <div>
              <h2 class="text-base font-black text-slate-950">Nội dung tuyển dụng</h2>
              <p class="text-xs font-semibold text-slate-500">Mô tả rõ công việc, yêu cầu và kỳ vọng từ ứng viên.</p>
            </div>
          </div>

          <div class="grid gap-4">
            <div class="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span class="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Yêu cầu công việc</span>
                  <p class="mt-1 text-xs font-semibold text-slate-500">Tách rõ kỹ năng, kinh nghiệm và thời gian làm việc để ứng viên đọc nhanh hơn.</p>
                </div>
                <span class="inline-flex w-fit items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700">
                  <Icon name="uil:layer-group" class="h-4 w-4" />
                  {{ selectedSkillIds.length }} kỹ năng
                </span>
              </div>

              <div class="mt-4 space-y-5">
                <section class="rounded-3xl border border-sky-100 bg-white p-4">
                  <div class="mb-3 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                      <span class="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                        <Icon name="uil:bolt-alt" class="h-5 w-5" />
                      </span>
                      <div>
                        <h3 class="text-sm font-black text-slate-950">Kỹ năng</h3>
                        <p class="text-xs font-semibold text-slate-500">Dữ liệu lấy từ bảng kỹ năng trong hệ thống.</p>
                      </div>
                    </div>
                    <Icon v-if="skillsLoading" name="svg-spinners:180-ring" class="h-5 w-5 text-sky-600" />
                  </div>

                  <div class="qw-chip-scroll max-h-32 overflow-y-auto pr-1">
                    <div v-if="skillOptions.length" class="flex flex-wrap gap-2">
                      <button
                        v-for="skill in skillOptions"
                        :key="skill.id"
                        type="button"
                        :aria-pressed="selectedSkillIds.includes(Number(skill.id))"
                        :class="[
                          'inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                          selectedSkillIds.includes(Number(skill.id))
                            ? 'border-sky-300 bg-sky-100 text-sky-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50'
                        ]"
                        @click="toggleSkill(Number(skill.id))"
                      >
                        <Icon :name="selectedSkillIds.includes(Number(skill.id)) ? 'uil:check' : 'uil:plus'" class="h-4 w-4" />
                        {{ skill.name }}
                      </button>
                    </div>
                    <div v-else class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-xs font-bold text-slate-500">
                      {{ skillsLoading ? 'Đang tải kỹ năng...' : 'Chưa có kỹ năng trong hệ thống.' }}
                    </div>
                  </div>

                  <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                    <label class="min-w-0 flex-1">
                      <span class="sr-only">Thêm kỹ năng mới</span>
                      <input
                        v-model="newSkillName"
                        type="text"
                        placeholder="Nhập kỹ năng mới, ví dụ: Laravel, Chăm sóc khách hàng..."
                        class="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                        @keydown.enter.prevent="addSkill"
                      />
                    </label>
                    <button
                      type="button"
                      :disabled="creatingSkill"
                      class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-black text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                      @click="addSkill"
                    >
                      <Icon :name="creatingSkill ? 'svg-spinners:180-ring' : 'uil:plus-circle'" class="h-5 w-5" />
                      Thêm kỹ năng
                    </button>
                  </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <span class="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-sky-700">
                      <Icon name="uil:user-check" class="h-5 w-5" />
                    </span>
                    <div>
                      <h3 class="text-sm font-black text-slate-950">Kinh nghiệm</h3>
                      <p class="text-xs font-semibold text-slate-500">Chọn một mức phù hợp với vị trí.</p>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="experience in experienceOptions"
                      :key="experience"
                      type="button"
                      :aria-pressed="selectedExperience === experience"
                      :class="[
                        'inline-flex h-9 items-center rounded-full border px-3 text-xs font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                        selectedExperience === experience
                          ? 'border-sky-300 bg-sky-100 text-sky-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50'
                      ]"
                      @click="selectedExperience = selectedExperience === experience ? '' : experience"
                    >
                      {{ experience }}
                    </button>
                  </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <span class="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-sky-700">
                      <Icon name="uil:clock" class="h-5 w-5" />
                    </span>
                    <div>
                      <h3 class="text-sm font-black text-slate-950">Thời gian làm việc</h3>
                      <p class="text-xs font-semibold text-slate-500">Chọn lịch làm việc dự kiến.</p>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="workTime in workTimeOptions"
                      :key="workTime"
                      type="button"
                      :aria-pressed="selectedWorkTime === workTime"
                      :class="[
                        'inline-flex h-9 items-center rounded-full border px-3 text-xs font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                        selectedWorkTime === workTime
                          ? 'border-sky-300 bg-sky-100 text-sky-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50'
                      ]"
                      @click="selectedWorkTime = selectedWorkTime === workTime ? '' : workTime"
                    >
                      {{ workTime }}
                    </button>
                  </div>
                </section>

                <label class="block">
                  <span class="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Ghi chú yêu cầu bổ sung</span>
                  <textarea
                    v-model="requirementNotes"
                    rows="3"
                    placeholder="Ví dụ: ưu tiên ứng viên có laptop cá nhân, có thể đi onsite..."
                    class="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </label>
              </div>
            </div>

            <label>
              <span class="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Mô tả chi tiết công việc <span class="text-rose-500">*</span></span>
              <textarea
                v-model="form.description"
                rows="7"
                required
                placeholder="Nhiệm vụ, dự án sẽ tham gia, quyền lợi được hưởng..."
                class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>
          </div>
        </section>
      </div>

      <aside class="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="relative flex items-start gap-3 pr-11">
            <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Icon name="uil:eye" class="h-5 w-5" />
            </span>
            <div>
              <h2 class="text-base font-black text-slate-950">Tóm tắt tin</h2>
              <p class="text-xs font-semibold text-slate-500">Kiểm tra nhanh trước khi lưu.</p>
            </div>
            <div class="group absolute right-0 top-0">
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 opacity-80 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 hover:opacity-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                aria-label="Xem lưu ý trạng thái tin"
              >
                <Icon name="uil:info-circle" class="h-5 w-5" aria-hidden="true" />
              </button>
              <div class="pointer-events-none absolute right-0 top-11 z-30 w-64 rounded-2xl border border-sky-100 bg-white/95 p-3 text-xs font-bold leading-5 text-slate-600 opacity-0 shadow-xl shadow-slate-200/70 ring-1 ring-slate-950/5 transition group-hover:opacity-100 group-focus-within:opacity-100">
                {{ selectedStatusMeta.description }}
              </div>
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Tiêu đề</p>
              <p class="mt-1 break-words text-sm font-black leading-6 text-slate-950">{{ form.title || 'Chưa nhập tiêu đề' }}</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Mức lương</p>
                <p class="mt-1 break-words text-sm font-black leading-6 text-slate-950">{{ form.salary || 'Chưa nhập' }}</p>
              </div>
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Số lượng</p>
                <p class="mt-1 text-sm font-black text-slate-950">{{ form.slots || 1 }}</p>
              </div>
            </div>
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Địa điểm</p>
              <p class="mt-1 break-words text-sm font-black leading-6 text-slate-950">{{ form.location || 'Chưa cập nhật' }}</p>
            </div>
            <div class="rounded-2xl bg-sky-50 p-4">
              <p class="text-[11px] font-extrabold uppercase tracking-wider text-sky-600">Trạng thái sau khi lưu</p>
              <p class="mt-1 text-sm font-black text-slate-950">{{ selectedStatusMeta.title }}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Kỹ năng đã chọn</p>
              <p class="mt-1 break-words text-sm font-black leading-6 text-slate-950">
                {{ selectedSkillNames.length ? selectedSkillNames.join(', ') : 'Chưa chọn kỹ năng' }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Kinh nghiệm</p>
                <p class="mt-1 break-words text-sm font-black leading-6 text-slate-950">{{ selectedExperience || 'Chưa chọn' }}</p>
              </div>
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Thời gian</p>
                <p class="mt-1 break-words text-sm font-black leading-6 text-slate-950">{{ selectedWorkTime || 'Chưa chọn' }}</p>
              </div>
            </div>
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Ghi chú yêu cầu</p>
              <p class="mt-1 whitespace-pre-line break-words text-sm font-black leading-6 text-slate-950">{{ requirementNotes.trim() || 'Chưa có ghi chú' }}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Mô tả công việc</p>
              <p class="mt-1 whitespace-pre-line break-words text-sm font-black leading-6 text-slate-950">{{ form.description || 'Chưa nhập mô tả' }}</p>
            </div>
          </div>
        </section>

        <div class="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div class="grid gap-3">
            <button
              type="button"
              :disabled="submitting"
              :class="[
                'inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60',
                selectedPublishStatus === 'DRAFT'
                  ? 'border border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100'
                  : 'bg-sky-600 text-white shadow-lg shadow-sky-100 hover:bg-sky-700'
              ]"
              @click="submitJob()"
            >
              <Icon
                :name="submitting ? 'svg-spinners:180-ring' : selectedStatusMeta.icon"
                class="h-5 w-5"
              />
              <span v-if="submitting">
                {{ submitIntent === 'DRAFT' ? 'Đang lưu nháp...' : 'Đang gửi duyệt...' }}
              </span>
              <span v-else>
                {{ selectedPublishStatus === 'DRAFT' ? 'Lưu nháp' : 'Gửi duyệt tin' }}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { JobService } from '~/services/job.service'

type CityOption = {
  value: string
  label: string
  helper: string
  wards: string[]
}

type LocationDropdown = 'city' | 'ward'
type PublishStatus = 'DRAFT' | 'PENDING'

type PublishChoice = {
  value: PublishStatus
  eyebrow: string
  title: string
  description: string
  icon: string
}

type SkillOption = {
  id: number
  name: string
  category_id?: number
  category?: {
    id?: number
    name?: string
  }
}

definePageMeta({
  layout: 'enterprise',
  middleware: ['company']
})

const router = useRouter()
const toast = useToast()
const submitting = ref(false)
const submitIntent = ref<PublishStatus | null>(null)
const errorMessage = ref('')
const selectedPublishStatus = ref<PublishStatus>('PENDING')
const selectedCity = ref('')
const selectedWard = ref('')
const streetAddress = ref('')
const locationPickerRef = ref<HTMLElement | null>(null)
const openLocationDropdown = ref<LocationDropdown | null>(null)
const skillOptions = ref<SkillOption[]>([])
const selectedSkillIds = ref<number[]>([])
const skillsLoading = ref(false)
const creatingSkill = ref(false)
const newSkillName = ref('')
const selectedExperience = ref('')
const selectedWorkTime = ref('')
const requirementNotes = ref('')

const form = ref({
  title: '',
  salary: '',
  description: '',
  location: '',
  slots: 1,
  status: 'PENDING'
})

const defaultPublishChoice: PublishChoice = {
  value: 'PENDING',
  eyebrow: 'Trạng thái mặc định',
  title: 'Gửi admin duyệt',
  description: 'Tin được chuyển vào hàng chờ duyệt ngay sau khi tạo.',
  icon: 'uil:message'
}

const publishChoices: PublishChoice[] = [
  defaultPublishChoice,
  {
    value: 'DRAFT',
    eyebrow: 'Có thể lưu',
    title: 'Lưu bản nháp',
    description: 'Giữ lại để tiếp tục chỉnh sửa trước khi gửi duyệt.',
    icon: 'uil:save'
  }
]

const experienceOptions = [
  'Không yêu cầu kinh nghiệm',
  'Fresher (0-1 năm)',
  'Junior (1-2 năm)',
  'Mid-level (2-4 năm)',
  'Senior (4+ năm)'
]

const workTimeOptions = [
  'Giờ hành chính',
  'Ca linh hoạt',
  'Tối thiểu 20 giờ/tuần',
  'Tối thiểu 3 buổi/tuần',
  'Làm cuối tuần'
]

// Danh sach rut gon tu cong bo sap xep DVHC cap xa nam 2025 cua Chinhphu.vn.
// Chi them dia phuong khi da doi chieu duoc voi nguon hanh chinh thuc te.
const cityOptions: CityOption[] = [
  {
    value: 'Thành phố Hà Nội',
    label: 'Thành phố Hà Nội',
    helper: '126 đơn vị cấp xã sau sắp xếp 2025',
    wards: [
      'Phường Hoàn Kiếm',
      'Phường Cửa Nam',
      'Phường Ba Đình',
      'Phường Ngọc Hà',
      'Phường Giảng Võ',
      'Phường Hai Bà Trưng',
      'Phường Vĩnh Tuy',
      'Phường Bạch Mai',
      'Phường Đống Đa',
      'Phường Kim Liên',
      'Phường Văn Miếu - Quốc Tử Giám',
      'Phường Láng',
      'Phường Ô Chợ Dừa',
      'Phường Hồng Hà',
      'Phường Lĩnh Nam',
      'Phường Hoàng Mai',
      'Phường Vĩnh Hưng',
      'Phường Tương Mai',
      'Phường Định Công',
      'Phường Hoàng Liệt',
      'Phường Yên Sở',
      'Phường Thanh Xuân',
      'Phường Khương Đình',
      'Phường Phương Liệt',
      'Phường Cầu Giấy',
      'Phường Nghĩa Đô',
      'Phường Yên Hòa',
      'Phường Tây Hồ',
      'Phường Phú Thượng',
      'Phường Xuân Đỉnh',
      'Phường Đông Ngạc',
      'Phường Từ Liêm',
      'Phường Xuân Phương',
      'Phường Tây Mỗ',
      'Phường Đại Mỗ',
      'Phường Long Biên',
      'Phường Bồ Đề',
      'Phường Việt Hưng',
      'Phường Hà Đông',
      'Phường Dương Nội',
      'Phường Yên Nghĩa',
      'Phường Phú Lương',
      'Phường Kiến Hưng'
    ]
  },
  {
    value: 'Thành phố Hồ Chí Minh',
    label: 'Thành phố Hồ Chí Minh',
    helper: '168 đơn vị cấp xã sau sắp xếp 2025',
    wards: [
      'Phường Sài Gòn',
      'Phường Tân Định',
      'Phường Bến Thành',
      'Phường Cầu Ông Lãnh',
      'Phường Bàn Cờ',
      'Phường Xuân Hòa',
      'Phường Nhiêu Lộc',
      'Phường Xóm Chiếu',
      'Phường Khánh Hội',
      'Phường Vĩnh Hội',
      'Phường Chợ Quán',
      'Phường An Đông',
      'Phường Chợ Lớn',
      'Phường Bình Tây',
      'Phường Bình Tiên',
      'Phường Bình Phú',
      'Phường Phú Lâm',
      'Phường Tân Thuận',
      'Phường Phú Thuận',
      'Phường Tân Mỹ',
      'Phường Tân Hưng',
      'Phường Chánh Hưng',
      'Phường Phú Định',
      'Phường Bình Đông',
      'Phường Diên Hồng',
      'Phường Hòa Hưng',
      'Phường Gia Định',
      'Phường Bình Thạnh',
      'Phường Bình Lợi Trung',
      'Phường Thạnh Mỹ Tây',
      'Phường Bình Quới',
      'Phường Hiệp Bình',
      'Phường Thủ Đức',
      'Phường Linh Xuân',
      'Phường Tăng Nhơn Phú',
      'Phường Long Bình',
      'Phường Phước Long',
      'Phường An Khánh',
      'Phường Cát Lái',
      'Phường An Phú',
      'Phường Thảo Điền',
      'Phường Long Trường',
      'Đặc khu Côn Đảo'
    ]
  },
  {
    value: 'Thành phố Hải Phòng',
    label: 'Thành phố Hải Phòng',
    helper: '114 đơn vị cấp xã sau sắp xếp 2025',
    wards: [
      'Phường Hồng Bàng',
      'Phường Hồng An',
      'Phường Ngô Quyền',
      'Phường Gia Viên',
      'Phường Lê Chân',
      'Phường An Biên',
      'Phường Hải An',
      'Phường Đông Hải',
      'Phường Kiến An',
      'Phường Phù Liễn',
      'Phường Nam Đồ Sơn',
      'Phường Đồ Sơn',
      'Phường Hưng Đạo',
      'Phường Dương Kinh',
      'Phường An Dương',
      'Phường An Hải',
      'Phường An Phong',
      'Xã An Hưng',
      'Xã An Khánh',
      'Xã An Quang',
      'Xã An Trường',
      'Xã An Lão',
      'Xã Kiến Thụy',
      'Xã Kiến Minh',
      'Xã Kiến Hải',
      'Xã Kiến Hưng',
      'Xã Nghi Dương',
      'Xã Quyết Thắng',
      'Xã Tiên Lãng',
      'Đặc khu Bạch Long Vĩ'
    ]
  },
  {
    value: 'Thành phố Đà Nẵng',
    label: 'Thành phố Đà Nẵng',
    helper: '94 đơn vị cấp xã sau sắp xếp 2025',
    wards: [
      'Phường Hải Châu',
      'Phường Hòa Cường',
      'Phường Thanh Khê',
      'Phường An Khê',
      'Phường An Hải',
      'Phường Sơn Trà',
      'Phường Ngũ Hành Sơn',
      'Phường Hòa Khánh',
      'Phường Hải Vân',
      'Phường Liên Chiểu',
      'Phường Cẩm Lệ',
      'Phường Hòa Xuân',
      'Phường Tam Kỳ',
      'Phường Quảng Phú',
      'Xã Hòa Vang',
      'Xã Duy Xuyên',
      'Xã Tam Xuân',
      'Xã Tây Hồ',
      'Xã Chiên Đàn',
      'Xã Phú Ninh',
      'Xã Tiên Phước',
      'Xã Đại Lộc'
    ]
  },
  {
    value: 'Thành phố Huế',
    label: 'Thành phố Huế',
    helper: '40 đơn vị cấp xã sau sắp xếp 2025',
    wards: [
      'Phường Phong Điền',
      'Phường Phong Thái',
      'Phường Phong Dinh',
      'Phường Phong Phú',
      'Phường Phong Quảng',
      'Phường Hương Trà',
      'Phường Kim Trà',
      'Phường Kim Long',
      'Phường Hương An',
      'Phường Phú Xuân',
      'Phường Thuận Hóa',
      'Phường Vỹ Dạ',
      'Phường An Cựu',
      'Xã Quảng Điền',
      'Xã Đan Điền',
      'Xã Phú Hồ',
      'Xã Phú Vang',
      'Xã Vinh Lộc',
      'Xã Hưng Lộc',
      'Xã Phú Lộc',
      'Xã Chân Mây - Lăng Cô',
      'Xã Nam Đông',
      'Xã A Lưới 1',
      'Xã A Lưới 2',
      'Xã Long Quảng'
    ]
  },
  {
    value: 'Thành phố Cần Thơ',
    label: 'Thành phố Cần Thơ',
    helper: '103 đơn vị cấp xã sau sắp xếp 2025',
    wards: [
      'Phường Ninh Kiều',
      'Phường Cái Khế',
      'Phường Tân An',
      'Phường An Bình',
      'Phường Thới An Đông',
      'Phường Bình Thủy',
      'Phường Long Tuyền',
      'Phường Cái Răng',
      'Phường Hưng Phú',
      'Phường Ô Môn',
      'Phường Long Phú 1',
      'Phường Đại Thành',
      'Phường Ngã Bảy',
      'Phường Phú Lợi',
      'Phường Sóc Trăng',
      'Phường Mỹ Xuyên',
      'Phường Vĩnh Phước',
      'Phường Vĩnh Châu',
      'Phường Khánh Hòa',
      'Phường Ngã Năm',
      'Xã Phong Điền',
      'Xã Xà Phiên',
      'Xã Lương Tâm',
      'Xã Thạnh Xuân',
      'Xã Tân Hòa',
      'Xã Trường Long Tây',
      'Xã Châu Thành',
      'Xã Đông Phước',
      'Xã Phú Hữu',
      'Xã Tân Bình',
      'Xã Hòa An',
      'Xã Phương Bình',
      'Xã Tân Phước Hưng',
      'Xã Hiệp Hưng',
      'Xã Trường Long',
      'Xã Thạnh Phú',
      'Xã Thới Hưng',
      'Xã Phong Nẫm',
      'Xã Mỹ Phước',
      'Xã Lai Hòa',
      'Xã Vĩnh Hải'
    ]
  }
]

const selectedCityOption = computed(() => cityOptions.find((city) => city.value === selectedCity.value) || null)
const wardOptions = computed(() => selectedCityOption.value?.wards || [])
const formattedLocation = computed(() => {
  const address = streetAddress.value.trim()
  return [address, selectedWard.value, selectedCity.value].filter(Boolean).join(', ')
})
const selectedStatusMeta = computed<PublishChoice>(() => (
  publishChoices.find((choice) => choice.value === selectedPublishStatus.value) || defaultPublishChoice
))
const selectedSkills = computed(() => (
  skillOptions.value.filter((skill) => selectedSkillIds.value.includes(Number(skill.id)))
))
const selectedSkillNames = computed(() => selectedSkills.value.map((skill) => skill.name))
const composedRequirements = computed(() => {
  const lines: string[] = []

  if (selectedSkillNames.value.length > 0) {
    lines.push(`Kỹ năng: ${selectedSkillNames.value.join(', ')}`)
  }
  if (selectedExperience.value) {
    lines.push(`Kinh nghiệm: ${selectedExperience.value}`)
  }
  if (selectedWorkTime.value) {
    lines.push(`Thời gian làm việc: ${selectedWorkTime.value}`)
  }
  if (requirementNotes.value.trim()) {
    lines.push(`Ghi chú: ${requirementNotes.value.trim()}`)
  }

  return lines.join('\n')
})

watch(formattedLocation, (value) => {
  form.value.location = value
})

function setPublishStatus(status: PublishStatus) {
  selectedPublishStatus.value = status
  form.value.status = status
}

function sortSkills(skills: SkillOption[]) {
  return [...skills].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}

async function loadSkills() {
  try {
    skillsLoading.value = true
    const response: any = await JobService.getEnterpriseSkills()
    skillOptions.value = sortSkills(Array.isArray(response?.data) ? response.data : [])
  } catch {
    toast.warning('Không thể tải kỹ năng', 'Danh sách kỹ năng từ hệ thống chưa sẵn sàng, bạn vẫn có thể nhập các yêu cầu khác.')
  } finally {
    skillsLoading.value = false
  }
}

function toggleSkill(skillID: number) {
  if (selectedSkillIds.value.includes(skillID)) {
    selectedSkillIds.value = selectedSkillIds.value.filter((id) => id !== skillID)
    return
  }
  selectedSkillIds.value = [...selectedSkillIds.value, skillID]
}

async function addSkill() {
  const name = newSkillName.value.trim()
  if (!name) {
    toast.warning('Chưa có tên kỹ năng', 'Vui lòng nhập kỹ năng cần thêm.')
    return
  }

  const existed = skillOptions.value.find((skill) => skill.name.toLowerCase() === name.toLowerCase())
  if (existed) {
    if (!selectedSkillIds.value.includes(Number(existed.id))) {
      selectedSkillIds.value = [...selectedSkillIds.value, Number(existed.id)]
    }
    newSkillName.value = ''
    toast.info('Kỹ năng đã có', `${existed.name} đã được chọn trong danh sách.`)
    return
  }

  try {
    creatingSkill.value = true
    const response: any = await JobService.createEnterpriseSkill({ name })
    const createdSkill = response?.data
    if (!createdSkill?.id) {
      throw new Error(response?.message || 'Không thể thêm kỹ năng.')
    }
    skillOptions.value = sortSkills([...skillOptions.value, createdSkill])
    selectedSkillIds.value = [...selectedSkillIds.value, Number(createdSkill.id)]
    newSkillName.value = ''
    toast.success('Đã thêm kỹ năng', `${createdSkill.name} đã được thêm vào dữ liệu hệ thống.`)
  } catch (error: any) {
    toast.error('Không thể thêm kỹ năng', error?.data?.message || error?.message || 'Vui lòng thử lại sau.')
  } finally {
    creatingSkill.value = false
  }
}

function closeLocationDropdown() {
  openLocationDropdown.value = null
}

function toggleLocationDropdown(type: LocationDropdown) {
  if (type === 'ward' && !selectedCityOption.value) return
  openLocationDropdown.value = openLocationDropdown.value === type ? null : type
}

function selectCity(city: CityOption) {
  selectedCity.value = city.value
  selectedWard.value = ''
  streetAddress.value = ''
  closeLocationDropdown()
}

function selectWard(ward: string) {
  selectedWard.value = ward
  closeLocationDropdown()
}

function resetLocation() {
  selectedCity.value = ''
  selectedWard.value = ''
  streetAddress.value = ''
  closeLocationDropdown()
}

function handleLocationClickOutside(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Node)) return
  if (!locationPickerRef.value?.contains(target)) closeLocationDropdown()
}

onMounted(() => {
  document.addEventListener('click', handleLocationClickOutside)
  loadSkills()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleLocationClickOutside)
})

const submitJob = async (status: PublishStatus = selectedPublishStatus.value) => {
  if (!form.value.title || !form.value.salary || !form.value.description || !form.value.slots) {
    toast.warning('Thiếu thông tin bắt buộc', 'Vui lòng điền đủ tiêu đề, mức lương, mô tả và số lượng tuyển dụng.')
    return
  }

  try {
    submitting.value = true
    submitIntent.value = status
    errorMessage.value = ''
    const payload = {
      title: form.value.title.trim(),
      salary: form.value.salary.trim(),
      description: form.value.description.trim(),
      requirements: composedRequirements.value,
      location: formattedLocation.value.trim() || form.value.location.trim(),
      slots: Number(form.value.slots),
      status,
      skill_ids: selectedSkillIds.value
    }
    const response: any = await JobService.createEnterpriseJob(payload)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể lưu tin tuyển dụng.')
    }
    toast.addToast({
      type: 'success',
      title: status === 'DRAFT' ? 'Đã lưu bản nháp' : 'Đã gửi duyệt tin tuyển dụng',
      message: status === 'DRAFT'
        ? 'Tin đã được lưu trong danh sách bản nháp để bạn tiếp tục chỉnh sửa.'
        : 'Tin đã được tạo và chuyển sang trạng thái chờ admin xét duyệt.',
      duration: 5200
    })
    router.push('/enterprise/jobs')
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo tin tuyển dụng.'
    toast.error('Không thể tạo tin tuyển dụng', errorMessage.value)
  } finally {
    submitting.value = false
    submitIntent.value = null
  }
}
</script>

<style scoped>
.qw-location-fade-enter-active,
.qw-location-fade-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.qw-location-fade-enter-from,
.qw-location-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.qw-location-scroll {
  scrollbar-color: #bae6fd #f8fafc;
  scrollbar-width: thin;
}

.qw-location-scroll::-webkit-scrollbar {
  width: 6px;
}

.qw-location-scroll::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.qw-location-scroll::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 999px;
}

.qw-location-scroll::-webkit-scrollbar-thumb {
  background: #bae6fd;
  border-radius: 999px;
}

.qw-location-scroll::-webkit-scrollbar-thumb:hover {
  background: #38bdf8;
}

.qw-chip-scroll {
  scrollbar-color: #bae6fd transparent;
  scrollbar-width: thin;
}

.qw-chip-scroll::-webkit-scrollbar {
  width: 6px;
}

.qw-chip-scroll::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.qw-chip-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.qw-chip-scroll::-webkit-scrollbar-thumb {
  background: #bae6fd;
  border-radius: 999px;
}

.qw-chip-scroll::-webkit-scrollbar-thumb:hover {
  background: #38bdf8;
}
</style>
