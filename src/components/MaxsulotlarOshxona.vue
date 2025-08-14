<template>
  <div class="oshpaz-page">
    <h2>👨‍🍳 Oshxona: Maxsulotlar holati</h2>

    <!-- Sana oralig'i filtri -->
    <div class="filter">
      <label>
        Boshlanish sanasi:
        <input type="date" v-model="dateFrom" />
      </label>
      <label>
        Tugash sanasi:
        <input type="date" v-model="dateTo" />
      </label>

      <button @click="clearFilter" class="btn-clear">Filterni tozalash</button>
    </div>

    <div v-if="filteredOutflows.length === 0" class="no-data">
      Hech qanday mahsulot topilmadi.
    </div>

    <div v-for="(items, sana) in groupedOutflows" :key="sana" class="group">
      <h3>📅 {{ sana }}</h3>
      <table class="product-table">
        <thead>
          <tr>
            <th>Nomi</th>
            <th>Miqdori</th>
            <th>Birlik</th>
            <th>Vaqt</th>
            <th>Holat</th>
            <th>Amal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item) in items" :key="item.id">
            <td>{{ item.product?.name || "Noma'lum mahsulot" }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.product?.unit || '' }}</td>
            <td>{{ formatTime(item.date) }}</td>
            <td>
              <span v-if="item.checking === 1" class="confirmed">Omborga tasdiqlandi</span>
              <span v-else class="pending">Tasdiqlanmadi</span>
            </td>
            <td>
              <button
                v-if="item.checking !== 1"
                @click="confirmOutflow(item)"
                :disabled="loadingIds.includes(item.id)"
                class="btn-confirm"
              >
                {{ loadingIds.includes(item.id) ? 'Tasdiqlanmoqda...' : 'Tasdiqlash' }}
              </button>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: "MaxsulotlarOshxona",
  data() {
    return {
      dateFrom: '',
      dateTo: '',
      dateFilterApplied: false,

      outflows: [], // Ombor chiqimlari ma'lumotlari
      loading: false,
      loadingIds: []
    };
  },
  computed: {
    filteredOutflows() {
      if (!this.dateFilterApplied || (!this.dateFrom && !this.dateTo)) return this.outflows;

      return this.outflows.filter(o => {
        const date = o.date; // 'YYYY-MM-DD'
        const afterFrom = !this.dateFrom || date >= this.dateFrom;
        const beforeTo = !this.dateTo || date <= this.dateTo;
        return afterFrom && beforeTo;
      });
    },
    groupedOutflows() {
      const groups = {};
      this.filteredOutflows.forEach(item => {
        const dateKey = item.date;
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(item);
      });
      return groups;
    }
  },
  methods: {
    async fetchOutflows() {
      this.loading = true;
      try {
        const { data } = await api.get('/api/v1/product-chiqim');
        this.outflows = data.map(o => ({
          ...o,
          checking: Number(o.checking)
        }));
      } catch (e) {
        console.error('Chiqimlarni olishda xatolik:', e);
        alert('Chiqimlarni olishda xatolik yuz berdi');
      } finally {
        this.loading = false;
      }
    },

    applyDateFilter() {
      this.dateFilterApplied = true;
    },

    clearFilter() {
      this.dateFrom = '';
      this.dateTo = '';
      this.dateFilterApplied = false;
    },

    formatTime(dateStr) {
      return new Date(dateStr).toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    async confirmOutflow(item) {
      if (item.checking === 1) {
        alert('Ushbu mahsulot allaqachon tasdiqlangan!');
        return;
      }

      this.loadingIds.push(item.id);

      try {
        await api.patch(`/api/v1/product-chiqim/${item.id}`, {
          product_id: item.product_id,
          quantity: item.quantity,
          used_for: item.used_for,
          date: item.date,
          comment: item.comment,
          checking: 1
        });

        const index = this.outflows.findIndex(o => o.id === item.id);
        if (index !== -1) this.outflows[index].checking = 1;

        alert('Mahsulot chiqimi tasdiqlandi!');
      } catch (error) {
        console.error('Tasdiqlashda xatolik:', error);
        alert('Tasdiqlashda xatolik yuz berdi!');
      } finally {
        this.loadingIds = this.loadingIds.filter(id => id !== item.id);
      }
    }
  },
  mounted() {
    this.fetchOutflows();
  }
};
</script>

<style scoped>
/* (Sizning oldingi style’laringiz shu yerda qolsin, agar xohlasangiz menga ayting, to‘liq style kiritib beraman) */
.oshpaz-page {
  max-width: 1200px;
  margin: 20px auto;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #2c3e50;
  font-weight: 700;
  font-size: 28px;
  letter-spacing: 1px;
}

.filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  justify-content: center;
}

.filter label {
  font-weight: 600;
  color: #34495e;
  user-select: none;
}

.filter input[type="date"] {
  padding: 6px 10px;
  font-size: 16px;
  border: 2px solid #2980b9;
  border-radius: 6px;
  transition: border-color 0.3s ease;
}

.filter input[type="date"]:focus {
  outline: none;
  border-color: #1abc9c;
}

.btn-clear {
  padding: 7px 15px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-clear:hover {
  background-color: #c0392b;
}

.group {
  margin-bottom: 35px;
  border-left: 5px solid #1abc9c;
  padding-left: 15px;
  background: #ecf0f1;
  border-radius: 8px;
}

.group h3 {
  margin-bottom: 12px;
  font-weight: 600;
  color: #16a085;
  letter-spacing: 0.6px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 7px rgb(0 0 0 / 0.1);
}

.product-table th,
.product-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.product-table thead th {
  background-color: #16a085;
  color: white;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.product-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.product-table tbody tr:hover {
  background-color: #d1f0e7;
  transition: background-color 0.3s ease;
  cursor: default;
}

.confirmed {
  color: #27ae60;
  font-weight: 700;
  background-color: #d5f5e3;
  padding: 4px 10px;
  border-radius: 15px;
  display: inline-block;
  text-transform: capitalize;
}

.pending {
  color: rgb(222, 149, 149);
  font-weight: 700;
  background-color: #f5c6c6;
  padding: 4px 10px;
  border-radius: 15px;
  display: inline-block;
  text-transform: capitalize;
}

.btn-confirm {
  background-color: #2980b9;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #1abc9c;
}

.btn-confirm:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.no-data {
  text-align: center;
  font-size: 18px;
  color: #888;
  margin-top: 40px;
}
</style>
