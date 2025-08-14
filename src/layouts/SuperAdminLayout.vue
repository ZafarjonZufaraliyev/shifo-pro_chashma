<template>
  <div class="layout">
    <SuperAdminsidebar />
    <div class="main-content">
      <Navbar />
      <router-view />
    </div>
  </div>
</template>

<script>
import SuperAdminsidebar from '@/components/SuperAdminsidebar.vue';
import Navbar from '@/components/Navbar.vue';

export default {
  components: {
    SuperAdminsidebar,
    Navbar
  }
}
</script>

<style scoped>
.layout {
  display: flex;
}

.main-content {
  flex-grow: 1;
  padding: 20px;
}
</style>
