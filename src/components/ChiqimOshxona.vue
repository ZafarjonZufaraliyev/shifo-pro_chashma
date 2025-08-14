<template>
  <div class="calculate-page">
    <h2>📊 Ovqat va porsiya bo‘yicha mahsulot hisoblash</h2>

    <!-- Sana oralig'i -->
    <div class="form-row single">
      <label>📅 Boshlanish:</label>
      <input type="date" v-model="dateFrom" />

      <label>📅 Tugash:</label>
      <input type="date" v-model="dateTo" />

      <button @click="applyDateFilter" :disabled="!canApplyFilter">Filtrlash</button>
      <button @click="resetFilter">♻️ Tozalash</button>
    </div>

    <!-- Taom/Vaqt/Porsiya -->
    <div class="form-row triple">
      <div class="field">
        <label>🍛 Taom:</label>
        <select v-model="selectedMealId">
          <option disabled value="">-- Tanlang --</option>
          <option v-for="m in meals" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </div>

      <div class="field">
        <label>🕰 Vaqt:</label>
        <select v-model="selectedVaqt">
          <option disabled value="">-- Tanlang --</option>
          <option value="abet">Nonushta</option>
          <option value="tushlik">Tushlik</option>
          <option value="kechki">Kechki ovqat</option>
        </select>
      </div>

      <div class="field">
        <label>👥 Porsiya:</label>
        <input type="number" v-model.number="porsiyaSoni" min="1" />
      </div>
    </div>

    <button class="btn-main" :disabled="!canCalculate" @click="calculate">
      Hisoblash va API ga saqlash
    </button>

    <!-- Natijalar -->
    <div v-if="filteredOutgoings.length" class="results">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Taom</th>
            <th>Mahsulot</th>
            <th>Miqdor</th>
            <th>Birlik</th>
            <th>Sana</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(o, i) in filteredOutgoings" :key="o.id">
            <td>{{ i + 1 }}</td>
            <td>{{ mealName(o.meal_schedule_id) }}</td>
            <td>{{ productName(o.product_id) }}</td>
            <td>{{ o.amount }}</td>
            <td>{{ o.unit }}</td>
            <td>{{ o.created_at?.slice(0, 10) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="no-data">🔍 Tanlangan oraliqda maʼlumot yo‘q.</p>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'ChiqimOshxona',
  data() {
    return {
      dateFrom: '',
      dateTo: '',
      meals: [],
      products: [],
      mealRecipes: [],
      mealSchedules: [],
      outgoings: [],
      selectedMealId: '',
      selectedVaqt: '',
      porsiyaSoni: 1,
      originalOutgoings: []  // barcha chiqimlarni saqlash uchun
    };
  },
  computed: {
    canCalculate() {
      return this.selectedMealId && this.selectedVaqt && this.porsiyaSoni > 0;
    },
    canApplyFilter() {
      return this.dateFrom && this.dateTo;
    },
    filteredOutgoings() {
      if (!this.canApplyFilter) return this.outgoings;
      return this.outgoings.filter(o => {
        const date = o.created_at?.slice(0, 10);
        return date >= this.dateFrom && date <= this.dateTo;
      });
    }
  },
  methods: {
    async fetchInitialData() {
      try {
        const [mealsRes, productsRes, recipesRes, schedulesRes, outgoingsRes] = await Promise.all([
          api.get('/api/v1/meal'),
          api.get('/api/v1/products'),
          api.get('/api/v1/meal-recipe'),
          api.get('/api/v1/meal-schedules'),
          api.get('/api/v1/oshxona-chiqim')
        ]);
        this.meals = mealsRes.data || [];
        this.products = productsRes.data || [];
        this.mealRecipes = recipesRes.data || [];
        this.mealSchedules = schedulesRes.data || [];
        this.outgoings = outgoingsRes.data || [];
        this.originalOutgoings = [...this.outgoings];
        
      } catch (err) {
        console.error('❌ Maʼlumotlarni olishda xatolik:', err);
        alert('📡 API dan maʼlumotlarni olishda xatolik yuz berdi.');
      }
    },

    applyDateFilter() {
      // filteredOutgoings computed yordamida avtomatik filtrlanadi
    },

    resetFilter() {
      this.dateFrom = '';
      this.dateTo = '';
      this.outgoings = [...this.originalOutgoings];
    },

    async calculate() {
      const today = new Date().toISOString().slice(0, 10);

      // Vaqtni enum ga moslashtirish
      const vaqtMap = {
        abet: 'nonushta',
        tushlik: 'tushlik',
        kechki: 'kechki ovqat'
      };
      const apiMealType = vaqtMap[this.selectedVaqt];

      const meal = this.meals.find(m => Number(m.id) === Number(this.selectedMealId));
      if (!meal) {
        alert('❌ Tanlangan taom topilmadi!');
        return;
      }

      // Avvalgi jadvalni tekshirish
      let schedule = this.mealSchedules.find(
        s => Number(s.meal_id) === Number(this.selectedMealId) &&
             s.meal_type === apiMealType &&
             s.date === today
      );

      // Agar jadval bo'lmasa, yaratish
      if (!schedule) {
        try {
          const payload = {
            meal_id: Number(this.selectedMealId),
            date: today,
            meal_type: apiMealType,
            portion_count: Number(this.porsiyaSoni)
          };
          console.log('📤 Yaratilayotgan jadval payload:', payload);

          const { data: createdSchedule } = await api.post('/api/v1/meal-schedules', payload);
          this.mealSchedules.push(createdSchedule);
          schedule = createdSchedule;

        } catch (err) {
          console.error('❌ Jadval yaratishda xatolik:', err);
          alert('⛔ Jadval yaratishda xatolik:\n' + JSON.stringify(err.response?.data || err, null, 2));
          return;
        }
      }

      // Retseptlar
      const relatedRecipes = this.mealRecipes.filter(r => Number(r.meal_id) === Number(this.selectedMealId));
      if (!relatedRecipes.length) {
        alert('❌ Ushbu taom uchun retsept topilmadi!');
        return;
      }

      // Chiqimlarni saqlash
      try {
        for (const recipe of relatedRecipes) {
          const product = this.products.find(p => Number(p.id) === Number(recipe.product_id));
          const chiqim = {
            meal_schedule_id: Number(schedule.id),
            product_id: Number(recipe.product_id),
            amount: +(Number(recipe.amount) * Number(this.porsiyaSoni)).toFixed(2),
            unit: product?.unit || recipe.unit || 'dona'
          };
          const res = await api.post('/api/v1/oshxona-chiqim', chiqim);
          this.outgoings.push(res.data);
          this.originalOutgoings.push(res.data);
        }

        alert('✅ Chiqimlar muvaffaqiyatli saqlandi!');
        this.resetForm();

      } catch (err) {
        console.error('❌ Chiqimlarni saqlashda xatolik:', err);
        if (err.response && err.response.data) {
          console.error('Server validation errors:', err.response.data);
          alert('⛔ Saqlashda muammo:\n' + JSON.stringify(err.response.data, null, 2));
        } else {
          alert('⛔ Saqlashda nomaʼlum muammo yuz berdi.');
        }
      }
    },

    resetForm() {
      this.selectedMealId = '';
      this.selectedVaqt = '';
      this.porsiyaSoni = 1;
    },

    mealName(meal_schedule_id) {
      const schedule = this.mealSchedules.find(ms => Number(ms.id) === Number(meal_schedule_id));
      if (!schedule) return '—';
      const meal = this.meals.find(m => Number(m.id) === Number(schedule.meal_id));
      return meal?.name || '—';
    },

    productName(product_id) {
      return this.products.find(p => Number(p.id) === Number(product_id))?.name || '—';
    }
  },

  mounted() {
    this.fetchInitialData();
  }
};
</script>



<style scoped>
.calculate-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  font-family: 'Segoe UI', sans-serif;
}
.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.form-row.single {
  justify-content: center;
  align-items: center;
}
.form-row.triple .field {
  flex: 1;
  display: flex;
  flex-direction: column;
}
input,
select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.btn-main {
  background: #3498db;
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}
.btn-main:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.results {
  margin-top: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 8px;
  border: 1px solid #ddd;
}
th {
  background: #f0f0f0;
}
.no-data {
  text-align: center;
  font-style: italic;
  margin-top: 20px;
  color: #777;
}
</style>
