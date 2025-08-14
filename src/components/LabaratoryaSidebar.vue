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
          <router-link to="/laborant" @click="closeSidebar" active-class="router-link-active" exact>
            🏠 Bosh sahifa
          </router-link>
        </li>
        <li>
          <router-link to="/laborant/natijalar" @click="closeSidebar" active-class="router-link-active">
             Natijalar
          </router-link>
        </li>
        <li>
          <router-link to="/laborant/taxlilTuri" @click="closeSidebar" active-class="router-link-active">
            Analiz turlari
          </router-link>
        </li>
      
        
         <li>
          <router-link to="/laborant/taxlilLab" @click="closeSidebar" active-class="router-link-active">
            Analiz parametrlari
          </router-link>
        </li>
        <li>
          <router-link to="/laborant/taxlilBriktrish" @click="closeSidebar" active-class="router-link-active">
            Bemor analiz
          </router-link>
        </li>
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
              <router-link to="/laborant/labaratoryaKassa" @click="closeSidebar" active-class="router-link-active">
                Bemor Kassa
              </router-link>
            </li>
            <li>
              <router-link to="/laborant/labaratoryaTolov" @click="closeSidebar" active-class="router-link-active">
                Bemor tolov
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
