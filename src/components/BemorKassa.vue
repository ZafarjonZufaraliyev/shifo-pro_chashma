<template>
  <div class="container">
    <h2>Bemorlar To‘lovlari</h2>

    <!-- Filtrlar -->
    <div class="filters">
      <label>Boshlanish sanasi:</label>
      <input type="date" v-model="fromDate" @change="fetchPatientPayments(1)" />

      <label>Tugash sanasi:</label>
      <input type="date" v-model="toDate" @change="fetchPatientPayments(1)" />

      <button class="search-btn" @click="fetchPatientPayments(1)">🔍 Qidirish</button>
    </div>

    <!-- To‘lovlar jadvali -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>F.I.Sh</th>
          <th>Telefon</th>
          <th>Qayerdan</th>
          <th>So‘nggi to‘lov vaqti</th>
          <th>Naqd</th>
          <th>Click</th>
          <th>Karta</th>
          <th>Balans</th>
          <th>Status</th>
          <th>Kassir</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(payment, index) in payments"
          :key="payment.id || index"
          @click="goToPayment(payment)"
          class="clickable-row"
        >
          <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
          <td>{{ payment.client || '0' }}</td>
          <td>{{ payment.phone || '0' }}</td>
          <td>{{ payment.address || '0' }}</td>
          <td>{{ formatDate(getPaymentDatetime(payment)) }}</td>
          <td class="amount">{{ formatAmount(getPaymentTotal(payment, 'cash')) }}</td>
          <td class="amount">{{ formatAmount(getPaymentTotal(payment, 'click')) }}</td>
          <td class="amount">{{ formatAmount(getPaymentTotal(payment, 'card')) }}</td>
          <td class="amount">{{ formatAmount(payment.balance) }}</td>
          <td
            class="amount qarz-link"
            @click.stop="goToPaymentPage(payment)"
            :class="{ 'qarzdor': payment.status === 'qarzdor', 'haqdor': payment.status === 'haqdor' }"
          >
            {{ payment.status === 'qarzdor' ? 'Qarzdor' : payment.status === 'haqdor' ? 'Haqdor' : '-' }}
          </td>
          <td>{{ getPaymentUsername(payment) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Ma'lumot yo‘q -->
    <p v-if="payments.length === 0" class="no-data">Ma’lumotlar yo‘q</p>

    <!-- Pagination -->
    <div v-if="lastPage > 1" class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
        &lt; Oldingi
      </button>

      <button
        v-for="page in pagesToShow"
        :key="page"
        :class="{ active: currentPage === page }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>

      <button
        v-if="pagesToShow[pagesToShow.length - 1] < lastPage"
        @click="changePage(lastPage)"
      >
        ... {{ lastPage }}
      </button>

      <button :disabled="currentPage === lastPage" @click="changePage(currentPage + 1)">
        Keyingi &gt;
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const payments = ref([])
const currentPage = ref(1)
const perPage = ref(20)
const totalItems = ref(0)
const lastPage = ref(1)

const fromDate = ref('')
const toDate = ref('')

const router = useRouter()

const fetchPatientPayments = async (page = 1) => {
  try {
    const params = {
      page,
      per_page: perPage.value,
    }
    if (fromDate.value) params.from_date = fromDate.value
    if (toDate.value) params.to_date = toDate.value

    const res = await api.get('public/api/v1/patient_payments', { params })
    const data = res.data

    // Agar sana oralig'i berilgan bo'lsa, statusga qaramay barcha yozuvlar chiqadi
    if (fromDate.value || toDate.value) {
      payments.value = data.data || []
    } else {
      // Aks holda neytral statusdagilar chiqmasin
      payments.value = (data.data || []).filter(p => p.status !== 'neytral')
    }

    currentPage.value = data.current_page || 1
    perPage.value = data.per_page || 20
    totalItems.value = data.total || 0
    lastPage.value = data.last_page || 1
  } catch (error) {
    console.error('Xatolik patient_payments:', error)
  }
}

const getPaymentTotal = (payment, type) => {
  if (!payment.payments || !Array.isArray(payment.payments)) return 0
  return payment.payments.reduce((sum, p) => sum + Number(p[type] || 0), 0)
}

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '-'
  const absAmount = Math.abs(amount)
  return (amount < 0 ? '-' : '') + new Intl.NumberFormat('uz-UZ').format(absAmount)
}

const formatDate = (datetime) => {
  return datetime?.split(' ')[0] || '-'
}

const getPaymentDatetime = (payment) => {
  return payment.payments?.[0]?.datetime || ''
}

const getPaymentUsername = (payment) => {
  return payment.payments?.[0]?.username || '-'
}

const getClientId = (payment) => {
  return payment.client_id || null
}

const goToPaymentPage = (payment) => {
  const clientId = getClientId(payment)
  if (clientId) {
    router.push({ name: 'adminkassaTolovQoshish', query: { clientId } })
  } else {
    alert('Bemor ID topilmadi!')
  }
}

const goToPayment = (payment) => {
  goToPaymentPage(payment)
}

const changePage = (page) => {
  if (page >= 1 && page <= lastPage.value) {
    fetchPatientPayments(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const pagesToShow = computed(() => {
  const total = lastPage.value
  const current = currentPage.value
  const delta = 2
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)

  if (current <= delta) end = Math.min(total, 1 + 4)
  if (current + delta > total) start = Math.max(1, total - 4)

  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

onMounted(() => {
  fetchPatientPayments()
})
</script>




<style scoped>
.container {
  width:100%;
  padding:20px;
  max-width: 1200px;
  margin:20px auto;
  padding: 10px;
}

.filters {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
}

.filters label {
  font-weight: 600;
}

.filters select,
.filters input {
  padding: 5px 10px;
  font-size: 14px;
}

.search-btn {
  cursor: pointer;
  padding: 5px 15px;
  font-size: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

table th,
table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

table th {
  background-color: #f7f7f7;
  font-weight: bold;
}

.clickable-row {
  cursor: pointer;
}

.amount {
  text-align: right;
}

.qarz-link {
  cursor: pointer;
  user-select: none;
}

.qarzdor {
  color: red;
  font-weight: bold;
}

.haqdor {
  color: green;
  font-weight: bold;
}

.no-data {
  margin-top: 20px;
  font-style: italic;
  text-align: center;
  color: #777;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 5px;
}

.pagination button {
  padding: 5px 10px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.pagination button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
