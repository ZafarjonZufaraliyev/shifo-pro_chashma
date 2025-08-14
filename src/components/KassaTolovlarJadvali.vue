<template>
  <div class="payments-table">
    <h2 class="title">To‘lovlar jadvali</h2>

    <!-- Filtr paneli -->
    <div class="filter-panel">
      <label>
        Boshlanish sanasi:
        <input type="date" v-model="filters.fromDate" />
      </label>
      <label>
        Tugash sanasi:
        <input type="date" v-model="filters.toDate" />
      </label>
      <label>
        Turi:
        <select v-model="filters.type">
          <option value="">Barchasi</option>
          <option value="kirim">Kirim</option>
          <option value="chiqim">Chiqim</option>
        </select>
      </label>
      <label>
        Qayerga:
        <select v-model="filters.from">
          <option value="">Barchasi</option>
          <option
            v-for="(val, idx) in uniqueFromValues"
            :key="idx"
            :value="val"
          >
            {{ val }}
          </option>
        </select>
      </label>
    </div>

    <!-- Jadval -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Sana va vaqt</th>
          <th>Turi</th>
          <th>Naqd</th>
          <th>Karta</th>
          <th>Click</th>
          <th>Humo</th>
          <th>Qayerga</th>
          <th>Kassir</th>
          <th>Izoh</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in filteredPayments" :key="item.id">
          <td>{{ index + 1 }}</td>
          <td>{{ formatDate(item.created_at) }}</td>
          <td>{{ item.type }}</td>
          <td>{{ formatAmount(item.cash) }}</td>
          <td>{{ formatAmount(item.card) }}</td>
          <td>{{ formatAmount(item.click) }}</td>
          <td>{{ formatAmount(item.humo) }}</td>
          <td>{{ item.from || "-" }}</td>
          <td>{{ item.cashier || "-" }}</td>
          <td>{{ item.comment || "-" }}</td>
          <td>🛠</td>
        </tr>
        <tr v-if="filteredPayments.length === 0">
          <td colspan="11" style="text-align:center;">Ma’lumotlar mavjud emas</td>
        </tr>
      </tbody>

      <!-- Umumiy summalar -->
      <tfoot v-if="filteredPayments.length > 0">
        <tr>
          <td colspan="3" style="text-align:right;"><strong>Jami:</strong></td>
          <td>{{ formatAmount(totals.cash) }}</td>
          <td>{{ formatAmount(totals.card) }}</td>
          <td>{{ formatAmount(totals.click) }}</td>
          <td>{{ formatAmount(totals.humo) }}</td>
          <td colspan="4"></td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PaymentsTable",
  data() {
    const today = this.formatDateInput(new Date());
    return {
      allPayments: [],
      filters: {
        fromDate: today,
        toDate: today,
        type: "",
        from: "",
      },
    };
  },
  computed: {
   filteredPayments() {
  const from = new Date(this.filters.fromDate);
  const to = new Date(this.filters.toDate);
  to.setDate(to.getDate() + 1); // ertangi 00:00 gacha

  return this.allPayments
    .filter((p) => {
      const created = new Date(p.created_at);
      const isDateInRange = created >= from && created < to;
      const isTypeMatch = this.filters.type
        ? p.type === this.filters.type
        : true;
      const isFromMatch = this.filters.from
        ? p.from === this.filters.from
        : true;
      const isNotPatient = p.is_patient_payment === false;

      return isDateInRange && isTypeMatch && isFromMatch && isNotPatient;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
,
    uniqueFromValues() {
      const set = new Set();
      this.allPayments.forEach((p) => {
        if (p.from) {
          set.add(p.from);
        }
      });
      return Array.from(set);
    },
    totals() {
      return this.filteredPayments.reduce(
        (acc, p) => {
          acc.cash += Number(p.cash) || 0;
          acc.card += Number(p.card) || 0;
          acc.click += Number(p.click) || 0;
          acc.humo += Number(p.humo) || 0;
          return acc;
        },
        { cash: 0, card: 0, click: 0, humo: 0 }
      );
    },
  },
  methods: {
    async fetchPayments() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("/api/v1/payments", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response)
    // Konsolga to‘liq javobni chiqaramiz
    console.log("API javobi:", response);

    // To‘lovlar ro‘yxatini ajratib olamiz
    this.allPayments = Array.isArray(response.data.data)
      ? response.data.data
      : [];

    console.log("AllPayments:", this.allPayments);
  } catch (error) {
    console.error("❌ To‘lovlarni olishda xatolik:", error);
    this.allPayments = [];
  }
}
,
    formatDate(datetime) {
      if (!datetime) return "-";
      const date = new Date(datetime);
      return date.toLocaleString("uz-UZ", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatAmount(amount) {
      const num = Number(amount);
      if (isNaN(num)) return "-";
      const abs = Math.abs(num).toLocaleString("uz-UZ");
      return (num < 0 ? "-" : "") + abs + " so'm";
    },
    formatDateInput(date) {
      const d = new Date(date);
      return d.toISOString().slice(0, 10);
    },
  },
  mounted() {
    this.fetchPayments();
  },
};
</script>



<style scoped>
.payments-table {
  margin: 20px auto;
  padding: 10px;
  max-width: 1800px;
  width:100%;
  overflow-x: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 15px;
  font-size: 25px;
  font-weight: 700;
  color: #333;
}

.filter-panel {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.filter-panel label {
  display: flex;
  flex-direction: column;
  font-size: 25px;
  color: #555;
}

.filter-panel input,
.filter-panel select {
  padding: 10px;
  font-size: 23px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 25px;
}

th,
td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
  font-size: 24px;
}

th {
  background-color: #f4f4f4;
  font-weight: 600;
  color: #444;
}

tbody tr:hover {
  background-color: #f9f9f9;
  transition: background-color 0.3s;
}

td {
  color: #333;
  white-space: nowrap;
}
</style>
