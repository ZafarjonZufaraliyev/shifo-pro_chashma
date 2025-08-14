// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/main.css'

// vue-chart-3 uchun Chart.js modullarini to‘liq ro‘yxatdan o‘tkazamiz
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarController,
  LineController,
  PieController
} from 'chart.js'

// Motion plugin (animatsiya uchun)
import { MotionPlugin } from '@vueuse/motion'

// BARCHA chart komponentlarini ro'yxatdan o'tkazamiz
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarController,
  LineController,
  PieController
)

// Vue ilovasini yaratish
const app = createApp(App)

// Router va Motion pluginni ulash
app.use(router)
app.use(MotionPlugin)

// Ilovani DOM ga biriktirish
app.mount('#app')
