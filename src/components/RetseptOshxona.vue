<template>
  <div class="recipe-page">
    <h2>🍽 Retsept qo‘shish</h2>

    <form @submit.prevent="addRecipe" class="add-form">
      <label for="meal">Ovqat</label>
      <select id="meal" v-model.number="newRecipe.meal_id" required @change="onMealChange">
        <option disabled value="">Ovqatni tanlang</option>
        <option v-for="meal in meals" :key="meal.id" :value="meal.id">{{ meal.name }}</option>
      </select>

      <label for="product">Mahsulot</label>
      <select id="product" v-model.number="newRecipe.product_id" required>
        <option disabled value="">Mahsulotni tanlang</option>
        <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
      </select>

      <label for="amount">Miqdori</label>
      <input
        id="amount"
        type="number"
        step="0.01"
        min="0"
        v-model.number="newRecipe.amount"
        required
        placeholder="Masalan: 0.5"
      />

      <label for="unit">Birlik</label>
      <select id="unit" v-model="newRecipe.unit" required>
        <option disabled value="">Birlikni tanlang</option>
        <option v-for="unit in availableUnits" :key="unit" :value="unit">{{ unit }}</option>
      </select>

      <button type="submit">Qo‘shish</button>
    </form>

    <div v-if="error" class="error">{{ error }}</div>

    <h2 class="table-title">📋 Retseptlar ro'yxati</h2>
    <table class="recipe-table" v-if="recipes.length > 0">
      <thead>
        <tr>
          <th>Ovqat nomi</th>
          <th>Mahsulot nomi</th>
          <th>Miqdori</th>
          <th>Birlik</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(recipe, index) in recipes" :key="recipe.id || index">
          <td>{{ recipe.meal.name}}</td>
          <td>{{recipe.product.name }}</td>
          <td>{{ recipe.amount }}</td>
          <td>{{ recipe.unit }}</td>
          <td>
            <button @click="deleteRecipe(index)" class="btn-delete" title="O‘chirish">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>Hozircha retseptlar mavjud emas.</p>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      meals: [],
      products: [],
      recipes: [],

      newRecipe: {
        meal_id: null,
        product_id: null,
        amount: null,
        unit: ''
      },
      error: null,
      availableUnits: ['kg', 'l', 'dona'], // Default birliklar
    };
  },
  methods: {
    async fetchMeals() {
      try {
        const { data } = await api.get('/api/v1/meal');
        this.meals = data;
      } catch (e) {
        console.error('Ovqatlarni olishda xatolik', e);
      }
    },
    async fetchProducts() {
      try {
        const { data } = await api.get('/api/v1/products');
        this.products = data;
      } catch (e) {
        console.error('Mahsulotlarni olishda xatolik', e);
      }
    },
    async fetchRecipes() {
      try {
        const { data } = await api.get('/api/v1/meal-recipe');
        this.recipes = data;
      } catch (e) {
        console.error('Retseptlarni olishda xatolik', e);
      }
    },
    onMealChange() {
      const selectedMeal = this.meals.find(m => m.id === this.newRecipe.meal_id);
      if (!selectedMeal) {
        this.availableUnits = ['kg', 'l', 'dona'];
        this.newRecipe.unit = '';
        return;
      }

      const nameLower = selectedMeal.name.toLowerCase();

      // Agar "olma" so'zi bor bo'lsa, birlikni majburiy "kg" qilamiz
      if (nameLower.includes('olma')) {
        this.availableUnits = ['kg'];
        this.newRecipe.unit = 'kg';
        return;
      }

      // Boshqa shartlar
      if (nameLower.includes('meva') || nameLower.includes('fruit')) {
        this.availableUnits = ['dona'];
        this.newRecipe.unit = 'dona';
      } else if (nameLower.includes('suv') || nameLower.includes('suyuqlik')) {
        this.availableUnits = ['l'];
        this.newRecipe.unit = 'l';
      } else {
        this.availableUnits = ['kg', 'dona', 'l'];
        if (!this.availableUnits.includes(this.newRecipe.unit)) {
          this.newRecipe.unit = '';
        }
      }
    },
    getMealName(mealId) {
      const meal = this.meals.find(m => m.id === mealId);
      return meal ? meal.name : 'Noma\'lum ovqat';
    },
    getProductName(productId) {
      const product = this.products.find(p => p.id === productId);
      return product ? product.name : 'Noma\'lum mahsulot';
    },
    async addRecipe() {
      if (
        !this.newRecipe.meal_id ||
        !this.newRecipe.product_id ||
        !this.newRecipe.amount ||
        this.newRecipe.amount <= 0 ||
        !this.newRecipe.unit
      ) {
        this.error = 'Iltimos, barcha maydonlarni to‘ldiring va miqdor 0 dan katta bo‘lsin.';
        return;
      }
      this.error = null;

      try {
        await api.post('/api/v1/meal-recipe', {
          meal_id: this.newRecipe.meal_id,
          product_id: this.newRecipe.product_id,
          amount: this.newRecipe.amount,
          unit: this.newRecipe.unit,
        });
        alert('Retsept muvaffaqiyatli qo‘shildi!');
        this.newRecipe = { meal_id: null, product_id: null, amount: null, unit: '' };
        await this.fetchRecipes();  // Jadvalni yangilash uchun
      } catch (e) {
        console.error('Retsept qo‘shishda xatolik', e);
        this.error = e.response?.data?.message || 'Noma’lum xatolik yuz berdi.';
      }
    },
    deleteRecipe(index) {
      if (confirm('Haqiqatan o‘chirmoqchimisiz?')) {
        const recipe = this.recipes[index];
        if (!recipe || !recipe.id) {
          this.recipes.splice(index, 1);
          return;
        }
        api.delete(`/api/v1/meal-recipe/${recipe.id}`)
          .then(() => {
            this.recipes.splice(index, 1);
            alert('Retsept o‘chirildi');
          })
          .catch(e => {
            console.error('Retsept o‘chirishda xatolik', e);
            alert('Retseptni o‘chirishda xatolik yuz berdi');
          });
      }
    }
  },
  mounted() {
    this.fetchMeals();
    this.fetchProducts();
    this.fetchRecipes();
  }
};
</script>

<style scoped>
.recipe-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px ;
  background: #f9fafb;
  border-radius: 14px;
  box-shadow: 0 0 20px rgb(0 0 0 / 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  font-weight: 700;
  font-size: 1.8rem;
  letter-spacing: 1px;
  color: #1a6291;
}

.add-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.add-form label {
  flex: 0 0 auto;
  margin: 0 4px 0 0;
  font-weight: 600;
  font-size: 1rem;
  color: #34495e;
}

.add-form select,
.add-form input[type='number'] {
  flex: 0 0 140px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1.8px solid #bbb;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.add-form select:focus,
.add-form input[type='number']:focus {
  outline: none;
  border-color: #1a6291;
  box-shadow: 0 0 8px #1a6291aa;
}

.add-form button {
  flex: 0 0 110px;
  padding: 10px 0;
  background-color: #1a6291;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.25s ease;
  margin-left: 8px;
}

.add-form button:hover {
  background-color: #145179;
}

.error {
  margin-top: 12px;
  padding: 10px;
  background: #ffe6e6;
  border: 1.5px solid #f44336;
  color: #f44336;
  font-weight: 600;
  border-radius: 8px;
  text-align: center;
}

/* Jadval uchun */
.table-title {
  text-align: center;
  margin-bottom: 15px;
  color: #1a6291;
  font-weight: 700;
  font-size: 1.5rem;
}

.recipe-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 0 10px rgb(0 0 0 / 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.recipe-table thead {
  background-color: #1a6291;
  color: white;
}

.recipe-table th,
.recipe-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.recipe-table tbody tr:hover {
  background-color: #e9f0f7;
}

.btn-delete {
  background: #e74c3c;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.btn-delete:hover {
  background: #c0392b;
}

/* Responsive */
@media (max-width: 768px) {
  .add-form {
    flex-direction: column;
    align-items: stretch;
  }
  .add-form select,
  .add-form input[type='number'],
  .add-form button {
    flex: 1 1 auto;
    margin-left: 0 !important;
  }
  .add-form label {
    margin-bottom: 4px;
  }
}
</style>
