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
                    <li><router-link to="/oshxona" @click="closeSidebar">🏠 Bosh sahifa</router-link></li>
                    <li><router-link to="/oshxona/maxsulotlarOshxona" @click="closeSidebar">Maxsulotlar</router-link></li>
                    <li><router-link to="/oshxona/oshxonaOvqatlari" @click="closeSidebar">Maxsulotlar</router-link></li>
                    <li><router-link to="/oshxona/retseptOshxona" @click="closeSidebar">Retsept</router-link></li>
                    <li><router-link to="/oshxona/chiqimOshxona" @click="closeSidebar">Chiqimlar</router-link>
                    </li>

               </ul>

               <!-- Select - telefon uchun responsive -->

          </div>
     </div>
</template>

<script>
import "@/assets/css/oshxonaNavbar.css"
export default {
     name: "OshxonaSidebar",
     data() {
          return {
               isSidebarOpen: false,
               isDarkMode: false,
               isDesktop: window.innerWidth >= 768,
               selectedType: "",
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
     },
};
</script>

<style scoped>
/* Sidebar */
</style>
