<template>
  <div :class="{ dark: isDarkMode }">
    <!-- Mobil toggle tugmasi -->
    <button class="toggle-button" @click="toggleSidebar">☰</button>

    <!-- Mobil versiyada fonni bosganda yopiladi -->
    <div v-if="isSidebarOpen && !isDesktop" class="overlay" @click="closeSidebar"></div>

    <!-- Sidebar -->
    <div :class="['sidebar', { open: isSidebarOpen || isDesktop, dark: isDarkMode }]">
      <div class="top-bar">
        <div class="logo">
          <img src="@/assets/image/logo.png" alt="Logo" />
          <h3>Koinot Kavsari</h3>
        </div>
        <button class="dark-toggle" @click="toggleDarkMode" :title="isDarkMode ? 'Light mode' : 'Dark mode'">
          <span v-if="isDarkMode">🌞</span>
          <span v-else>🌙</span>
        </button>
      </div>

      <ul>
        <li><router-link to="/kassa" @click="closeSidebar">🏠 Bosh sahifa</router-link></li>
        <li><router-link to="/kassa/bemorlar" @click="closeSidebar">Davolanuvchilar</router-link></li>
        <li>
          <router-link to="/kassa/bemorSpiska" @click="closeSidebar" active-class="router-link-active">
            Mijozlar ro'yxati
          </router-link>
        </li>
        <li><router-link to="/kassa/rooms" @click="closeSidebar">Xonalar</router-link></li>

        <li>
          <button class="main-link" @click="toggleSection('kassa')">
            🏬 Kassa
          </button>
          <ul v-if="activeSection === 'kassa'" class="sub-menu">
            <li><router-link to="/kassa/kassaStatistika" @click="closeSidebar"> Statistika</router-link></li>
            <li><router-link to="/kassa/kasaFilter" @click="closeSidebar">Bemorlar Kassa</router-link></li>
            <li><router-link to="/kassa/kassaTolovlarJadvali" @click="closeSidebar">To‘lovlar Jadvali</router-link></li>
            <li><router-link to="/kassa/kassaTolovQoshish" @click="closeSidebar">To‘lov Qo‘shish</router-link></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "MiniSidebar",
  data() {
    return {
      isSidebarOpen: false,
      isDarkMode: false,
      isDesktop: window.innerWidth >= 768,
      activeSection: null,
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
      if (!this.isDesktop) {
        this.isSidebarOpen = false;
      }
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
    },
    handleResize() {
      this.isDesktop = window.innerWidth >= 768;
      if (this.isDesktop) {
        this.isSidebarOpen = false;
      }
    },
    toggleSection(section) {
      this.activeSection = this.activeSection === section ? null : section;
    },
  },
};
</script>

<style scoped>
/* ===== Umumiy ===== */
.sidebar-wrapper {
  --sidebar-bg: #1A6291;       /* Asosiy fon rangi: to‘q ko‘k */
  --link-color: #000;       /* Matn rangi: Toza oq */
  transition: background-color 0.3s ease;
  background-color: var(--sidebar-bg);
  color: var(--link-color);
}

.sidebar-wrapper.dark {
  --sidebar-bg: #14507a;       /* Dark rejim uchun biroz to‘qroq ko‘k */
  --link-color: #000;       /* Matn rangi: Doim oq */
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
  color: var(--link-color);
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.3s ease, background-color 0.3s ease;
  z-index: 1000;
  padding: 1.25rem 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.sidebar.dark {
  background: var(--sidebar-bg);
  color: var(--link-color);
}

.sidebar.open {
  transform: translateX(0);
}

/* Desktopda doim ko‘rinadi */
@media (min-width: 768px) {
  .sidebar {
    position: static;
    transform: none;
    box-shadow: none;
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
  padding: 0 1.5rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2); /* oq, biroz ko‘rinadigan */
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

.logo h3 {
  font-weight: 600;
  color: var(--link-color);
  user-select: none;
  margin: 0;
  font-size: 1.25rem;
}

.dark-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #ffd86b;
  user-select: none;
  transition: color 0.3s ease;
}

.dark-toggle:hover {
  color: #fff176;
}

/* ===== Linklar ===== */
.primary-list,
.sub-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.primary-list > li {
  margin: 0.3rem 0;
}

a,
.main-link {
  display: block;
  padding: 0.75rem 1.5rem;
  color: var(--link-color);
  text-decoration: none;
  border-radius: 6px;
  user-select: none;
  font-weight: 500;
  transition: background 0.3s ease, color 0.3s ease;
}

/* Matn hech qachon qora yoki kulrang emas, doim oq */
a.router-link-active,
a.router-link-exact-active,
a:hover,
.main-link:hover {
  background: rgba(255, 255, 255, 0.25);  /* Oq fon, lekin juda engil, orqa fon ko‘rinmas */
  color: #000!important;               /* Matn doim oq */
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
  font-weight: 600;
  padding-left: 1.5rem;
  padding-right: 2rem;
  color: var(--link-color);
}

.main-link::after {
  content: "▾";
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.25s;
  color: var(--link-color);
  pointer-events: none;
}

.main-link.active::after {
  transform: translateY(-50%) rotate(-180deg);
}

/* ===== Sub‑menu ===== */
.sub-menu {
  padding-left: 1.5rem;
}

.sub-menu li {
  margin: 0.5rem 0;
}

/* ===== Scrollbar ===== */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);  /* Oq rang, ko‘proq aniqlik uchun */
  border-radius: 3px;
}

/* ===== Mobil hamburger ===== */
.toggle-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  background: var(--sidebar-bg);
  color: var(--link-color);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 1.25rem;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  user-select: none;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.toggle-button:hover {
  background-color: #00497a;  /* To‘qroq hover rangi */
  color: #000;
}

</style>
