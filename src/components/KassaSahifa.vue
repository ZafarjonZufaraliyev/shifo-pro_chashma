<template>
  <div class="kassa-container">
    <!-- Statistika -->
    <StatistikaQismi
      :totalIncome="totalIncome"
      :totalExpense="totalExpense"
      :balance="balance"
      :patientIncome="patientIncome"
      :patientExpense="patientExpense"
    />

    <!-- Filtr paneli -->
    <FilterPanel
      v-model:from="filter.from"
      v-model:to="filter.to"
      v-model:search="filter.search"
      @filter="filterPayments"
    />

    <!-- To‘lovlar jadvali -->
    <TolovlarJadvali
      :payments="filteredPayments"
      @open-payment-modal="openPaymentModal"
      @open-refund-modal="openRefundModal"
    />

    <!-- To‘lov qo‘shish modali -->
    <TolovQoshishModali
      ref="paymentModal"
      :client="selectedPayment?.client || null"
      @success="refreshAll"
    />

    <!-- Pul qaytarish modali -->
    <PulQaytarishModali
      ref="refundModal"
      :payment="selectedPayment"
      @success="refreshAll"
    />
  </div>
</template>

<script>
import StatistikaQismi from './KassaStatistika.vue'
import FilterPanel from './BemorKassa.vue'
import TolovlarJadvali from './KassaTolovlarJadvali.vue'
import TolovQoshishModali from './KassaTolovQoshish.vue'
import PulQaytarishModali from './KassaPulQaytarish.vue'
import api from '@/api'

export default {
  components: {
    StatistikaQismi,
    FilterPanel,
    TolovlarJadvali,
    TolovQoshishModali,
    PulQaytarishModali
  },
  data() {
    return {
      payments: [],
      filteredPayments: [],
      filter: {
        from: '',
        to: '',
        search: ''
      },
      selectedPayment: null,

      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      patientIncome: 0,
      patientExpense: 0
    }
  },
  created() {
    this.fetchAllPayments()
  },
  methods: {
    async fetchAllPayments() {
      try {
        const res = await api.get('/api/v1/patient_payments')
        let rawPayments = res.data.data || []
        console.log(rawPayments)
        // Ma'lumotlarni kerakli formatga keltirish
        this.payments = rawPayments.map(p => ({
          datetime: p.datetime || p.created_at || '',
          type: p.type || 'kirim',
          cash: Number(p.cash) || 0,
          card: Number(p.card) || 0,
          click: Number(p.click) || 0,
          humo: Number(p.humo) || 0,
          cashier: p.cashier || p.client || '-',
          note: p.note || '',
          is_patient_payment: p.is_patient_payment || false,
          client_id: p.client_id || null,
          client: p.client || null // agar client nomi kerak bo‘lsa
        }))

        this.filterPayments() // To‘lovlarni dastlabgi filtr bilan o‘rnatamiz
        this.updateStatistics()
      } catch (error) {
        console.error('To‘lovlarni olishda xatolik:', error)
      }
    },
    filterPayments() {
  const { from, to, search } = this.filter
  const lowerSearch = search.trim().toLowerCase()

  const fromDateTime = from ? from + 'T00:00:00' : null
  const toDateTime = to ? to + 'T23:59:59' : null

  this.filteredPayments = this.payments.filter(p => {
    if (!p.datetime) return false

    const dateMatch =
      (!fromDateTime || p.datetime >= fromDateTime) &&
      (!toDateTime || p.datetime <= toDateTime)

    const searchMatch =
      (p.cashier && typeof p.cashier === 'string' && p.cashier.toLowerCase().includes(lowerSearch)) ||
      (typeof p.client === 'string' && p.client.toLowerCase().includes(lowerSearch)) ||
      (p.client && typeof p.client === 'object' &&
        ((p.client.first_name && p.client.first_name.toLowerCase().includes(lowerSearch)) ||
         (p.client.last_name && p.client.last_name.toLowerCase().includes(lowerSearch)))) ||
      (p.note && p.note.toLowerCase().includes(lowerSearch))

    return dateMatch && (search === '' || searchMatch)
  })

  this.updateStatistics(this.filteredPayments)
},
    updateStatistics(payments = null) {
      const list = payments || this.filteredPayments

      const sumByType = (type, isPatient = undefined) =>
        list
          .filter(p => p.type === type && (isPatient === undefined || p.is_patient_payment === isPatient))
          .reduce((sum, p) => {
            return (
              sum +
              Number(p.cash) +
              Number(p.card) +
              Number(p.click) +
              Number(p.humo)
            )
          }, 0)

      this.totalIncome = sumByType('kirim')
      this.totalExpense = sumByType('chiqim')
      this.patientIncome = sumByType('kirim', true)
      this.patientExpense = sumByType('chiqim', true)
      this.balance = this.totalIncome - this.totalExpense
    },
    openPaymentModal(payment) {
      this.selectedPayment = payment
      this.$refs.paymentModal.open()
    },
    openRefundModal(payment) {
      this.selectedPayment = payment
      this.$refs.refundModal.open()
    },
    refreshAll() {
      this.fetchAllPayments()
    }
  }
}
</script>

<style scoped>
.kassa-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
  background-color: #f9fafb;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  box-sizing: border-box;
}

/* Section oraliqlari */
.kassa-container section {
  margin-bottom: 30px;
}

/* Jadval */
table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.05);
  border-radius: 6px;
  overflow: hidden;
}

/* Jadval sarlavhalari */
thead {
  background-color: #34495e;
  color: #ecf0f1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Jadval ustun va kataklari */
th,
td {
  padding: 14px 20px;
  border-bottom: 1px solid #e1e4e8;
  text-align: left;
  font-size: 0.95rem;
  vertical-align: middle;
}

/* Jadval qatoriga hover effekti */
tbody tr:hover {
  background-color: #ecf6ff;
  transition: background-color 0.25s ease;
}

/* Inputlar va selectlar */
input[type="text"],
input[type="date"],
select {
  padding: 10px 14px;
  margin-right: 12px;
  border-radius: 6px;
  border: 1.8px solid #d1d5db;
  font-size: 1rem;
  outline-offset: 2px;
  outline-color: #3b82f6; /* blue focus */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

input[type="text"]:focus,
input[type="date"]:focus,
select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 8px rgb(37 99 235 / 0.3);
}

/* Tugmalar asosiy */
button {
  background-color: #22c55e;
  border: none;
  padding: 10px 18px;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 8px;
  box-shadow: 0 3px 8px rgb(34 197 94 / 0.4);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

button:hover {
  background-color: #16a34a;
  box-shadow: 0 5px 15px rgb(22 163 74 / 0.6);
}

/* Qizil (xatolik yoki o'chirish) tugma */
button.red {
  background-color: #ef4444;
  box-shadow: 0 3px 8px rgb(239 68 68 / 0.4);
}

button.red:hover {
  background-color: #b91c1c;
  box-shadow: 0 5px 15px rgb(185 28 28 / 0.6);
}

/* Responsive kichik ekranlar uchun oddiy o'zgarish */
@media (max-width: 768px) {
  .kassa-container {
    padding: 16px 12px;
  }
  
  input[type="text"],
  input[type="date"],
  select {
    margin-bottom: 12px;
    margin-right: 0;
    width: 100%;
  }
  
  button {
    width: 100%;
    margin-bottom: 12px;
  }
  
  th, td {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
}
</style>
