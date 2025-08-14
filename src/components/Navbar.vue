<template>
  <div class="navbar">
    <div class="profile" @click="togglePanel">
      <span class="username">{{ username || "Foydalanuvchi" }}</span>
    </div>

    <!-- Ongdan chiqadigan panel -->
    <div v-if="isPanelOpen" class="side-panel-overlay" @click.self="closePanel">
      <div class="side-panel">
        <h2>Profil</h2>
        <p><strong>F.I.Sh:</strong> {{ username }}</p>
        <p><strong>Email:</strong> {{ email }}</p>
        <p><strong>Roli:</strong> {{ role }}</p>

        <hr />

        <button @click="logout" class="logout-btn">🚪 Chiqish</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/api"; // axios instansiyasi

const router = useRouter();

const username = ref("");
const email = ref("");
const role = ref("");

const isPanelOpen = ref(false);

const fetchProfile = async () => {
  try {
    const res = await api.get("/api/v1/user_data");

    const user = res.data.user; // ✅ to‘g‘ri yo‘l
    username.value = user.name || "Foydalanuvchi"; // yoki user.username
    email.value = user.email || "-";
    role.value = user.role?.name || "-"; // agar `role` mavjud bo‘lsa
  } catch (error) {
    console.error("Profilni olishda xatolik:", error);
    logout();
  } 
};

const togglePanel = () => {
  isPanelOpen.value = !isPanelOpen.value;
  if (isPanelOpen.value) {
    fetchProfile();
  }
};

const closePanel = () => {
  isPanelOpen.value = false;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  router.push("/login");
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.navbar {
  background-color: #1e293b;
  padding: 12px 24px;
  display: flex;
  justify-content: flex-end;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
}

.profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #f1f5f9;
  font-weight: 600;
  font-size: 16px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.profile:hover {
  background-color: #334155;
}

.side-panel-overlay {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 200;
}

.side-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  background-color: #f8fafc;
  box-shadow: -6px 0 20px rgba(0, 0, 0, 0.15);
  padding: 30px 24px;
  overflow-y: auto;
  animation: slideIn 0.3s ease forwards;
  border-radius: 0 0 0 12px;
  display: flex;
  flex-direction: column;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.side-panel h2 {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
  font-size: 24px;
  text-align: center;
}

.side-panel p {
  font-size: 16px;
  margin-bottom: 12px;
  color: #334155;
}

hr {
  border: none;
  height: 1px;
  background-color: #cbd5e1;
  margin: 20px 0;
  width: 100%;
}

.logout-btn {
  margin-top: auto;
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  user-select: none;
}

.logout-btn:hover {
  background-color: #b91c1c;
}
</style>
