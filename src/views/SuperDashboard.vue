<template>
  <div class="dashboard">
    <h1 class="fade-in">Dashboardga xush kelibsiz, {{ username }}!</h1>
    <p class="fade-in-delay">Sizning boshqaruv panelingizga nazar soling.</p>

    <!-- Statistik kartalar -->
    <div class="stats-cards">
      <div
        v-motion
        :initial="{ opacity: 0, y: -30 }"
        :enter="{ opacity: 1, y: 0 }"
        class="stat-card card1"
      >
        <h3>Bugungi bemorlar</h3>
        <p>{{ todayPatients }}</p>
      </div>

      <div
        v-motion
        :initial="{ opacity: 0, y: -30 }"
        :enter="{ opacity: 1, y: 0 }"
        class="stat-card card2"
      >
        <h3>Haftalik bemorlar</h3>
        <p>{{ weeklyPatients }}</p>
      </div>

      <div
        v-motion
        :initial="{ opacity: 0, y: -30 }"
        :enter="{ opacity: 1, y: 0 }"
        class="stat-card card3"
      >
        <h3>Oylik foydalanuvchilar</h3>
        <p>{{ monthlyUsers }}</p>
      </div>
    </div>

    <!-- Grafiklar -->
    <div class="charts">
      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :enter="{ opacity: 1, y: 0 }"
        class="chart-card"
      >
        <h3>Xizmatlar (haftalik)</h3>
        <BarChart
          :chartData="weeklyServices"
          :options="{ responsive: true, maintainAspectRatio: false }"
        />
      </div>

      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :enter="{ opacity: 1, y: 0 }"
        class="chart-card"
      >
        <h3>Foydalanuvchilar (oylik)</h3>
        <LineChart
          :chartData="monthlyUsersChart"
          :options="{ responsive: true, maintainAspectRatio: false }"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { BarChart, LineChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'
import api from '@/api.js'  // api instance, baseURL bilan /api/v1 ni qo'shib qo'ygan deb hisoblaymiz

Chart.register(...registerables)

export default {
  name: 'SuperDashboard',
  components: { BarChart, LineChart },
  data() {
    return {
      username: localStorage.getItem('username') || 'Admin',
      todayPatients: 0,
      weeklyPatients: 0,
      monthlyUsers: 0,
      weeklyServices: {
        labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak'],
        datasets: [
          {
            label: 'Xizmatlar',
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: ctx => {
              const chart = ctx.chart
              const { ctx: canvasCtx, chartArea } = chart
              if (!chartArea) return null
              const gradient = canvasCtx.createLinearGradient(0, 0, 0, chartArea.height)
              gradient.addColorStop(0, '#4a90e2')
              gradient.addColorStop(1, '#357ABD')
              return gradient
            },
            borderRadius: 6,
            maxBarThickness: 35,
          },
        ],
      },
      monthlyUsersChart: {
        labels: ['Yan', 'Fev', 'Mart', 'Apr', 'May', 'Iyun'],
        datasets: [
          {
            label: 'Foydalanuvchilar',
            data: [0, 0, 0, 0, 0, 0],
            borderColor: '#2c3e50',
            backgroundColor: 'rgba(44, 62, 80, 0.15)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
    }
  },
  methods: {
    async fetchStats() {
      try {
        // /api/v1/davolanish dan ma'lumot olish
        const res = await api.get('/davolanish')
        const davolanishlar = res.data

        const today = new Date()
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

        // Haftaning boshlanishi - dushanba
        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
        const monday = new Date(today)
        monday.setDate(today.getDate() - (dayOfWeek - 1))

        let todayCount = 0
        let weeklyCount = 0
        let monthlyCount = 0
        let weeklyServicesCount = [0, 0, 0, 0, 0, 0, 0]

        davolanishlar.forEach(item => {
          // status maydoni bo'lmasa, shartni moslashtiring
          if (item.status !== 'faol' && item.status !== 'bajarildi') return

          const start = new Date(item.kelish_sanasi)
          const end = new Date(item.ketish_sanasi)

          if (start <= today && today <= end) {
            todayCount++
          }

          if (end >= monday && start <= today) {
            weeklyCount++

            for (let i = 0; i < 7; i++) {
              const currentDay = new Date(monday)
              currentDay.setDate(monday.getDate() + i)

              if (start <= currentDay && currentDay <= end) {
                weeklyServicesCount[i]++
              }
            }
          }

          if (end >= monthStart && start <= today) {
            monthlyCount++
          }
        })

        let monthlyUsersData = [0, 0, 0, 0, 0, 0]
        davolanishlar.forEach(item => {
          if (item.status !== 'faol' && item.status !== 'bajarildi') return

          const start = new Date(item.kelish_sanasi)
          const month = start.getMonth()
          const year = start.getFullYear()

          if (year === today.getFullYear() && month >= 0 && month <= 5) {
            monthlyUsersData[month]++
          }
        })

        this.todayPatients = todayCount
        this.weeklyPatients = weeklyCount
        this.monthlyUsers = monthlyCount
        this.weeklyServices.datasets[0].data = weeklyServicesCount
        this.monthlyUsersChart.datasets[0].data = monthlyUsersData
      } catch (error) {
        console.error('Statistikani olishda xatolik:', error)
        alert('Statistikani yuklashda muammo yuz berdi!')
      }
    },

    async fetchUserData() {
      try {
        const res = await api.get('/user-data')
        this.username = res.data.username || this.username
      } catch (error) {
        console.error('Foydalanuvchi ma\'lumotlarini olishda xatolik:', error)
      }
    }
  },
  mounted() {
    this.fetchUserData()
    this.fetchStats()
  },
}
</script>




<style scoped>
.dashboard {
  padding: 20px;
  margin: 20px;
  max-width: 1200px;
  font-family: "Segoe UI", sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.stats-cards {
  display: flex;
  gap: 26px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.stat-card {
  background-color: white;
  flex: 1;
  min-width: 260px;
  padding: 30px 24px;
  border-radius: 14px;
  box-shadow: 0 4px 15px rgba(44, 62, 80, 0.12);
  cursor: default;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.stat-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(44, 62, 80, 0.18);
}

.card1 {
  border-left: 6px solid #4a90e2;
}

.card2 {
  border-left: 6px solid #10b981;
}

.card3 {
  border-left: 6px solid #f59e0b;
}

.stat-card h3 {
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 14px;
  color: #374151;
  letter-spacing: 0.04em;
}

.stat-card p {
  font-weight: 800;
  font-size: 2.8rem;
  color: #111827;
  margin: 0;
  line-height: 1;
}

.charts {
  display: flex;
  gap: 36px;
  flex-wrap: wrap;
}

.chart-card {
  background-color: #fff;
  flex: 1 1 460px;
  min-width: 350px;
  border-radius: 16px;
  padding: 32px 36px;
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  color: #1f2937;
  border: 1px solid #e0e7ff;
  transition: box-shadow 0.3s ease;
}

.chart-card:hover {
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #111827;
  letter-spacing: 0.03em;
  user-select: none;
}

.chart-card > .chartjs-render-monitor {
  flex-grow: 1;
  width: 100% !important;
  height: auto !important;
  user-select: none;
}

.fade-in {
  animation: fadeInUp 0.7s ease forwards;
}

.fade-in-delay {
  animation: fadeInUp 1.1s ease forwards;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .charts {
    gap: 20px;
  }
}

@media (max-width: 900px) {
  .stats-cards {
    flex-direction: column;
    gap: 20px;
  }
  .charts {
    flex-direction: column;
    gap: 24px;
  }
  .chart-card {
    min-width: 100%;
    height: 360px;
    padding: 28px 28px;
  }
  .chart-card h3 {
    font-size: 1.4rem;
    margin-bottom: 18px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.8rem;
  }
  p {
    font-size: 1rem;
    margin-bottom: 24px;
  }
  .stat-card p {
    font-size: 2rem;
  }
  .stat-card {
    padding: 20px 16px;
  }
  .chart-card {
    padding: 20px 18px;
    height: 280px;
  }
  .chart-card h3 {
    font-size: 1.2rem;
    margin-bottom: 12px;
  }
}
</style>
