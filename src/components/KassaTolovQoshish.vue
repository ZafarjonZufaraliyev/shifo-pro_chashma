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

    <!-- Kimdan -->
    <div class="form-group">
      <label class="label">Kimdan:</label>
      <select v-model="form.from" class="input">
        <option value="bemor-kassa">Bemor</option>
        <option value="tashqi">Tashqi</option>
      </select>
    </div>

    <!-- Tashqi joy -->
    <div v-if="form.from === 'tashqi'" class="form-group">
      <label class="label">Qayerga (tashqi joylar):</label>

      <div class="input-add-row">
        <input
          v-model="newTashqi"
          type="text"
          placeholder="Yangi joy nomi"
          class="input"
          @keyup.enter="addTashqi"
        />
        <button type="button" class="btn-add" @click="addTashqi">+</button>
      </div>

      <ul class="tashqi-list" v-if="filteredTashqiOptions.length > 0">
        <li v-for="(item, idx) in filteredTashqiOptions" :key="idx">
          {{ item }}
          <button type="button" class="btn-remove" @click="removeTashqi(idx)">-</button>
        </li>
      </ul>
      <p v-else class="no-results">Joylar topilmadi</p>

      <select v-model="form.fromDetail" class="input">
        <option value="">-- Tanlang --</option>
        <option v-for="(item, idx) in tashqiOptions" :key="'select-'+idx" :value="item">{{ item }}</option>
      </select>
    </div>

    <!-- Bemor tanlash -->
    <div class="form-group" v-if="form.from === 'bemor-kassa'">
      <label class="label">Bemor:</label>
      <select v-model="selectedDavolanishId" @change="onClientChange" class="input">
        <option value="" disabled>-- Bemorni tanlang --</option>
        <option
          v-for="item in davolanishlar"
          :key="item.id"
          :value="item.id"
        >
          {{ item.client.familiya }} {{ item.client.ism }} {{ item.client.sharif }}
          ({{ item.kelish_sanasi }} - {{ item.ketish_sanasi }})
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
        <label class="label">Naqd:</label>
        <input v-model.number="form.cash" type="number" class="input" min="0" />

        <label class="label">Karta:</label>
        <input v-model.number="form.card" type="number" class="input" min="0" />
      </div>
      <div class="form-row">
        <label class="label">Click:</label>
        <input v-model.number="form.click" type="number" class="input" min="0" />

        <label class="label">Humo:</label>
        <input v-model.number="form.humo" type="number" class="input" min="0" />
      </div>

      <!-- Umumiy summa -->
      <p class="total">Umumiy summa: <strong>{{ totalAmount.toLocaleString() }}</strong> so‘m</p>

      <textarea v-model="form.note" class="textarea" readonly></textarea>

      <button
        type="submit"
        class="btn"
        :disabled="(form.from === 'bemor-kassa' && !selectedDavolanishId) ||
                   (form.from === 'tashqi' && !form.fromDetail) ||
                   totalAmount === 0"
      >
        Saqlash
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";

const router = useRouter();

const davolanishlar = ref([]);
const selectedDavolanishId = ref("");
const client = ref(null);

const form = ref({
  cash: 0,
  card: 0,
  click: 0,
  humo: 0,
  note: "",
  type: "kirim",
  from: "bemor-kassa",
  fromDetail: "",
  is_patient_payment: 1,
  user_id: null,
  cashier: "",
});

// Umumiy summa hisoblash
const totalAmount = computed(() => {
  const { cash, card, click, humo } = form.value;
  return (cash || 0) + (card || 0) + (click || 0) + (humo || 0);
});

const tashqiOptions = ref([]);
const newTashqi = ref("");

// LocalStorage dan tashqi joylarni yuklash
const loadTashqiOptions = () => {
  const data = localStorage.getItem("tashqiOptions");
  tashqiOptions.value = data ? JSON.parse(data) : [];
};
const saveTashqiOptions = () => {
  localStorage.setItem("tashqiOptions", JSON.stringify(tashqiOptions.value));
};
const addTashqi = () => {
  const val = newTashqi.value.trim();
  if (val && !tashqiOptions.value.includes(val)) {
    tashqiOptions.value.push(val);
    saveTashqiOptions();
    newTashqi.value = "";
  }
};
const removeTashqi = (index) => {
  tashqiOptions.value.splice(index, 1);
  saveTashqiOptions();
};
const filteredTashqiOptions = computed(() => {
  const search = newTashqi.value.trim().toLowerCase();
  if (!search) return [];
  return tashqiOptions.value.filter(item => item.toLowerCase().includes(search));
});

// API orqali davolanishlar ro‘yxatini olish
const fetchClients = async () => {
  try {
    const res = await api.get("/api/v1/davolanish");
    davolanishlar.value = res.data?.data || [];
    console.log( davolanishlar.value )
  } catch (e) {
    console.error("Bemorlar ro‘yxatini olishda xatolik:", e);
  }
};

// Bemor tanlanganda ma’lumotlarni olish va note yangilash
const onClientChange = () => {
  const tanlangan = davolanishlar.value.find(d => d.id === selectedDavolanishId.value);
  if (!tanlangan) {
    client.value = null;
    return;
  }
  client.value = tanlangan.client;
  form.value.user_id = tanlangan.client?.create_user_id || null;
  form.value.note = `Bemor to'lovi: ${tanlangan.client.familiya} ${tanlangan.client.ism} ${tanlangan.client.sharif} - ${totalAmount.value.toLocaleString()} so‘m`;
};

// note maydonini umumiy summa va tanlovga qarab avtomatik yangilash
watch(
  () => [form.value.type, form.value.from, form.value.fromDetail, selectedDavolanishId.value, totalAmount.value],
  () => {
    if (form.value.from === "bemor-kassa" && client.value) {
      form.value.note = `Bemor to'lovi: ${client.value.familiya} ${client.value.ism} ${client.value.sharif} - ${totalAmount.value.toLocaleString()} so‘m`;
    } else if (form.value.from === "tashqi" && form.value.fromDetail) {
      form.value.note = `Tashqi to'lov: ${form.value.fromDetail} - ${totalAmount.value.toLocaleString()} so‘m`;
    } else {
      form.value.note = "";
    }
  }
);

// To‘lovni yuborish
const submitPayment = async () => {
  try {
    const tanlangan = davolanishlar.value.find(d => d.id === selectedDavolanishId.value);
    form.value.is_patient_payment = form.value.from === "bemor-kassa" ? 1 : 0;

    // To'lov summalarini chiqim bo'lsa minusga aylantirish
    const sign = form.value.type === "chiqim" ? -1 : 1;

    const payload = {
      ...form.value,
      cash: (form.value.cash || 0) * sign,
      card: (form.value.card || 0) * sign,
      click: (form.value.click || 0) * sign,
      humo: (form.value.humo || 0) * sign,

      client_id: form.value.from === "bemor-kassa" ? tanlangan?.client?.id : null,
      davolanish_id: form.value.from === "bemor-kassa" ? tanlangan?.id : null,
      from: form.value.from === "tashqi" ? form.value.fromDetail : form.value.from,
      datetime: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    await api.post("/api/v1/payments", payload);
    alert("To‘lov muvaffaqiyatli qo‘shildi");

    router.back();  // yoki router.go(-1);
  } catch (e) {
    alert("Xatolik: to‘lov yuborilmadi");
    console.error(e);
  }
};



onMounted(() => {
  fetchClients();
  loadTashqiOptions();
});
</script>

<style scoped>
.containerr {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.form-group {
  margin-bottom: 15px;
}
.label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}
.input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.input-add-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.btn-add,
.btn-remove {
  cursor: pointer;
  padding: 5px 10px;
  font-weight: bold;
}
.tashqi-list {
  margin: 0;
  padding-left: 20px;
}
.no-results {
  font-style: italic;
  color: #999;
}
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  align-items: center;
}
.textarea {
  width: 100%;
  height: 70px;
  margin-bottom: 15px;
  resize: none;
  padding: 8px;
  box-sizing: border-box;
}
.btn {
  padding: 10px 20px;
  background-color: #007bff;
  border: none;
  color: white;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
}
.btn:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.total {
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 1.1em;
}
</style>
