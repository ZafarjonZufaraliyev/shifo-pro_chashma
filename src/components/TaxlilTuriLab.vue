<template>
  <div class="container">
    <h2>🧪 Tahlil turlari ro‘yxati va yangi tahlil qo‘shish</h2>

    <div v-if="loading" class="loading">Yuklanmoqda...</div>
    <div v-else>
      <ul class="tahlil-list">
        <li v-for="type in testTypes" :key="type.id" class="tahlil-item">
          <strong>{{ type.name }}</strong> – {{ type.description }}
        </li>
      </ul>

      <hr />

      <h3>Yangi tahlil turi qo‘shish</h3>

      <label>
        Tahlil nomi:
        <input type="text" v-model="newTestName" placeholder="Masalan: Qon glyukoza" />
      </label>

      <label>
        Tahlil tavsifi:
        <input type="text" v-model="newTestDescription" placeholder="Tavsif (ixtiyoriy)" />
      </label>

      <button
        :disabled="!newTestName.trim() || submitting"
        @click="addNewTestType"
      >
        {{ submitting ? "Qo‘shilmoqda..." : "Tahlil turini qo‘shish" }}
      </button>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const testTypes = ref([]);
const loading = ref(true);
const submitting = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

const newTestName = ref("");
const newTestDescription = ref("");

const fetchTestTypes = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token topilmadi, iltimos tizimga kiring");

    const res = await axios.get("/api/v1/lab-test-types", {
      headers: { Authorization: `Bearer ${token}` },
    });
    testTypes.value = res.data;
  } catch (error) {
    console.error("Tahlil turlarini olishda xatolik:", error);
    errorMsg.value = "Tahlil turlarini yuklashda muammo yuz berdi.";
  } finally {
    loading.value = false;
  }
};

const addNewTestType = async () => {
  errorMsg.value = "";
  successMsg.value = "";
  if (!newTestName.value.trim()) {
    errorMsg.value = "Tahlil nomini kiriting.";
    return;
  }

  submitting.value = true;
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token topilmadi, iltimos tizimga kiring");

    // POST so'rov yuboramiz yangi tahlil turi uchun
    const res = await axios.post(
      "/api/v1/lab-test-types",
      {
        name: newTestName.value.trim(),
        description: newTestDescription.value.trim(),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Yangi tahlil turi muvaffaqiyatli qo‘shildi, uni ro‘yxatga qo‘shamiz
    testTypes.value.push(res.data);

    successMsg.value = "Yangi tahlil turi muvaffaqiyatli qo‘shildi!";
    newTestName.value = "";
    newTestDescription.value = "";
  } catch (error) {
    console.error("Tahlil turini qo‘shishda xatolik:", error);
    errorMsg.value = "Xatolik yuz berdi, iltimos qayta urinib ko‘ring.";
  } finally {
    submitting.value = false;
  }
};

onMounted(fetchTestTypes);
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  font-family: sans-serif;
  border: 1px solid #ccc;
  background: #f9f9f9;
  border-radius: 8px;
}

.loading {
  font-style: italic;
  color: #555;
}

.tahlil-list {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.tahlil-item {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fff;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
}

input[type="text"] {
  width: 100%;
  padding: 6px 10px;
  margin-top: 4px;
  border: 1px solid #aaa;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  padding: 10px 16px;
  background: #0077cc;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

button:disabled {
  background: #999;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #005fa3;
}

.error-msg {
  margin-top: 10px;
  color: #b10000;
  font-weight: 600;
}

.success-msg {
  margin-top: 10px;
  color: #007700;
  font-weight: 600;
}
</style>
