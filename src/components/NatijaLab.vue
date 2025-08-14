<template>
  <div class="container">
    <h2 class="heading">🧪 Laboratoriya natijalari</h2>

    <input
      v-model="searchQuery"
      type="text"
      placeholder="🔍 F.I.Sh, telefon yoki test turi bo‘yicha qidirish..."
      class="search-input"
    />

    <div v-for="test in filteredResults" :key="test.id" class="card">
      <div class="info">
        <strong>Bemor:</strong> {{ test.client.familiya }} {{ test.client.ism }} {{ test.client.sharif }}
      </div>
      <div class="info-small">
        <p><strong>Tug‘ilgan sana:</strong> {{ formatDate(test.client.tugulgan_sana) }}</p>
        <p><strong>Telefon:</strong> {{ test.client.tel1 }}</p>
        <p><strong>Pasport:</strong> {{ test.client.pasport }}</p>
        <p><strong>Test turi:</strong> {{ test.test_type.name }} - {{ test.test_type.description }}</p>
        <p><strong>Doktor izohi:</strong> {{ test.doctor_comment || 'Yo‘q' }}</p>
      </div>

      <table class="results-table">
        <thead>
          <tr>
            <th>Parametr</th>
            <th>Qiymat</th>
            <th>Norma</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(param, index) in test.results" :key="index">
            <td>{{ param.parametr_name }}</td>
            <td>{{ param.parametr_value }}</td>
            <td>{{ param.parametr_norma }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const testResults = ref([])
const searchQuery = ref('')

// Ma'lumotlarni API dan olish
const getTestResults = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token topilmadi, tizimga kirishingiz kerak.')
    const res = await axios.get('/api/v1/lab-test-results', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    testResults.value = res.data
  } catch (error) {
    console.error('❌ Ma\'lumotlarni olishda xatolik:', error)
  }
}

// Tug‘ilgan sanani formatlash
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('uz-UZ')
}

// Foydalanuvchi bo‘yicha qidirish
const filteredResults = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return testResults.value.filter(test =>
    `${test.client.familiya} ${test.client.ism} ${test.client.sharif}`.toLowerCase().includes(query) ||
    test.client.tel1.toLowerCase().includes(query) ||
    test.test_type.name.toLowerCase().includes(query)
  )
})

onMounted(getTestResults)
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
}

.heading {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 20px;
  font-size: 15px;
  border: 1px solid #bbb;
  border-radius: 6px;
}

.card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.info {
  font-size: 16px;
  color: #222;
  margin-bottom: 10px;
}

.info-small p {
  font-size: 14px;
  color: #555;
  margin: 2px 0;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-size: 14px;
}

.results-table th,
.results-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

.results-table th {
  background-color: #eee;
}
</style>
