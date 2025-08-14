<template>
  <div class="container">
    <h2>Bemorlar To‘lovlari (Faqat Laboratoriya to‘lovlari)</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>F.I.Sh</th>
          <th>Telefon</th>
          <th>Qayerdan</th>
          <th>To‘lov vaqti</th>
          <th>Naqd</th>
          <th>Click</th>
          <th>Karta</th>
          <th>Balance</th>
          <th>Status</th>
          <th>Kassir</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(payment, index) in filteredPayments"
          :key="index"
          @click="goToPayment(payment)"
          class="clickable-row"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ getClientName(payment) }}</td>
          <td>{{ payment.phone || '-' }}</td>
          <td>{{ payment.address || '-' }}</td>
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
            {{ payment.status === 'qarzdor' ? 'Qarzdor' : (payment.status === 'haqdor' ? 'Haqdor' : '-') }}
          </td>
          <td>{{ getPaymentUsername(payment) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="filteredPayments.length === 0" class="no-data">Ma’lumotlar yo‘q</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const payments = ref([])
const router = useRouter()

// API'dan to'lovlar ro'yxatini olish
const fetchPatientPayments = async () => {
  try {
    const res = await api.get('public/api/v1/patient_payments')
    payments.value = res.data.data || []
  } catch (error) {
    console.error("Xatolik patient_payments:", error)
  }
}

// Faqat "Laboratoriya" manbadan bo‘lgan to‘lovlarni filtrlaymiz
const filteredPayments = computed(() => {
  return payments.value.filter(payment =>
    payment.from === "Laboratoriya" || payment.fromDetail === "Laboratoriya"
  )
})

// To‘lov summasini hisoblash (cash, click, card)
const getPaymentTotal = (payment, type) => {
  if (!payment.payments || !Array.isArray(payment.payments)) return 0
  return payment.payments.reduce((sum, p) => sum + Number(p[type] || 0), 0)
}

// Summani o‘zgartirish: formatlash uchun
const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '-'
  const absAmount = Math.abs(amount)
  const formatted = new Intl.NumberFormat('uz-UZ').format(absAmount)
  return amount < 0 ? `-${formatted}` : formatted
}

// Sana formatlash (faqat yil-oy-kun)
const formatDate = (datetime) => {
  return datetime?.split(' ')[0] || '-'
}

// To‘lov vaqtini olish (eng birinchi to‘lov sanasi)
const getPaymentDatetime = (payment) => {
  return payment.payments?.[0]?.datetime || ''
}

// Kassir nomi olish
const getPaymentUsername = (payment) => {
  return payment.payments?.[0]?.username || '-'
}

// Bemor ismini olish
const getClientName = (payment) => {
  if (typeof payment.client === 'object' && payment.client) {
    return `${payment.client.first_name || ''} ${payment.client.last_name || ''}`.trim()
  }
  return typeof payment.client === 'string' ? payment.client : 'Nomaʼlum'
}

// Bemor ID olish
const getClientId = (payment) => {
  if (payment.client_id) return payment.client_id
  if (typeof payment.client === 'object' && payment.client?.id) return payment.client.id
  return null
}

// To‘lov sahifasiga yo‘naltirish
const goToPaymentPage = (payment) => {
  const clientId = getClientId(payment)
  if (clientId) {
    router.push({ name: 'adminkassaTolovQoshish', query: { clientId } })
  } else {
    alert("Bemor ID topilmadi!")
  }
}

// To‘lov ustiga bosilganda sahifaga yo‘naltirish
const goToPayment = (payment) => {
  const clientId = getClientId(payment)
  if (clientId) {
    router.push({ name: 'adminkassaTolovQoshish', query: { clientId } })
  } else {
    alert("Bemor ma'lumotlari topilmadi!")
  }
}

// Sahifa yuklanganda to‘lovlar ma’lumotlarini olish
onMounted(() => {
  fetchPatientPayments()
})
</script>

<style scoped>
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 20px auto;
  background-color: #fff;
}

h2 {
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

thead {
  background-color: #f5f5f5;
}

th,
td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

.amount {
  font-weight: bold;
  color: green;
}

tr:hover {
  background-color: #f9f9f9;
}

.clickable-row {
  cursor: pointer;
}

.no-data {
  text-align: center;
  color: gray;
  font-style: italic;
}

.qarz-link {
  cursor: pointer;
  text-decoration: underline;
}

.qarzdor {
  color: red;
  font-weight: 700;
}

.haqdor {
  color: green;
  font-weight: 700;
}
</style>
