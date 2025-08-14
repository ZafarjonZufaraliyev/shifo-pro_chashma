<template>
     <div :class="{ dark: isDarkMode }">
          <!-- Mobil uchun sidebar toggle tugmasi -->
          <button class="toggle-button" @click="toggleSidebar">☰</button>

          <!-- Overlay (mobil versiyada sidebar ochilganda) -->
          <div v-if="isSidebarOpen && !isDesktop" class="overlay" @click="closeSidebar"></div>

          <!-- Sidebar -->
          <div :class="['sidebar', { open: isSidebarOpen || isDesktop, dark: isDarkMode }]">
               <div class="top-bar">
                    <div class="logo">
                         <img src="../assets/image/logo.png" alt="Logo" />
                         <h3>Koinot Kavsari</h3>
                    </div>
                    <button class="dark-toggle" @click="toggleDarkMode"
                         :title="isDarkMode ? 'Light mode' : 'Dark mode'">
                         <span v-if="isDarkMode">🌞</span>
                         <span v-else>🌙</span>
                    </button>
               </div>

               <ul>
                    <li>
                         <router-link to="/callCenter">Bosh sahifa</router-link>


                    </li>
                    <li>
                         <router-link to="/callCenter/roomsCallCenter">Xonalar</router-link>
                    </li>
               </ul>


               <!-- Select - telefon uchun responsive -->

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
      selectedType: "", // agar kerak bo‘lmasa o‘chiring
    };
  },
  mounted() {
    // Oynaning o‘lchami o‘zgarganda handleResize chaqiramiz
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    // Komponent o‘chirilganda eventni tozalaymiz
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
      // Dark modeni localStorage-ga saqlash uchun qo'shish mumkin:
      // localStorage.setItem('darkMode', this.isDarkMode);
    },
    handleResize() {
      this.isDesktop = window.innerWidth >= 768;
      // Desktopda sidebar doim ko‘rinadi, shuning uchun mobilda ochiq holatni tozalash
      if (this.isDesktop) {
        this.isSidebarOpen = false;
      }
    },
  },
  created() {
    // Sahifa yuklanganda darkMode ni localStorage dan o'qib olish (agar saqlangan bo'lsa)
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      this.isDarkMode = savedDarkMode === "true";
    }
  },
};
</script>


<style scoped>
/* ===== CSS o'zgaruvchilar (temaga mos) ===== */
.sidebar-wrapper.dark {
  --sidebar-bg: #1e1e1e;
  --link-color: white;
  --hover-bg: #1A6291;
  --hover-color: white;
}

.sidebar-wrapper {
  --sidebar-bg: #fff;
  --link-color: #000;
  --hover-bg: #1A6291;
  --hover-color: white;
}

/* ===== Sidebar asosiy ===== */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 270px;
  height: 100vh;
  background: var(--sidebar-bg);
  color: var(--link-color);
  padding: 20px;
  z-index: 1000;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: 0.3s ease;
  transform: translateX(-100%);
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

/* ===== Top Bar ===== */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo img {
  width: 40px;
}

.logo h3 {
  margin: 0;
  font-size: 18px;
}

/* ===== Linklar ===== */
.sidebar ul {
  list-style: none;
  padding: 20px 0 0 0;
  margin: 0;
}

.sidebar li {
  margin: 12px 0;
}

.sidebar a {
  text-decoration: none;
  color: var(--link-color);
  display: block;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.sidebar a.router-link-exact-active,
.sidebar a:hover {
  background-color: var(--hover-bg);
  color: var(--hover-color);
}

/* ===== Accordion (section link) tugma ===== */
.main-link {
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
  width: 100%;
  text-align: left;
  padding: 10px 15px;
  color: var(--link-color);
  border-radius: 8px;
  transition: background 0.2s;
  position: relative;
}

.main-link:hover,
.main-link.active {
  background: var(--hover-bg);
  color: var(--hover-color);
}

.main-link::after {
  content: '▾';
  position: absolute;
  right: 15px;
  transition: transform .25s;
}

.main-link.active::after {
  transform: rotate(-180deg);
}

.sub-menu {
  padding-left: 15px;
}

.sub-menu li {
  margin: 8px 0;
}

/* ===== Dark Toggle ===== */
.dark-toggle {
  font-size: 18px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 2px solid #1A6291;
  background: white;
  color: #1A6291;
  cursor: pointer;
}

.sidebar-wrapper.dark .dark-toggle {
  background: var(--sidebar-bg);
  color: white;
}

/* ===== Mobil toggle button ===== */
.toggle-button {
  display: none;
}

@media (max-width: 768px) {
  .toggle-button {
    display: block;
    position: fixed;
    top: 5px;
    left: 20px;
    z-index: 1100;
    background-color: var(--sidebar-bg);
    color: var(--link-color);
    border: 2px solid #1A6291;
    padding: 8px 14px;
    font-size: 18px;
    cursor: pointer;
    border-radius: 8px;
  }
}

/* ===== Overlay ===== */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 900;
}

/* ===== Select (pastda) ===== */
.select-wrapper {
  margin-top: auto;
  padding-top: 20px;
}

.custom-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
}
</style>

