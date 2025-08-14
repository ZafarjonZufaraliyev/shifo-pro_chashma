<template>
  <div class="containerr">
    <h2 class="title">To‘lov qo‘shish</h2>

    <!-- To‘lov turi -->
    <div class="form-group">
      <label class="label">To‘lov turi:</label>
      <select v-model="form.type" class="input">
        <option value="kirim">Kirim</option>
        <option value="chiqim">Chiqim</option>
      </select>
    </div>

    <!-- Bemor tanlash -->
    <div class="form-group">
      <label class="label">Bemor:</label>
      <select v-model="selectedClientId" @change="onClientChange" class="input">
        <option value="" disabled>-- Bemorni tanlang --</option>
        <option v-for="client in clients" :key="client.id" :value="client.id">
          {{ client.familiya }} {{ client.ism }} {{ client.sharif }}
        </option>
      </select>
    </div>

    <!-- Bemor ma'lumotlari -->
    <div v-if="client" class="info">
      <p><strong>F.I.Sh:</strong> {{ client.familiya }} {{ client.ism }} {{ client.sharif }}</p>
      <p><strong>Telefon:</strong> {{ client.tel1 }}</p>
    </div>

    <!-- To‘lov summasi -->
    <form @submit.prevent="submitPayment">
      <div class="form-row">
        <input v-model.number="form.cash" type="number" placeholder="Naqd" class="input" />
        <input v-model.number="form.card" type="number" placeholder="Karta" class="input" />
      </div>
      <div class="form-row">
        <input v-model.number="form.click" type="number" placeholder="Click" class="input" />
        <input v-model.number="form.humo" type="number" placeholder="Humo" class="input" />
      </div>

      <!-- Avtomatik izoh -->
      <textarea v-model="form.note" class="textarea" readonly></textarea>

      <button
        type="submit"
        class="btn"
        :disabled="!selectedClientId"
      >
        Saqlash
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";

const router = useRouter();

const clients = ref([]);
const selectedClientId = ref("");
const client = ref(null);
const davolanishId = ref(null);

const form = ref({
  cash: 0,
  card: 0,
  click: 0,
  humo: 0,
  note: "",
  type: "kirim",
  from: "Laboratoriya",     // Har doim Laboratoriya (tashqi joy sifatida)
  fromDetail: "Laboratoriya",
  is_patient_payment: 0,    // Tashqi to‘lov deb belgilanadi
  user_id: null,
  cashier: "",
});

// Bemorlar ro‘yxatini olish
const fetchClients = async () => {
  try {
    const res = await api.get("/api/v1/clients");
    clients.value = res.data || [];
  } catch (e) {
    console.error("Bemorlar ro‘yxatini olishda xatolik:", e);
  }
};

// Bemor ma'lumotlarini olish
const fetchClientById = async (id) => {
  try {
    const res = await api.get(`/api/v1/clients/${id}`);
    client.value = res.data;
  } catch (e) {
    client.value = null;
  }
};

// Davolanish ID olish (kerak bo‘lsa)
const fetchDavolanishId = async (clientId) => {
  try {
    const res = await api.get(`/api/v1/davolanish?client_id=${clientId}`);
    davolanishId.value = res.data.length ? res.data[0].id : null;
  } catch {
    davolanishId.value = null;
  }
};

// Bemor tanlanganda ishga tushadi
const onClientChange = async () => {
  if (!selectedClientId.value) {
    client.value = null;
    davolanishId.value = null;
    form.value.note = "";
    return;
  }

  await fetchClientById(selectedClientId.value);
  await fetchDavolanishId(selectedClientId.value);

  form.value.user_id = client.value?.create_user_id || null;
  form.value.cashier = "";

  // Izohni avtomatik yangilash
  form.value.note = `Kirim: ${client.value.familiya} ${client.value.ism} ${client.value.sharif}`;
};

// To‘lov turi o‘zgarganda izohni yangilash
watch(
  () => form.value.type,
  () => {
    if (client.value) {
      form.value.note =
        form.value.type === "kirim"
          ? `Kirim: ${client.value.familiya} ${client.value.ism} ${client.value.sharif}`
          : `Chiqim: ${client.value.familiya} ${client.value.ism} ${client.value.sharif}`;
    }
  }
);

// To‘lovni yuborish
const submitPayment = async () => {
  try {
    form.value.is_patient_payment = 0; // Har doim tashqi to‘lov sifatida jo‘natiladi

    const payload = {
      ...form.value,
      client_id: selectedClientId.value || null,
      davolanish_id: davolanishId.value || null,
      from: "Laboratoriya",   // Bu yerda har doim Laboratoriya yoziladi
      datetime: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    await api.post("/api/v1/payments", payload);
    alert("To‘lov muvaffaqiyatli qo‘shildi");
    router.push("/admin/kassaFilter");
  } catch (e) {
    alert("Xatolik: to‘lov yuborilmadi");
    console.error(e);
  }
};

onMounted(() => {
  fetchClients();
});
</script>

<style scoped>
.containerr {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.title {
  font-size: 20px;
  margin-bottom: 16px;
  font-weight: bold;
}
.label {
  font-weight: bold;
  margin-bottom: 6px;
  display: block;
}
.input {
  padding: 8px;
  width: 100%;
  margin-top: 4px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 4px;
  margin-bottom: 16px;
  resize: none;
}
.form-group {
  margin-bottom: 16px;
}
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.btn {
  background-color: #28a745;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.info {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}
</style>
