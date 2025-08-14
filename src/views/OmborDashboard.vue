<template>
  <div class="dashboard">
    <h1 class="fade-in">Dashboardga xush kelibsiz, {{ username }}!</h1>
    <p class="fade-in-delay">Sizning boshqaruv panelingizga nazar soling.</p>

  
  </div>
</template>

<script>




export default {
  name: 'OmborDashboard',
 
  data() {
    return {
      username: localStorage.getItem('username') || 'Oshxona',
      todayPatients: 12,
      weeklyPatients: 80,
      monthlyUsers: 310,
      weeklyServices: {
        labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak'],
        datasets: [
          {
            label: 'Xizmatlar',
            data: [10, 14, 9, 13, 15, 18, 11],
            backgroundColor: ctx => {
              const chart = ctx.chart;
              const { ctx: canvasCtx, chartArea } = chart;
              if (!chartArea) return null;
              const gradient = canvasCtx.createLinearGradient(0, 0, 0, chartArea.height);
              gradient.addColorStop(0, '#4a90e2');
              gradient.addColorStop(1, '#357ABD');
              return gradient;
            },
            borderRadius: 6,
            maxBarThickness: 35,
          }
        ]
      },
      monthlyUsersChart: {
        labels: ['Yan', 'Fev', 'Mart', 'Apr', 'May', 'Iyun'],
        datasets: [
          {
            label: 'Foydalanuvchilar',
            data: [100, 120, 150, 170, 180, 210],
            borderColor: '#2c3e50',
            backgroundColor: 'rgba(44, 62, 80, 0.15)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
/* Umumiy */
/* Umumiy stil va layout */
.dashboard {
  padding: 20px;
  margin: 20px auto;
/* width:100%; */
  max-width: 1200px;
  font-family: "Segoe UI", sans-serif;
  background-color: #f5f7fa;
  
}
@media (max-width: 768px) {
 .calendar-container {
  max-width: 1200px;
  margin: 20px;
  }}


/* Sarlavha va kichik matn */
h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1f2937;
}

p {
  margin-bottom: 40px;
  font-weight: 400;
  font-size: 1.1rem;
  color: #6b7280;
}

/* Statistik kartalar konteyneri */
.stats-cards {
  display: flex;
  gap: 26px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

/* Har bir statistik karta */
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

/* Kartalarning rangli chiziqlari */
.card1 {
  border-left: 6px solid #4a90e2;
}

.card2 {
  border-left: 6px solid #10b981;
}

.card3 {
  border-left: 6px solid #f59e0b;
}

/* Karta sarlavhasi */
.stat-card h3 {
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 14px;
  color: #374151;
  letter-spacing: 0.04em;
}

/* Karta ichidagi katta raqam */
.stat-card p {
  font-weight: 800;
  font-size: 2.8rem;
  color: #111827;
  margin: 0;
  line-height: 1;
}

/* Grafiklar konteyneri */
.charts {
  display: flex;
  gap: 36px;
  flex-wrap: wrap;
}

/* Har bir grafik karta */
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
  /* height: 440px; */
  color: #1f2937;
  border: 1px solid #e0e7ff;
  transition: box-shadow 0.3s ease;
}

.chart-card:hover {
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1);
}

/* Grafik sarlavhasi */
.chart-card h3 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #111827;
  letter-spacing: 0.03em;
  user-select: none;
}

/* Grafik ichidagi <canvas> element uchun to‘g‘ri o‘lcham */
.chart-card > .chartjs-render-monitor {
  flex-grow: 1;
  width: 100% !important;
  height: auto !important;
  user-select: none;
}

/* Fade in animatsiyalar */
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

/* RESPONSIVE */

/* 1200px dan kichik ekranlar uchun */
@media (max-width: 1200px) {
  .charts {
    gap: 20px;
  }
}

/* 900px dan kichik ekranlar uchun */
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

/* 480px dan kichik ekranlar uchun */
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
