<!-- WarehouseReceive.vue -->
<template>
  <div class="warehouse-receive">
    <!-- Sarlavha -->
    <h2 class="header">
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M12 8v4l3 3m5-12l-9-4-9 4m18 0l-9 4m9-4v6a9 9 0 11-18 0V6" />
      </svg>
      Omborga kelgan mahsulotlar
    </h2>

    <!-- Sana oralig'i filtri -->
    <div class="date-filter">
      <label>
        Boshlanish sanasi
        <input type="date" v-model="startDate" :max="endDate" />
      </label>
      <label>
        Tugash sanasi
        <input type="date" v-model="endDate" :min="startDate" />
      </label>
      <button class="btn" @click="fetchKirims">
        🔍 Ko‘rish
      </button>
    </div>

    <!-- Yangi kirim formasi -->
    <div class="input-card">
      <div class="grid">
        <select v-model="newItem.product_id" class="input">
          <option value="" disabled hidden>Mahsulotni tanlang</option>
          <option v-for="p in products" :key="p.id" :value="p.id">
            {{ p.name }} ({{ p.unit }})
          </option>
        </select>

        <input v-model.number="newItem.quantity" type="number" min="1" placeholder="Miqdori" class="input" />

        <input v-model.number="newItem.unit_price" type="number" min="0" placeholder="Narxi (so‘m)" class="input" />

        <input v-model="newItem.date" type="date" class="input" />

        <input v-model="newItem.supplier" placeholder="Ta'minotchi" class="input" />

        <input v-model="newItem.note" placeholder="Izoh (ixtiyoriy)" class="input" />
      </div>

      <button class="btn" @click="addKirims" :disabled="!isValid">
        ＋ Qo‘shish
      </button>
    </div>

    <!-- Jadval -->
    <div v-if="displayedKirims.length" class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Mahsulot</th>
            <th>Miqdori</th>
            <th>Birligiga narx</th>
            <th>Jami</th>
            <th>Sana</th>
            <th>Ta'minotchi</th>
            <th>Izoh</th>
          </tr>
        </thead>
       <tbody>
  <tr v-for="(kirim, i) in displayedKirims" :key="kirim.id" :class="i % 2 === 0 ? 'even' : ''">
    <td>{{ i + 1 }}</td>
    <td class="bold">{{ kirim.product?.name || '—' }} ({{ kirim.product?.unit || '' }})</td>
    <td>{{ kirim.quantity }}</td>
    <td>{{ fmtCurrency(kirim.price_per_unit) }}</td>
    <td>{{ fmtCurrency(kirim.quantity * kirim.price_per_unit) }}</td>
    <td>{{ fmtDate(kirim.date) }}</td>
    <td>{{ kirim.supplier || '—' }}</td>
    <td class="italic small">{{ kirim.note || '—' }}</td>
  </tr>
</tbody>

      </table>
    </div>

    <!-- Bo‘sh holat -->
    <p v-else class="empty-state">
      Tanlangan kunda kirimlar topilmadi.
    </p>
  </div>
</template>

<script>
import api from '@/api'; // axios token bilan sozlangan instance

export default {
  data() {
    return {
      startDate: this.todayISO(),
      endDate: this.todayISO(),

      products: [],
      kirims: [],

      newItem: {
        product_id: '',
        quantity: 1,
        unit_price: 0,             
        date: this.todayISO(), 
        supplier: '',
        note: '',
      },

      errorMessage: '',
    };
  },

  computed: {
    isValid() {
      return (
        this.newItem.product_id !== '' &&
        this.newItem.quantity > 0 &&
        this.newItem.unit_price > 0 &&
        this.newItem.date !== ''
      );
    },

    displayedKirims() {
      return this.kirims.filter(
        (k) =>
          k.date >= this.startDate && k.date <= this.endDate
      );
    },
  },

  methods: {
    todayISO() {
      return new Date().toISOString().slice(0, 10);
    },

    fmtCurrency(value) {
      return new Intl.NumberFormat('uz-UZ', {
        style: 'currency',
        currency: 'UZS',
      }).format(value);
    },

    fmtDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('uz-UZ');
    },

    async fetchProducts() {
      this.errorMessage = '';
      try {
        const { data } = await api.get('/api/v1/products');
        this.products = data;
        console.log('Mahsulotlar yuklandi:', this.products);
      } catch (e) {
        this.errorMessage = 'Mahsulotlarni olishda xatolik yuz berdi.';
        console.error('Mahsulotlarni olishda xatolik:', e);
      }
    },

    async fetchKirims() {
      this.errorMessage = '';
      try {
        const { data } = await api.get('/api/v1/product-kirim', {
          params: {
            start_date: this.startDate,
            end_date: this.endDate,
          },
        });
        this.kirims = data;
        console.log('Kirimlar yuklandi:', this.kirims);
      } catch (e) {
        this.errorMessage = 'Kirimlarni olishda xatolik yuz berdi.';
        console.error('Kirimlarni olishda xatolik:', e);
      }
    },

    async addKirims() {
      if (!this.isValid) {
        alert('Iltimos, barcha majburiy maydonlarni to‘ldiring.');
        return;
      }

      const payload = {
        product_id: Number(this.newItem.product_id),
        quantity: parseFloat(this.newItem.quantity),
        price_per_unit: parseFloat(this.newItem.unit_price),
        date: this.newItem.date,
        supplier: this.newItem.supplier.trim() || null,
        note: this.newItem.note.trim() || null,
      };

      console.log('Yuborilayotgan payload:', payload);

      try {
        await api.post('/api/v1/product-kirim', payload);
        await this.fetchKirims();
        this.resetForm();
      } catch (error) {
        if (error.response && error.response.data) {
          this.errorMessage = error.response.data.message || 'Serverda xatolik yuz berdi';
          console.error('Server javobi:', error.response.data);

          if (error.response.data.errors) {
            const validationErrors = error.response.data.errors;
            let details = '';
            for (const field in validationErrors) {
              details += `${field}: ${validationErrors[field].join(', ')}\n`;
            }
            alert(`Xatolik: ${this.errorMessage}\n${details}`);
            return;
          }
        } else {
          this.errorMessage = error.message || 'Noma\'lum xatolik yuz berdi';
        }
        alert(`Kirim qo‘shishda xatolik: ${this.errorMessage}`);
      }
    },

    resetForm() {
      this.newItem = {
        product_id: '',
        quantity: 1,
        unit_price: 0,
        date: this.todayISO(),
        supplier: '',
        note: '',
      };
    },

    productName(id) {
      const p = this.products.find((x) => x.id === id);
      if (!p) {
        console.warn(`Mahsulot topilmadi: id = ${id}`);
        return '—';
      }
      return `${p.name} (${p.unit})`;
    },
  },

  async mounted() {
    await this.fetchProducts();
    await this.fetchKirims();
  },
};
</script>


<style scoped>
.warehouse-receive {
  max-width: 1100px;
  width:100%;
  margin: 20px 0px 0px 270px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1A6291; /* Yangilangan rang */
}

.header {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 28px;
  user-select: none;
  color: #1A6291; /* Sarlavha uchun rang */
}

.icon {
  width: 34px;
  height: 34px;
  stroke: #1A6291; /* Ikonka uchun rang */
}

.date-filter {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.date-filter label {
  display: flex;
  flex-direction: column;
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #1A6291;
}

.date-filter input {
  margin-top: 6px;
  border: 1.8px solid #1A6291;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 15px;
  background-color: #fff;
  color: #1A6291;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.date-filter input::placeholder {
  color: #4b5563;
}

.date-filter input:focus {
  border-color: #0F4970;
  background-color: #e5e7eb;
  outline: none;
}

.date-filter .btn {
  padding: 10px 24px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  background: #1A6291;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 6px 15px rgba(26, 98, 145, 0.5);
}

.date-filter .btn:hover:not(:disabled) {
  background-color: #0F4970;
  box-shadow: 0 8px 20px rgba(15, 73, 112, 0.7);
}

.date-filter .btn:active:not(:disabled) {
  background-color: #07304a;
  box-shadow: none;
}

.date-filter .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.input-card {
  background: #fff;
  border-radius: 22px;
  padding: 28px 30px;
  margin-bottom: 38px;
  box-shadow: 0 4px 20px rgba(26, 98, 145, 0.15);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 22px;
}

.input {
  border: 2px solid #1A6291;
  border-radius: 14px;
  padding: 12px 16px;
  font-size: 16px;
  color: #1A6291;
  background-color: #fff;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.input::placeholder {
  color: #4b5563;
  font-style: italic;
  letter-spacing: 0.02em;
}

.input:focus {
  border-color: #0F4970;
  background-color: #e5e7eb;
  outline: none;
  box-shadow: 0 0 8px rgba(15, 73, 112, 0.3);
}

select.input {
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #1A6291 50%),
    linear-gradient(135deg, #1A6291 50%, transparent 50%),
    linear-gradient(to right, #4b5563, #4b5563);
  background-position:
    calc(100% - 20px) calc(1em + 2px),
    calc(100% - 15px) calc(1em + 2px),
    calc(100% - 25px) 0.5em;
  background-size: 5px 5px, 5px 5px, 1px 1.5em;
  background-repeat: no-repeat;
  padding-right: 40px;
  cursor: pointer;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 28px;
  border-radius: 50px;
  background: #1A6291;
  border: none;
  color: white;
  font-weight: 700;
  font-size: 17px;
  cursor: pointer;
  user-select: none;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  box-shadow: 0 8px 18px rgba(26, 98, 145, 0.5);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn:hover:not(:disabled) {
  box-shadow: 0 10px 26px rgba(15, 73, 112, 0.7);
  transform: translateY(-2px);
}

.btn:active:not(:disabled) {
  box-shadow: 0 5px 12px rgba(15, 73, 112, 0.7);
  transform: translateY(1px);
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(26, 98, 145, 0.2);
  background-color: #fff;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

th,
td {
  padding: 14px 18px;
  border-bottom: 1.5px solid #cbd5e1;
  font-size: 15px;
  color: #1A6291;
}

th {
  background-color: #1A6291;
  color: #fff;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.06em;
}

tr.even {
  background-color: #f0f4f9;
}

.bold {
  font-weight: 700;
}

.italic {
  font-style: italic;
  color: #4b5563;
}

.small {
  font-size: 13px;
  color: #4b5563;
}

.empty-state {
  margin-top: 48px;
  text-align: center;
  font-size: 18px;
  color: #4b5563;
  font-style: italic;
  user-select: none;
  letter-spacing: 0.02em;
}

/* Animatsiya */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
