<template>
  <div class="min-h-screen bg-slate-50/50 font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white scroll-smooth">
    <!-- Navbar -->
    <header class="fixed top-0 inset-x-0 z-50 transition-all duration-300 backdrop-blur-xl bg-white/75 border-b border-slate-100/80 shadow-sm shadow-slate-100/50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition-opacity">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <Icon name="uil:briefcase" class="w-5 h-5 text-white" />
          </div>
          <span class="tracking-tight text-slate-900 font-extrabold text-lg">Quick<span class="text-indigo-600">Work</span></span>
        </NuxtLink>

        <!-- Desktop Menu Links -->
        <div class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" class="hover:text-indigo-600 transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-indigo-600 after:transition-all after:duration-300">Tính năng</a>
          <a href="#workflows" class="hover:text-indigo-600 transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-indigo-600 after:transition-all after:duration-300">Quy trình</a>
          <a href="#testimonials" class="hover:text-indigo-600 transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-indigo-600 after:transition-all after:duration-300">Đánh giá</a>
          <a href="#faq" class="hover:text-indigo-600 transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-indigo-600 after:transition-all after:duration-300">Giải đáp</a>
        </div>

        <!-- Desktop Action Buttons -->
        <div class="hidden md:flex items-center gap-4">
          <NuxtLink 
            to="/auth/login" 
            class="text-sm font-semibold text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all"
          >
            Đăng nhập
          </NuxtLink>
          <NuxtLink 
            to="/auth/register" 
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200"
          >
            Đăng ký ngay
          </NuxtLink>
        </div>

        <!-- Mobile Menu Toggle Button -->
        <div class="md:hidden">
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen" 
            class="p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            <Icon :name="isMobileMenuOpen ? 'uil:multiply' : 'uil:bars'" class="w-6 h-6" />
          </button>
        </div>
      </nav>

      <!-- Mobile Menu Dropdown -->
      <transition 
        enter-active-class="transition duration-150 ease-out" 
        enter-from-class="transform scale-95 opacity-0" 
        enter-to-class="transform scale-100 opacity-100" 
        leave-active-class="transition duration-100 ease-in" 
        leave-from-class="transform scale-100 opacity-100" 
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="isMobileMenuOpen" class="md:hidden border-b border-slate-100 bg-white/95 backdrop-blur-md">
          <div class="px-4 pt-2 pb-6 space-y-4 text-slate-700 font-semibold text-sm">
            <a href="#features" @click="isMobileMenuOpen = false" class="block py-2 hover:text-indigo-600 transition-colors">Tính năng</a>
            <a href="#workflows" @click="isMobileMenuOpen = false" class="block py-2 hover:text-indigo-600 transition-colors">Quy trình</a>
            <a href="#testimonials" @click="isMobileMenuOpen = false" class="block py-2 hover:text-indigo-600 transition-colors">Đánh giá</a>
            <a href="#faq" @click="isMobileMenuOpen = false" class="block py-2 hover:text-indigo-600 transition-colors">Giải đáp</a>
            <hr class="border-slate-100" />
            <div class="flex flex-col gap-2 pt-2">
              <NuxtLink 
                to="/auth/login" 
                @click="isMobileMenuOpen = false"
                class="w-full text-center py-2.5 px-4 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Đăng nhập
              </NuxtLink>
              <NuxtLink 
                to="/auth/register" 
                @click="isMobileMenuOpen = false"
                class="w-full text-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-md transition-all"
              >
                Đăng ký ngay
              </NuxtLink>
            </div>
          </div>
        </div>
      </transition>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-24 md:pt-44 md:pb-36 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50/50 overflow-hidden">
      <!-- Animated Gradient Blobs -->
      <div class="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div class="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[120px] -z-10 animate-pulse duration-7000"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <!-- Text and Search Widget Column -->
          <div class="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50/80 border border-indigo-100/50 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
              <span class="flex h-2 w-2 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              Kiến tạo cơ hội việc làm chất lượng cho sinh viên
            </div>
            
            <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08] sm:leading-[1.12]">
              Kết nối <span class="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Tài năng Sinh viên</span><br />
              với Doanh nghiệp hàng đầu
            </h1>
            
            <p class="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              QuickWork là nền tảng kết nối thực tập và việc làm bán thời gian chuyên nghiệp, mang đến hàng ngàn cơ hội thực tiễn cho sinh viên và giải pháp nhân sự tối ưu cho doanh nghiệp.
            </p>

            <!-- Modern Search Box Mock -->
            <div class="bg-white p-2 rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-100 max-w-xl mx-auto lg:mx-0 flex flex-col sm:flex-row items-center gap-2">
              <div class="flex items-center gap-2 px-3 py-2 flex-1 w-full border-b sm:border-b-0 sm:border-r border-slate-100">
                <Icon name="uil:search" class="text-indigo-500 w-5 h-5 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Kỹ năng, vị trí công việc..." 
                  class="bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full"
                  disabled
                />
              </div>
              <div class="flex items-center gap-2 px-3 py-2 flex-1 w-full">
                <Icon name="uil:map-marker" class="text-indigo-500 w-5 h-5 shrink-0" />
                <span class="text-sm text-slate-400">Toàn quốc</span>
              </div>
              <NuxtLink 
                to="/auth/register"
                class="w-full sm:w-auto bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 shrink-0"
              >
                <span>Tìm kiếm</span>
              </NuxtLink>
            </div>

            <!-- Two Main Action CTA Buttons -->
            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <NuxtLink 
                to="/auth/register" 
                class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-[2px] active:translate-y-0 transition-all duration-200 flex items-center gap-2"
              >
                <span>Bắt đầu miễn phí</span>
                <Icon name="uil:arrow-right" class="w-5 h-5" />
              </NuxtLink>
              <a 
                href="#features" 
                class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-xl shadow-sm hover:shadow hover:-translate-y-[2px] active:translate-y-0 transition-all duration-200 flex items-center gap-2"
              >
                <span>Khám phá tính năng</span>
              </a>
            </div>
          </div>

          <!-- Premium Interactive Candidate Mockup Graphic -->
          <div class="lg:col-span-5 relative mt-10 lg:mt-0 flex justify-center">
            <!-- Decorative Back Grids -->
            <div class="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl opacity-5 blur-2xl -z-10"></div>
            
            <!-- Dashboard Mock Box -->
            <div class="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-100/60 p-6 space-y-6 relative overflow-hidden">
              <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-red-400"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div class="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span class="text-xs text-slate-400 font-bold tracking-tight">quickwork.vn/students</span>
              </div>

              <!-- Main Student Profile Inside Mock -->
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-extrabold text-base shadow-md">
                    HA
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900 text-sm">Hoàng Minh Anh</h4>
                    <p class="text-[11px] text-slate-400 font-semibold">Sinh viên Đại học Bách Khoa</p>
                  </div>
                  <div class="ml-auto bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-[10px] font-bold border border-green-100/50">
                    Match 98%
                  </div>
                </div>

                <div class="flex flex-wrap gap-1.5">
                  <span class="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-semibold">Golang</span>
                  <span class="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-semibold">VueJS</span>
                  <span class="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-semibold">Docker</span>
                </div>
              </div>

              <!-- Floating Active Job Post Mock -->
              <div class="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex items-center justify-between transition-transform hover:scale-[1.02] duration-200">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-sm">
                    <Icon name="uil:bolt" class="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h5 class="text-xs font-bold text-slate-800">Backend developer Intern</h5>
                    <p class="text-[10px] text-slate-400 font-semibold">FPT Software • HN</p>
                  </div>
                </div>
                <Icon name="uil:check-circle" class="text-green-500 w-5 h-5" />
              </div>

              <!-- Bottom Invitation Alert Mock -->
              <div class="p-3 bg-indigo-600 rounded-2xl text-white flex items-center gap-3 shadow-lg shadow-indigo-100">
                <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Icon name="uil:bell" class="w-4 h-4 text-white" />
                </div>
                <div class="text-[11px] leading-tight">
                  <span class="font-bold">Shopee Vietnam</span> đã gửi yêu cầu kết nối học viên.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Company Showcase -->
    <section class="py-12 bg-white border-y border-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-xs font-bold text-slate-400 tracking-widest uppercase mb-8">
          Hơn 4,000+ doanh nghiệp hàng đầu tin tưởng tuyển dụng ứng viên
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-70">
          <div class="flex items-center gap-2 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 cursor-pointer">
            <Icon name="uil:cube" class="w-6 h-6 text-slate-900" />
            <span class="font-bold text-slate-950 tracking-tight text-sm">VNG Corp</span>
          </div>
          <div class="flex items-center gap-2 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 cursor-pointer">
            <Icon name="uil:brackets-curly" class="w-6 h-6 text-slate-900" />
            <span class="font-bold text-slate-950 tracking-tight text-sm">FPT Software</span>
          </div>
          <div class="flex items-center gap-2 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 cursor-pointer">
            <Icon name="uil:signal" class="w-6 h-6 text-slate-900" />
            <span class="font-bold text-slate-950 tracking-tight text-sm">Viettel Group</span>
          </div>
          <div class="flex items-center gap-2 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 cursor-pointer">
            <Icon name="uil:compass" class="w-6 h-6 text-slate-900" />
            <span class="font-bold text-slate-950 tracking-tight text-sm">Vingroup</span>
          </div>
          <div class="flex items-center gap-2 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 cursor-pointer">
            <Icon name="uil:shield" class="w-6 h-6 text-slate-900" />
            <span class="font-bold text-slate-950 tracking-tight text-sm">Techcombank</span>
          </div>
          <div class="flex items-center gap-2 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 cursor-pointer">
            <Icon name="uil:shopping-bag" class="w-6 h-6 text-slate-900" />
            <span class="font-bold text-slate-950 tracking-tight text-sm">Shopee VN</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-24 bg-slate-50/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto space-y-4">
          <span class="text-xs font-bold text-indigo-600 tracking-widest uppercase">Giải pháp toàn diện</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Nền tảng tuyển dụng sinh viên chất lượng nhất
          </h2>
          <p class="text-slate-500 max-w-2xl mx-auto text-base">
            Tích hợp toàn bộ công cụ đắc lực nhất giúp ứng viên ứng tuyển thuận lợi và giúp doanh nghiệp sở hữu nguồn lực trẻ vượt trội.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <!-- Feature 1 -->
          <div class="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-slate-100/80 hover:-translate-y-1.5 transition-all duration-300">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <Icon name="uil:graduation-cap" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Tìm kiếm Thực tập</h3>
            <p class="text-slate-500 text-sm leading-relaxed">
              Khám phá hàng ngàn công việc thực tập chất lượng cao tại các doanh nghiệp lớn và cơ hội làm nhân viên chính thức.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-slate-100/80 hover:-translate-y-1.5 transition-all duration-300">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Icon name="uil:clock" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Việc làm bán thời gian</h3>
            <p class="text-slate-500 text-sm leading-relaxed">
              Duyệt qua các công việc part-time đa dạng, thời gian linh hoạt để cân bằng tuyệt đối giữa việc học và làm.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-slate-100/80 hover:-translate-y-1.5 transition-all duration-300">
            <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <Icon name="uil:building" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Tuyển dụng Doanh nghiệp</h3>
            <p class="text-slate-500 text-sm leading-relaxed">
              Kênh đăng tin và kết nối thông minh giúp HR lọc hồ sơ, xếp lịch phỏng vấn sinh viên nhanh chóng chỉ với vài giây.
            </p>
          </div>

          <!-- Feature 4 -->
          <div class="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-slate-100/80 hover:-translate-y-1.5 transition-all duration-300">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Icon name="uil:file-check-alt" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Nộp đơn nhanh chóng</h3>
            <p class="text-slate-500 text-sm leading-relaxed">
              Tải hồ sơ CV cá nhân lên và nhấn gửi trực tiếp ứng tuyển vào doanh nghiệp dễ dàng không thông qua trung gian.
            </p>
          </div>

          <!-- Feature 5 -->
          <div class="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-slate-100/80 hover:-translate-y-1.5 transition-all duration-300">
            <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl mb-6 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
              <Icon name="uil:lock" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Bảo mật tuyệt đối</h3>
            <p class="text-slate-500 text-sm leading-relaxed">
              Mã hóa dữ liệu cá nhân, thông tin lý lịch và các tài liệu hồ sơ của bạn an toàn theo tiêu chuẩn bảo mật.
            </p>
          </div>

          <!-- Feature 6 -->
          <div class="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-slate-100/80 hover:-translate-y-1.5 transition-all duration-300">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <Icon name="uil:shield-check" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Xác thực doanh nghiệp</h3>
            <p class="text-slate-500 text-sm leading-relaxed">
              Doanh nghiệp bắt buộc tải lên giấy phép kinh doanh (GPKD) để loại bỏ tin giả và dự án không uy tín.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Workflows Section (Interactive Tabs) -->
    <section id="workflows" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto space-y-4">
          <span class="text-xs font-bold text-indigo-600 tracking-widest uppercase">Các bước vận hành</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Quy trình tuyển dụng đơn giản hơn bao giờ hết
          </h2>
          
          <!-- Interactive Selector Tab Buttons -->
          <div class="inline-flex bg-slate-100 p-1.5 rounded-2xl gap-2 mt-8">
            <button 
              @click="activeWorkflowTab = 'student'" 
              type="button"
              :class="['px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200', activeWorkflowTab === 'student' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-800']"
            >
              Học viên tìm việc
            </button>
            <button 
              @click="activeWorkflowTab = 'company'" 
              type="button"
              :class="['px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200', activeWorkflowTab === 'company' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-800']"
            >
              Doanh nghiệp tuyển dụng
            </button>
          </div>
        </div>

        <!-- tabbed workflows container -->
        <div class="mt-16 max-w-4xl mx-auto">
          <!-- Student Workflow tab contents -->
          <div v-if="activeWorkflowTab === 'student'" class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Step 1 -->
            <div class="text-center space-y-4">
              <div class="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl mx-auto shadow-sm">
                1
              </div>
              <h3 class="font-bold text-slate-900">Đăng ký tài khoản</h3>
              <p class="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                Khai báo thông tin cá nhân và tạo tài khoản trực tuyến miễn phí chỉ trong 30 giây.
              </p>
            </div>
            <!-- Step 2 -->
            <div class="text-center space-y-4">
              <div class="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl mx-auto shadow-sm">
                2
              </div>
              <h3 class="font-bold text-slate-900">Tìm kiếm việc làm</h3>
              <p class="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                Khám phá công việc thực tập/bán thời gian thích hợp với bộ lọc kỹ năng thông minh.
              </p>
            </div>
            <!-- Step 3 -->
            <div class="text-center space-y-4">
              <div class="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl mx-auto shadow-sm">
                3
              </div>
              <h3 class="font-bold text-slate-900">Nộp đơn ứng tuyển</h3>
              <p class="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                Gửi CV của bạn trực tiếp tới nhà tuyển dụng và nhận phản hồi thời gian thực qua hệ thống.
              </p>
            </div>
          </div>

          <!-- Company Workflow tab contents -->
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Step 1 -->
            <div class="text-center space-y-4">
              <div class="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl mx-auto shadow-sm">
                1
              </div>
              <h3 class="font-bold text-slate-900">Đăng ký hồ sơ</h3>
              <p class="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                Tạo hồ sơ nhà tuyển dụng và khai báo thông tin cơ bản của công ty.
              </p>
            </div>
            <!-- Step 2 -->
            <div class="text-center space-y-4">
              <div class="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl mx-auto shadow-sm">
                2
              </div>
              <h3 class="font-bold text-slate-900">Tải lên file GPKD</h3>
              <p class="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                Gửi file giấy phép kinh doanh hợp lệ lên hệ thống để xác thực tài khoản KYB.
              </p>
            </div>
            <!-- Step 3 -->
            <div class="text-center space-y-4">
              <div class="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl mx-auto shadow-sm">
                3
              </div>
              <h3 class="font-bold text-slate-900">Đăng tuyển vị trí</h3>
              <p class="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                Đăng vị trí tuyển dụng mới và tiếp nhận hàng loạt hồ sơ CV chất lượng từ sinh viên.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section id="stats" class="py-24 bg-slate-900 text-white relative overflow-hidden">
      <!-- Background glows -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] -z-10"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center items-center justify-center">
          <div class="space-y-3 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10">
            <div class="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              12,000+
            </div>
            <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">Học viên hoạt động</div>
          </div>
          <div class="space-y-3 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10">
            <div class="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              4,000+
            </div>
            <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">Doanh nghiệp đã kiểm chứng</div>
          </div>
          <div class="space-y-3 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10">
            <div class="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              850+
            </div>
            <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">Việc làm mới mỗi ngày</div>
          </div>
          <div class="space-y-3 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10">
            <div class="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              24,000+
            </div>
            <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">Lượt kết nối ứng tuyển</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Student Testimonials Section -->
    <section id="testimonials" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto space-y-4">
          <span class="text-xs font-bold text-indigo-600 tracking-widest uppercase">Đánh giá thực tế</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Sinh viên nói gì về QuickWork?
          </h2>
          <p class="text-slate-500 max-w-2xl mx-auto text-base">
            Khám phá những trải nghiệm thực tế từ các ứng viên sinh viên đã ứng tuyển thành công các vị trí thực tập mong muốn.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <!-- Testimonial 1 -->
          <div class="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="space-y-4">
              <div class="flex items-center gap-1 text-amber-400">
                <Icon name="uil:star" class="w-4 h-4" v-for="i in 5" :key="i" />
              </div>
              <p class="text-slate-600 text-sm leading-relaxed italic">
                "Nhờ có QuickWork, mình đã nhanh chóng tìm được vị trí thực tập Golang tại VNG Corp chỉ sau 1 tuần gửi CV. Đặc biệt là thông tin công ty rất rõ ràng nên mình thấy rất yên tâm khi phỏng vấn."
              </p>
            </div>
            <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs shrink-0">
                MA
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-950">Lê Minh Anh</h4>
                <p class="text-[10px] text-slate-400 font-semibold">Software Intern @ VNG</p>
              </div>
            </div>
          </div>

          <!-- Testimonial 2 -->
          <div class="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="space-y-4">
              <div class="flex items-center gap-1 text-amber-400">
                <Icon name="uil:star" class="w-4 h-4" v-for="i in 5" :key="i" />
              </div>
              <p class="text-slate-600 text-sm leading-relaxed italic">
                "Công cụ ứng tuyển nhanh trên QuickWork cực kỳ tiện lợi. Giao diện trực quan và phản hồi từ phía HR doanh nghiệp được tự động cập nhật liên tục qua thông báo thời gian thực."
              </p>
            </div>
            <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs shrink-0">
                HY
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-950">Nguyễn Hải Yến</h4>
                <p class="text-[10px] text-slate-400 font-semibold">Content Creator @ Shopee</p>
              </div>
            </div>
          </div>

          <!-- Testimonial 3 -->
          <div class="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="space-y-4">
              <div class="flex items-center gap-1 text-amber-400">
                <Icon name="uil:star" class="w-4 h-4" v-for="i in 5" :key="i" />
              </div>
              <p class="text-slate-600 text-sm leading-relaxed italic">
                "Tôi đã đăng ký với vai trò Nhà tuyển dụng doanh nghiệp và rất bất ngờ trước lượng CV chất lượng gửi về từ sinh viên các trường Đại học danh tiếng. Quy trình xác thực KYB giúp nền tảng rất sạch."
              </p>
            </div>
            <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-xs shrink-0">
                HD
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-950">Trần Hoàng Dương</h4>
                <p class="text-[10px] text-slate-400 font-semibold">HR Manager @ TechCorp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section id="faq" class="py-24 bg-slate-50/50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-4 mb-16">
          <span class="text-xs font-bold text-indigo-600 tracking-widest uppercase">Giải đáp thắc mắc</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Câu hỏi thường gặp
          </h2>
        </div>

        <!-- FAQ list accordion -->
        <div class="space-y-4">
          <!-- Item 1 -->
          <div class="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <button 
              @click="toggleFaq(0)" 
              class="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <span>QuickWork có mất phí đối với sinh viên không?</span>
              <Icon :name="activeFaqIndex === 0 ? 'uil:angle-up' : 'uil:angle-down'" class="w-5 h-5 text-indigo-600 shrink-0" />
            </button>
            <div v-show="activeFaqIndex === 0" class="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-3">
              Hoàn toàn miễn phí! QuickWork không thu bất kỳ khoản phí nào đối với học viên/sinh viên khi tạo tài khoản, tải lên CV và nộp đơn tuyển dụng.
            </div>
          </div>

          <!-- Item 2 -->
          <div class="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <button 
              @click="toggleFaq(1)" 
              class="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <span>Làm thế nào để doanh nghiệp được xác thực hồ sơ?</span>
              <Icon :name="activeFaqIndex === 1 ? 'uil:angle-up' : 'uil:angle-down'" class="w-5 h-5 text-indigo-600 shrink-0" />
            </button>
            <div v-show="activeFaqIndex === 1" class="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-3">
              Sau khi tạo tài khoản Doanh nghiệp, nhà tuyển dụng cần tải lên bản sao Giấy phép Kinh doanh (GPKD) hợp pháp thông qua hệ thống quản lý. Ban quản trị QuickWork sẽ tiến hành phê duyệt và cấp nhãn xác thực KYB trong vòng 24 giờ làm việc.
            </div>
          </div>

          <!-- Item 3 -->
          <div class="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <button 
              @click="toggleFaq(2)" 
              class="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <span>Sinh viên chưa có kinh nghiệm có tìm được việc không?</span>
              <Icon :name="activeFaqIndex === 2 ? 'uil:angle-up' : 'uil:angle-down'" class="w-5 h-5 text-indigo-600 shrink-0" />
            </button>
            <div v-show="activeFaqIndex === 2" class="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-3">
              Được! QuickWork được thành lập nhằm tập trung hỗ trợ các công việc thực tập (internship), công việc bán thời gian (part-time) và công việc dành cho lập trình viên junior chưa đòi hỏi nhiều số năm kinh nghiệm.
            </div>
          </div>

          <!-- Item 4 -->
          <div class="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <button 
              @click="toggleFaq(3)" 
              class="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <span>Nhà tuyển dụng có liên hệ trực tiếp với ứng viên không?</span>
              <Icon :name="activeFaqIndex === 3 ? 'uil:angle-up' : 'uil:angle-down'" class="w-5 h-5 text-indigo-600 shrink-0" />
            </button>
            <div v-show="activeFaqIndex === 3" class="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-3">
              Có. Toàn bộ thông tin CV của học viên sau khi ứng tuyển sẽ được gửi trực tiếp tới hòm thư quản lý của nhà tuyển dụng tương ứng, giúp hai bên liên lạc trao đổi trực tiếp không qua trung gian.
            </div>
          </div>

          <!-- Item 5 -->
          <div class="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <button 
              @click="toggleFaq(4)" 
              class="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <span>Hồ sơ CV của tôi có được bảo mật không?</span>
              <Icon :name="activeFaqIndex === 4 ? 'uil:angle-up' : 'uil:angle-down'" class="w-5 h-5 text-indigo-600 shrink-0" />
            </button>
            <div v-show="activeFaqIndex === 4" class="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-3">
              Có. Hệ thống của chúng tôi được bảo mật nâng cao. Chỉ những nhà tuyển dụng doanh nghiệp sở hữu các tin tuyển dụng bạn nộp hồ sơ mới có đặc quyền duyệt xem thông tin chi tiết và tải xuống CV của bạn.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sleek CTA Card Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-16 sm:px-12 sm:py-20 shadow-2xl overflow-hidden text-center space-y-6">
          <!-- Graphic background circle effects -->
          <div class="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full transform translate-x-12 -translate-y-12 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full transform -translate-x-16 translate-y-16 blur-2xl"></div>

          <span class="text-xs font-bold text-indigo-400 tracking-widest uppercase">Trải nghiệm hệ thống ngay</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
            Sẵn sàng bắt đầu hành trình tuyển dụng chất lượng cao?
          </h2>
          <p class="text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Đăng ký tài khoản QuickWork hôm nay để đón nhận những cơ hội việc làm và thu hút ứng viên tài năng đột phá nhất.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
            <NuxtLink 
              to="/auth/register" 
              class="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-[1px] active:translate-y-0 duration-200"
            >
              Đăng ký tài khoản miễn phí
            </NuxtLink>
            <NuxtLink 
              to="/auth/login" 
              class="w-full sm:w-auto text-white font-bold border border-white/20 hover:bg-white/5 px-8 py-4 rounded-xl transition-colors"
            >
              Đăng nhập hệ thống
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
        <!-- Col 1 -->
        <div class="md:col-span-4 space-y-4">
          <div class="flex items-center gap-2 font-bold text-xl text-white">
            <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Icon name="uil:briefcase" class="w-4 h-4 text-white" />
            </div>
            <span class="tracking-tight font-extrabold">Quick<span class="text-blue-500">Work</span></span>
          </div>
          <p class="text-sm leading-relaxed">
            QuickWork kết nối hiệu quả nguồn năng lực trẻ sinh viên tới hàng ngàn công ty, dự án công nghệ và văn phòng đại diện trên toàn quốc.
          </p>
        </div>

        <!-- Col 2 -->
        <div class="md:col-span-2 space-y-4">
          <h4 class="text-white font-bold text-sm">Về chúng tôi</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#features" class="hover:text-white transition-colors">Tính năng chính</a></li>
            <li><a href="#workflows" class="hover:text-white transition-colors">Quy trình</a></li>
            <li><a href="#stats" class="hover:text-white transition-colors">Số liệu</a></li>
          </ul>
        </div>

        <!-- Col 3 -->
        <div class="md:col-span-3 space-y-4">
          <h4 class="text-white font-bold text-sm">Điều khoản bảo mật</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Chính sách bảo mật</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Hỗ trợ khẩn cấp</a></li>
          </ul>
        </div>

        <!-- Col 4 -->
        <div class="md:col-span-3 space-y-4">
          <h4 class="text-white font-bold text-sm">Liên hệ hỗ trợ</h4>
          <p class="text-sm">Trụ sở: Hà Nội, Việt Nam</p>
          <p class="text-sm">Email: support@quickwork.vn</p>
          <p class="text-sm">Hotline: 1900 1234 (8h - 18h)</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>&copy; 2026 QuickWork. Kết nối tri thức, kiến tạo tương lai. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: false
})

const isMobileMenuOpen = ref(false)
const activeWorkflowTab = ref<'student' | 'company'>('student')
const activeFaqIndex = ref<number | null>(null)

const toggleFaq = (index: number) => {
  if (activeFaqIndex.value === index) {
    activeFaqIndex.value = null
  } else {
    activeFaqIndex.value = index
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

.font-sans {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
</style>