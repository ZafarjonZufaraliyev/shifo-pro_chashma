<template>
  <div class="container">
    <h2>Tahlil parametrlarini qo‘shish</h2>

    <div>
      <label for="labTestTypeSelect">Tahlil turi:</label>
      <select v-model="newParameter.lab_test_type_id" id="labTestTypeSelect" required>
        <option disabled value="">Tanlang</option>
        <option v-for="type in labTestTypes" :key="type.id" :value="type.id">
          {{ type.name }}
        </option>
      </select>
    </div>

    <form @submit.prevent="addParameter">
      <div>
        <label for="name">Parametr nomi:</label>
        <input type="text" id="name" v-model="newParameter.name" required />
      </div>

      <div>
        <label for="unit">Birlik:</label>
        <input type="text" id="unit" v-model="newParameter.unit" required />
      </div>

      <div>
        <label for="normal_range">Normal oralig'i:</label>
        <input type="text" id="normal_range" v-model="newParameter.normal_range" required />
      </div>

      <div>
        <label for="price">Narxi (so‘mda):</label>
        <input
          type="number"
          id="price"
          v-model.number="newParameter.price"
          min="0"
          step="0.01"
          required
          placeholder="Masalan: 10000"
        />
      </div>

      <button type="submit">Qo'shish</button>
    </form>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'TestParameters',

  data() {
    return {
      labTestTypes: [],
      newParameter: {
        lab_test_type_id: '',
        name: '',
        unit: '',
        normal_range: '',
        price: null,
      },
    };
  },

  mounted() {
    this.fetchLabTestTypes();
  },

  methods: {
    async fetchLabTestTypes() {
      try {
        const response = await api.get('/api/v1/lab-test-types');
        this.labTestTypes = response.data;
      } catch (error) {
        console.error('Tahlil turlari yuklanishda xato:', error);
        alert('Tahlil turlari yuklanishda xatolik yuz berdi');
      }
    },

    async addParameter() {
      try {
        if (!this.newParameter.lab_test_type_id) {
          alert('Iltimos, tahlil turini tanlang!');
          return;
        }
        if (!this.newParameter.price && this.newParameter.price !== 0) {
          alert('Iltimos, narxini kiriting!');
          return;
        }

        const payload = {
          lab_test_type_id: this.newParameter.lab_test_type_id,
          name: this.newParameter.name,
          unit: this.newParameter.unit,
          normal_range: this.newParameter.normal_range,
          price: this.newParameter.price,
        };

        await api.post('/api/v1/test-parameters', payload);
        alert('Parametr muvaffaqiyatli qo‘shildi');

        // Formani tozalash
        this.newParameter = {
          lab_test_type_id: '',
          name: '',
          unit: '',
          normal_range: '',
          price: null,
        };
      } catch (error) {
        console.error('Parametr qo‘shishda xato:', error);
        alert(error.response?.data?.message || 'Parametr qo‘shishda xatolik yuz berdi');
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
}

label {
  display: block;
  margin-top: 15px;
  font-weight: 600;
}

input,
select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 600;
}

button:hover {
  background-color: #218838;
}
</style>
