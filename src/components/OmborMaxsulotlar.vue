<template>
  <div class="products-page">
    <!-- Sarlavha -->
    <div class="page-header">
      <h2>📦 Ombordagi Mahsulotlar</h2>
      <button class="add-toggle-btn" @click="showForm = !showForm">
        {{ showForm ? '➖ Yopish' : '➕ Mahsulot qo‘shish' }}
      </button>
    </div>

    <!-- Qo‘shish formasi -->
    <transition name="fade">
      <div v-if="showForm" class="product-form">
        <input v-model="newProduct.name" placeholder="Mahsulot nomi" />
        <input v-model="newProduct.unit" placeholder="O‘lchami (kg, l, dona...)" />
        <button :disabled="!isValid" @click="addProduct">✅ Saqlash</button>
      </div>
    </transition>

    <!-- Yuklanmoqda animatsiyasi -->
    <div v-if="loading" class="loading">⏳ Yuklanmoqda...</div>

    <!-- Mahsulotlar jadvali -->
    <div v-else class="product-table-wrapper">
      <table class="product-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Mahsulot nomi</th>
            <th>O‘lchami</th>
            <th>Qo‘shilgan sana</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in products" :key="item.id">
            <td>{{ idx + 1 }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ fmtDate(item.created_at) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!products.length" class="empty-state">
        ❌ Mahsulotlar yo‘q. Yangi mahsulot qo‘shing!
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api';

const products = ref([]);
const showForm = ref(false);
const loading = ref(true);
const newProduct = ref({ name: '', unit: '' });

const isValid = computed(() =>
  newProduct.value.name.trim() && newProduct.value.unit.trim()
);

function fmtDate(d) {
  return new Date(d).toLocaleDateString('uz-UZ');
}

async function fetchProducts() {
  loading.value = true;
  try {
    const { data } = await api.get('/api/v1/products');
    products.value = data;
  } finally {
    loading.value = false;
  }
}

async function addProduct() {
  await api.post('/api/v1/products', { ...newProduct.value });
  newProduct.value = { name: '', unit: '' };
  showForm.value = false;
  await fetchProducts();
}

onMounted(fetchProducts);
</script>

<style scoped>
:root {
  --primary: #1A6291;
  --primary-dark: #15486a;
  --accent: #10b981;
  --light-bg: #f1f5f9;
  --border: #e2e8f0;
  --text-dark: #1f2937;
  --text-muted: #6b7280;
  --text-white: #ffffff;
}

.products-page {
  max-width: 1100px;
  width:100%;
  margin:20px 0px 0px 270px;
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
  color: var(--text-dark);
  background-color: var(--light-bg);
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-header h2 {
  font-size: 28px;
  color: var(--primary);
}
.add-toggle-btn {
  background-color: var(--primary);
  color: var(--text-white);
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
}
.add-toggle-btn:hover {
  background-color: var(--primary-dark);
}

/* Form */
.product-form {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.product-form input {
  flex: 1;
  min-width: 220px;
  padding: 10px 14px;
  font-size: 15px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background-color: var(--text-white);
  color: var(--text-dark);
  transition: border-color 0.2s ease;
}
.product-form input::placeholder {
  color: var(--text-muted);
}
.product-form input:focus {
  border-color: var(--primary);
  outline: none;
  background-color: #f0f9ff;
}
.product-form button {
  background: var(--accent);
  color: var(--text-white);
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.3s ease;
}
.product-form button:hover:not(:disabled) {
  background: #0e9e6e;
}
.product-form button:disabled {
  background: #a7f3d0;
  cursor: not-allowed;
}

/* Table styles */
.product-table-wrapper {
  overflow-x: auto;
  background: var(--text-white);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
.product-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.product-table th {
  background-color: var(--primary);
  color: var(--text-white);
  padding: 14px;
  text-align: left;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 600;
}
.product-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 15px;
  color: var(--text-dark);
}
.product-table tr:hover {
  background-color: var(--light-bg);
}

/* Empty state */
.empty-state {
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  padding: 20px;
  font-size: 15px;
}

/* Loading */
.loading {
  text-align: center;
  font-size: 18px;
  color: var(--primary);
  padding: 40px 0;
  animation: pulse 1.2s infinite;
}
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Animation */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

</style>
