<template>
  <div class="oshxona-taomlar-page">
    <h2>🍽️ Oshxonadagi Taomlar</h2>

    <!-- Yuklanmoqda -->
    <div v-if="loading" class="loading">⏳ Yuklanmoqda...</div>

    <!-- Asosiy kontent -->
    <template v-else>
      <!-- Yangi taom qo‘shish formasi -->
      <div class="add-form">
        <h3>➕ Yangi Taom Qoʻshish</h3>
        <div class="form-row">
          <input
            v-model="newMeal.nomi"
            placeholder="Taom nomi *"
            autocomplete="off"
          />

          <!-- Kategoriya select -->
          <select v-model="newMeal.kategoriya">
            <option value="" disabled selected>-- Kategoriyani tanlang (ixtiyoriy) --</option>
            <option
              v-for="cat in categories"
              :key="cat"
              :value="cat"
            >{{ cat }}</option>
          </select>

          <textarea
            v-model="newMeal.description"
            placeholder="Ta'rif (ixtiyoriy)"
            rows="2"
          ></textarea>

          <button @click="submitMeal">Qoʻshish</button>
        </div>
      </div>

      <!-- Taomlar jadvali -->
      <table v-if="meals.length" class="meal-table" aria-label="Taomlar ro'yxati">
        <thead>
          <tr>
            <th>#</th>
            <th>Taom nomi</th>
            <th>Kategoriya</th>
            <th>Ta'rif</th>
            <th>Qo‘shilgan sana</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(meal, index) in meals" :key="meal.id">
            <td>{{ index + 1 }}</td>
            <td>{{ meal.name }}</td>
            <td>{{ meal.category || '-' }}</td>
            <td>{{ meal.description || '-' }}</td>
            <td>{{ formatDate(meal.created_at) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Bo‘sh holat -->
      <div v-else class="empty">🚫 Taomlar ro‘yxati hozircha boʻsh</div>
    </template>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'OshxonaTaomlar',
  data() {
    return {
      meals: [],
      loading: false,
      newMeal: {
        nomi: '',
        kategoriya: '',
        description: ''
      },
      // Backenddagi enum qiymatlariga to'liq mos massiv
      categories: [
        'oddiy',
        'parhez',
        'diyabetik parxez',
        'allergiyaga qarshi'
      ]
    };
  },
  methods: {
    async fetchMeals() {
      this.loading = true;
      try {
        const { data } = await api.get('/api/v1/meal');
        this.meals = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('❌ Taomlarni olishda xatolik:', err);
        alert('Taomlarni olishda xatolik yuz berdi.');
      } finally {
        this.loading = false;
      }
    },
    async submitMeal() {
      // Majburiy nomi bo'sh emasligini tekshirish
      if (!this.newMeal.nomi.trim()) {
        alert('❗ Taom nomi majburiy');
        return;
      }

      // Kategoriyani to'g'rilash: faqat enum qiymatlari yoki null
      const categoryValue = this.categories.includes(this.newMeal.kategoriya)
        ? this.newMeal.kategoriya
        : null;

      try {
        this.loading = true;
        const res = await api.post('/api/v1/meal', {
          name: this.newMeal.nomi.trim(),
          category: categoryValue,
          description: this.newMeal.description.trim() || null
        });

        // Yangi taomni ro'yxat boshiga qo'shish
        this.meals.unshift(res.data);

        // Formani tozalash
        this.newMeal = { nomi: '', kategoriya: '', description: '' };
      } catch (err) {
        console.error('❌ Yangi taom qoʻshishda xatolik:', err);
        const response = err.response;
        if (response && response.status === 422) {
          alert('Xatolik: ' + JSON.stringify(response.data));
        } else {
          alert('Yangi taomni qoʻshib boʻlmadi.');
        }
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleDateString('uz-UZ');
    }
  },
  mounted() {
    this.fetchMeals();
  }
};
</script>

<style scoped>
.oshxona-taomlar-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', sans-serif;
}
h2 {
  margin-bottom: 24px;
  color: #1a6291;
}
.add-form {
  margin-bottom: 30px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
}
.add-form h3 {
  margin-bottom: 10px;
  color: #333;
}
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.form-row input,
.form-row select,
.form-row textarea {
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  flex: 1;
  min-width: 150px;
}
.form-row button {
  padding: 10px 18px;
  background: #1a6291;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}
.form-row button:hover {
  background: #145179;
}
.meal-table {
  width: 100%;
  border-collapse: collapse;
}
.meal-table th,
.meal-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}
.meal-table th {
  background-color: #f3f3f3;
}
.loading {
  text-align: center;
  font-size: 18px;
  color: #666;
  padding: 20px;
}
.empty {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px;
}
@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
  }
}
</style>
