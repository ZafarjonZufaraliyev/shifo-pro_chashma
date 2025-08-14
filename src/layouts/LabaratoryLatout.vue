<template>
  <div class="layout">
    <LabaratoryaSidebar />
    <div class="content">
      <Navbar />
      <router-view />
    </div>
  </div>
</template>

<script>
import LabaratoryaSidebar from '@/components/LabaratoryaSidebar.vue';
import Navbar from '@/components/Navbar.vue'

export default {
  name: "CallAdminLayout",
  components: {
    LabaratoryaSidebar,
    Navbar
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f3f4f6; /* yengil kulrang orqa fon */
}

.content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff; /* oq fon */
  box-shadow: inset 0 0 10px rgba(0,0,0,0.05);
  overflow-y: auto;
}
</style>
