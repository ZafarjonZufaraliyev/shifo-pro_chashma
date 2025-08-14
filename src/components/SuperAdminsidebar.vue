<template>
  <div :class="[{ dark: isDarkMode }, 'sidebar-wrapper']">
    <!-- 📱 Mobil hamburger -->
    <button v-if="!isDesktop" class="toggle-button" @click="toggleSidebar">☰</button>

    <!-- Overlay (mobil) -->
    <div v-if="isSidebarOpen && !isDesktop" class="overlay" @click="closeSidebar"></div>

    <!-- 🚀 Sidebar -->
    <nav :class="['sidebar', { open: isSidebarOpen || isDesktop, dark: isDarkMode }]">
      <!-- Logo va rejim tugmasi -->
      <div class="top-bar">
        <div class="logo">
          <img :src="logo" alt="Logo" />
          <h3>Koinot Kavsari</h3>
        </div>

        <button
          class="dark-toggle"
          @click="toggleDarkMode"
          :title="isDarkMode ? 'Light mode' : 'Dark mode'"
          aria-label="Toggle dark mode"
        >
          <span v-if="isDarkMode">🌞</span>
          <span v-else>🌙</span>
        </button>
      </div>

      <!-- 📋 Asosiy linklar + accordion -->
      <ul class="primary-list">
        <li>
          <router-link to="/admin" @click="closeSidebar" active-class="router-link-active" exact>
            🏠 Bosh sahifa
          </router-link>
        </li>
        <li>
          <router-link to="/admin/bemorlar" @click="closeSidebar" active-class="router-link-active">
            Davolonuvchilar
          </router-link>
        </li>
         <li>
          <router-link to="/admin/bemorSpiska" @click="closeSidebar" active-class="router-link-active">
            Mijozlar ro'yxati
          </router-link>
        </li>
        <li>
          <router-link to="/admin/rooms" @click="closeSidebar" active-class="router-link-active">
            Xonalar
          </router-link>
        </li>
      
        <li>
          <router-link to="/admin/xodimlar" @click="closeSidebar" active-class="router-link-active">
            Xodimlar
          </router-link>
        </li>

        <!-- 🍽️ Oshxona -->
        <li>
          <button
            class="main-link"
            :class="{ active: activeSection === 'oshxona' }"
            @click="toggleSection('oshxona')"
            aria-expanded="activeSection === 'oshxona'"
          >
            🍽️ Oshxona
          </button>
          <ul v-if="activeSection === 'oshxona'" class="sub-menu" role="region" aria-label="Oshxona submenu">
            <li>
              <router-link to="/admin/maxsulotlarOshxona" @click="closeSidebar" active-class="router-link-active">
                Oshxona Maxsulotlar
              </router-link>
            </li>
            <li>
              <router-link to="/admin/oshxonaOvqatlari" @click="closeSidebar" active-class="router-link-active">
                Oshxona ovqatlari
              </router-link>
            </li>
            
            <li>
              <router-link to="/admin/retseptOshxona" @click="closeSidebar" active-class="router-link-active">
                Oshxona Retsept
              </router-link>
            </li>
            <li>
              <router-link to="/admin/chiqimOshxona" @click="closeSidebar" active-class="router-link-active">
                Oshxona Chiqimlar
              </router-link>
            </li>
          </ul>
        </li>

        <!-- 🏬 Ombor -->
        <li>
          <button
            class="main-link"
            :class="{ active: activeSection === 'ombor' }"
            @click="toggleSection('ombor')"
            aria-expanded="activeSection === 'ombor'"
          >
            🏬 Ombor
          </button>
          <ul v-if="activeSection === 'ombor'" class="sub-menu" role="region" aria-label="Ombor submenu">
            <li>
              <router-link to="/admin/omborMaxsulotlar" @click="closeSidebar" active-class="router-link-active">
                Ombor Maxsulotlar
              </router-link>
            </li>
            <li>
              <router-link to="/admin/omborKirim" @click="closeSidebar" active-class="router-link-active">
                Ombor Kirim
              </router-link>
            </li>
            <li>
              <router-link to="/admin/omborChiqim" @click="closeSidebar" active-class="router-link-active">
                Ombor Chiqimlar
              </router-link>
            </li>
            <li>
              <router-link to="/admin/omborBalans" @click="closeSidebar" active-class="router-link-active">
                Ombor Balans
              </router-link>
            </li>
          </ul>
        </li>

        <!-- Kassa -->
        <li>
          <button
            class="main-link"
            :class="{ active: activeSection === 'kassa' }"
            @click="toggleSection('kassa')"
            aria-expanded="activeSection === 'kassa'"
          >
            🏬 Kassa
          </button>
          <ul v-if="activeSection === 'kassa'" class="sub-menu" role="region" aria-label="Kassa submenu">
            
            <li>
              <router-link to="/admin/kassaStatistika" @click="closeSidebar" active-class="router-link-active">
                Kassa Statistika
              </router-link>
            </li>
            <li>
              <router-link to="/admin/kasaFilter" @click="closeSidebar" active-class="router-link-active">
                Bemorlar kassa
              </router-link>
            </li>
            <li>
              <router-link to="/admin/kassaTolovlarJadvali" @click="closeSidebar" active-class="router-link-active">
                Tolovlar Jadvali
              </router-link>
            </li>
            <li>
              <router-link to="/admin/kassaTolovQoshish" @click="closeSidebar" active-class="router-link-active">
                Tolov Qoshish
              </router-link>
            </li>
            
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import "@/assets/css/superNavbar.css";
import logo from "@/assets/image/logo.png";  // << shu yerda import qilamiz

export default {
  name: "SuperSidebar",
  data() {
    return {
      isSidebarOpen: false,
      isDarkMode: false,
      isDesktop: window.innerWidth >= 768,
      activeSection: "", // accordion holati
      // logo ni endi data ichida return qilamiz
      logo: logo,
    };
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    closeSidebar() {
      if (!this.isDesktop) this.isSidebarOpen = false;
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
    },
    handleResize() {
      this.isDesktop = window.innerWidth >= 768;
      if (this.isDesktop) this.isSidebarOpen = false;
    },
    toggleSection(section) {
      this.activeSection = this.activeSection === section ? "" : section;
    },
  },
};
</script>


<style scoped>
/* ===== Umumiy ===== */
.sidebar-wrapper {
  --sidebar-bg: #1e1e2d;
  --link-color: #c7c7d9;
  transition: background-color 0.3s ease;
  background-color: var(--sidebar-bg);
  color: var(--link-color);
}

.sidebar-wrapper.dark {
  --sidebar-bg: #13131f;
  --link-color: #c7c7d9;
  background-color: var(--sidebar-bg);
  color: var(--link-color);
}

/* ===== Layout ===== */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 290px;
  height: 100vh;
  background: var(--sidebar-bg);
  color: #fff;
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.3s ease, background-color 0.3s ease;
  z-index: 1000;
}

.sidebar.dark {
  background: var(--sidebar-bg);
}

.sidebar.open {
  transform: translateX(0);
}

/* Desktopda doim ko‘rinadi */
@media (min-width: 768px) {
  .sidebar {
    position: static;
    transform: none;
  }

  .toggle-button {
    display: none;
  }
}

/* ===== Overlay ===== */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

/* ===== Top‑bar ===== */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.dark-toggle {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #ffd86b;
}

/* ===== Linklar ===== */
.primary-list,
.sub-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.primary-list > li {
  margin: 0.15rem 0;
}

a,
.main-link {
  display: block;
  padding: 0.65rem 1.25rem;
  color: var(--link-color);
  text-decoration: none;
  border-radius: 4px;
  user-select: none;
}

a.router-link-active,
a.router-link-exact-active,
a:hover,
.main-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* ===== Accordion tugma ===== */
.main-link {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
  position: relative;
  user-select: none;
}

.main-link::after {
  content: "▾";
  position: absolute;
  right: 1rem;
  transition: transform 0.25s;
}

.main-link.active::after {
  transform: rotate(-180deg);
}

/* ===== Sub‑menu ===== */
.sub-menu {
  padding-left: 1.25rem;
}

.sub-menu li {
  margin: 0.35rem 0;
}

/* ===== Scrollbar ===== */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

/* ===== Mobil hamburger ===== */
.toggle-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  background: var(--sidebar-bg);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.65rem;
  font-size: 1.25rem;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  user-select: none;
}
</style>
