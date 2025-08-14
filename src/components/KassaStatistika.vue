<template>
  <section class="statistika-qismi">
    <h3>Kassa Statistikasi ({{ formattedRange }})</h3>

    <!-- Sana filtrlari -->
    <div class="date-filters">
      <label>
        Boshlanish sanasi:
        <input type="date" v-model="fromDate" :max="today" />
      </label>
      <label>
        Tugash sanasi:
        <input type="date" v-model="toDate" :max="today" />
      </label>
      <button @click="fetchData" :disabled="!fromDate || !toDate">Filterla</button>
    </div>

    <!-- Statistika jadvallar -->
    <div v-if="loaded" class="stats-wrapper">
      <table class="statistik-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Parametr / Ism Familiya</th>
            <th>Summa (so'm)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td><strong>Jami Kirim</strong></td><td>{{ formatCurrency(totalIncome) }}</td></tr>
          <tr><td>2</td><td><strong>Jami Chiqim</strong></td><td>{{ formatCurrency(totalExpense) }}</td></tr>
        
          <tr><td>3</td><td><strong>Bemor Kirimi</strong></td><td>{{ formatCurrency(patientIncome) }}</td></tr>
          <tr><td>4</td><td><strong>Bemor Chiqimi</strong></td><td>{{ formatCurrency(patientExpense) }}</td></tr>

          <!-- To‘lov qilganlar -->
        
          <tr v-if="payers.length === 0">
            <td colspan="3" style="text-align:center; font-style: italic; color: #666;">
              Hech kim to‘lov qilmagan.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="loading">Ma'lumotlar yuklanmoqda...</div>
  </section>
</template>
<script>
import api from '@/api'

export default {
  name: 'KassaStatistika',
  data() {
    const today = new Date().toISOString().slice(0, 10)
    return {
      today,
      fromDate: today,
      toDate: today,
      totalIncome: 0,
      totalExpense: 0,
      patientIncome: 0,
      patientExpense: 0,
      balance: 0,
      payers: [],
      loaded: false
    }
  },

  computed: {
    formattedRange() {
      return this.fromDate === this.toDate
        ? this.fromDate
        : `${this.fromDate} - ${this.toDate}`
    }
  },

  methods: {
    async fetchData() {
      if (!this.fromDate || !this.toDate) return

      if (this.fromDate > this.toDate) {
        alert("Boshlanish sanasi tugash sanasidan oldin bo‘lishi kerak!")
        return
      }

      this.loaded = false

      try {
        const start = new Date(`${this.fromDate}T00:00:00`)
        const end = new Date(`${this.toDate}T23:59:59`)

        const response = await api.get('/api/v1/payments')
        const allPayments = response.data?.data || []

        // `datetime` bo‘yicha filterlash
        const payments = allPayments.filter(p => {
          if (!p.datetime) return false
          const d = new Date(p.datetime)
          return d >= start && d <= end
        })

        // Hisoblash
        let kirim = 0
        let chiqim = 0
        let bemorKirim = 0
        let bemorChiqim = 0
        const payersMap = {}

        for (const p of payments) {
          const sum = Number(p.cash || 0) + Number(p.card || 0) + Number(p.click || 0) + Number(p.humo || 0)

          if (p.type === 'kirim') kirim += sum
          else if (p.type === 'chiqim') chiqim += sum

          if (p.is_patient_payment) {
            if (p.type === 'kirim') {
              bemorKirim += sum

              if (!payersMap[p.patient_id]) {
                payersMap[p.patient_id] = {
                  id: p.patient_id,
                  fullname: p.patient_fullname || "Noma'lum",
                  amount: 0
                }
              }

              payersMap[p.patient_id].amount += sum
            } else if (p.type === 'chiqim') {
              bemorChiqim += sum
            }
          }
        }

        // Statistika
        this.totalIncome = kirim
        this.totalExpense = chiqim
        this.patientIncome = bemorKirim
        this.patientExpense = bemorChiqim
        this.balance = kirim - chiqim
        this.payers = Object.values(payersMap)

      } catch (error) {
        console.error("Ma'lumotlarni olishda xatolik:", error)
      } finally {
        this.loaded = true
      }
    },

    formatCurrency(value) {
      return Number(value || 0).toLocaleString('ru-RU')
    }
  },

  mounted() {
    this.fetchData()
  }
}
</script>




<style scoped>
.statistika-qismi {
  padding: 20px;
  margin:20px auto;
  max-width: 1200px;

}
.date-filters {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}
.date-filters input[type="date"] {
  padding: 0.3rem;
}
button {
  padding: 0.4rem 1rem;
  background: #2196f3;
  color: #fff;
  border: none;
  border-radius: 4px;
}
.stats-wrapper {
  overflow-x: auto;
}
.statistik-table {
  width: 100%;
  border-collapse: collapse;
}
.statistik-table th,
.statistik-table td {
  border: 1px solid #ddd;
  padding: 0.6rem;
  text-align: left;
}
.statistik-table th {
  background-color: #f2f2f2;
}
</style>
