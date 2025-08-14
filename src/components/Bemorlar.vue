<template>
  <div class="patients-container">
    <div class="header-section">
      <h2 class="page-title">🩺 Bemorlar Ro'yxati</h2>
    </div>

    <div class="top-controls">
      <div class="search-box">
        <img src="@/assets/image/sorch.svg" alt="Qidiruv" />
        <input
          type="search"
          placeholder="Ism yoki familiya bo‘yicha qidirish..."
          v-model="search"
          aria-label="Bemorlarni qidirish"
        />
      </div>
    </div>

    <div class="date-range-filter">
      <label>
        Boshlanish sanasi:
        <input type="date" v-model="startDate" />
      </label>
      <label>
        Tugash sanasi:
        <input type="date" v-model="endDate" />
      </label>
      <button @click="onFilterClick">Filtrlash</button>
      <button @click="fetchAllExpiredPatients" class="btn-red">
        Faqat Ketishi Keraklar
      </button>
    </div>

    <p class="total-count">
      <strong>Jami bemorlar soni:</strong> {{ totalPatientsCount }}
    </p>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <table v-else class="patients-table">
      <thead>
        <tr>
          <th>F.I.Sh</th>
          <th>Yosh | Jinsi</th>
          <th>Telefon</th>
          <th>Keldi</th>
          <th>Ketdi</th>
          <th>Xonasi</th>
          <th>Harakatlar</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="patient in patients"
          :key="patient.id"
          :class="{ 'today-leaving': isLeavingToday(patient.ketish_sanasi) }"
        >
          <td>
            <router-link :to="`/${role}/BemorCard/${patient.client.id}`">
              {{ patient.client.ism }} {{ patient.client.familiya }}
            </router-link>
          </td>
          <td>
            {{ calculateAge(patient.client.tugulgan_sana) }} yosh |
            {{ patient.client.jinsi }}
          </td>
          <td>{{ patient.client.tel1 || "—" }}</td>
          <td>{{ formatDateTime(patient.kelish_sanasi) || "—" }}</td>
          <td>{{ formatDateTime(patient.ketish_sanasi) || "—" }}</td>
          <td>{{ patient.room.xona }}</td>
          <td>
            <button
              v-if="patient.status === '1' && isLeavingToday(patient.ketish_sanasi)"
              @click="markAsLeft(patient)"
              class="btn-ketdi btn-today"
            >
              Ketdi
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination" v-if="pageCount > 1 && !onlyExpiredMode">
      <button
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
        class="pagination-btn"
      >
        &lt; Oldingi
      </button>

      <button
        v-for="page in pageCount"
        :key="page"
        @click="goToPage(page)"
        :class="['pagination-btn', { active: page === currentPage }]"
      >
        {{ page }}
      </button>

      <button
        :disabled="currentPage === pageCount"
        @click="goToPage(currentPage + 1)"
        class="pagination-btn"
      >
        Keyingi &gt;
      </button>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import dayjs from "dayjs";
import debounce from "lodash.debounce";

export default {
  data() {
    return {
      search: "",
      startDate: "",
      endDate: "",
      patients: [],
      totalPatientsCount: 0,
      loading: false,
      role: localStorage.getItem("role") || "mini",
      currentPage: 1,
      itemsPerPage: 20,
      onlyExpiredMode: false,
    };
  },

  watch: {
    search: {
      handler: debounce(function () {
        if (!this.onlyExpiredMode) {
          this.currentPage = 1;
          this.fetchPatients();
        }
      }, 500),
      immediate: true,
    },
    startDate() {
      if (!this.onlyExpiredMode) {
        this.currentPage = 1;
        this.fetchPatients();
      }
    },
    endDate() {
      if (!this.onlyExpiredMode) {
        this.currentPage = 1;
        this.fetchPatients();
      }
    },
    currentPage() {
      if (!this.onlyExpiredMode) {
        this.fetchPatients();
      }
    },
  },

  methods: {
    isLeavingToday(date) {
      if (!date) return false;
      const ketish = dayjs(date).format("YYYY-MM-DD");
      const today = dayjs().format("YYYY-MM-DD");
      return ketish <= today;
    },

    async fetchPatients() {
      this.loading = true;
      this.onlyExpiredMode = false;
      try {
        const params = {
          page: this.currentPage,
          per_page: this.itemsPerPage,
          search: this.search,
          status: "1", // faqat faol bemorlar
        };
        if (this.startDate) params.kelish_sanasi_from = this.startDate;
        if (this.endDate) params.kelish_sanasi_to = this.endDate;

        const res = await api.get("/api/v1/davolanish", { params });

        let allPatients = res.data.data || [];

        // Serverdan kelganlar all status=1 bo'lishi kerak, lekin qo'shimcha tekshiruv:
        allPatients = allPatients.filter((p) => p.status === "1");

        const today = dayjs().format("YYYY-MM-DD");

        const expiredOrToday = allPatients.filter(
          (p) => p.ketish_sanasi && dayjs(p.ketish_sanasi).format("YYYY-MM-DD") <= today
        );
        const others = allPatients.filter(
          (p) => !p.ketish_sanasi || dayjs(p.ketish_sanasi).format("YYYY-MM-DD") > today
        );

        if (this.currentPage === 1) {
          this.patients = [...expiredOrToday, ...others];
        } else {
          this.patients = others;
        }

        this.totalPatientsCount = res.data.total || allPatients.length;
      } catch (error) {
        console.error("Ma'lumot olishda xatolik:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchAllExpiredPatients() {
      this.loading = true;
      this.onlyExpiredMode = true;
      try {
        let allPatients = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const res = await api.get("/api/v1/davolanish", {
            params: {
              page,
              per_page: this.itemsPerPage,
              search: this.search,
              status: "1",
            },
          });

          const data = res.data.data || [];
          allPatients.push(...data);

          if (data.length < this.itemsPerPage) {
            hasMore = false;
          } else {
            page++;
          }
        }

        const today = dayjs().format("YYYY-MM-DD");

        this.patients = allPatients.filter(
          (p) => p.status === "1" && p.ketish_sanasi && dayjs(p.ketish_sanasi).format("YYYY-MM-DD") <= today
        );

        this.totalPatientsCount = this.patients.length;
      } catch (error) {
        console.error("Xatolik:", error);
      } finally {
        this.loading = false;
      }
    },

    calculateAge(birthdate) {
      if (!birthdate) return "—";
      const birth = dayjs(birthdate);
      const today = dayjs();
      let age = today.year() - birth.year();
      if (
        today.month() < birth.month() ||
        (today.month() === birth.month && today.date() < birth.date())
      ) {
        age--;
      }
      return age;
    },

    formatDateTime(datetimeStr) {
      if (!datetimeStr) return "—";
      return dayjs(datetimeStr).format("YYYY-MM-DD HH:mm");
    },

    async markAsLeft(patient) {
      try {
        this.loading = true;

        const payload = {
          id: patient.id,
          client_id: patient.client_id,
          kelish_sanasi: patient.kelish_sanasi,
          ketish_sanasi: patient.ketish_sanasi,
          xona_id: patient.xona_id,
          status: "0", // Ketgan holatga o‘zgartirish
          create_user_id: patient.create_user_id,
          create_user_name: patient.create_user_name,
          created_at: patient.created_at,
          updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        };

        const response = await api.put(`/api/v1/davolanish/${patient.id}`, payload);

        await this.fetchPatients();
      } catch (error) {
        console.error("Statusni o'zgartirishda xatolik:", error);
      } finally {
        this.loading = false;
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pageCount) {
        this.currentPage = page;
        window.scrollTo(0, 0);
      }
    },

    onFilterClick() {
      this.currentPage = 1;
      this.fetchPatients();
    },
  },

  computed: {
    pageCount() {
      return Math.ceil(this.totalPatientsCount / this.itemsPerPage);
    },
  },

  mounted() {
    this.fetchPatients();
  },
};
</script>



<style scoped>
.patients-table {
  width: 100%;
  border-collapse: collapse;
}

.patients-table th,
.patients-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.patients-table th {
  background-color: #f2f2f2;
}

.today-leaving {
  background-color: #ffe6e6;
}

.btn-ketdi {
  background-color: #ff6666;
  border: none;
  padding: 5px 10px;
  color: white;
  cursor: pointer;
  border-radius: 3px;
}

.btn-ketdi:hover {
  background-color: #ff4c4c;
}
</style>







<style scoped>
.table-wrapper {
  overflow-x: auto;
}

.patients-table {
  width: 100%;
  border-collapse: collapse;
}

.patients-table th,
.patients-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.patients-table th {
  background-color: #f4f4f4;
  text-align: left;
}

.name-link {
  color: #3498db;
  text-decoration: none;
}

.name-link:hover {
  text-decoration: underline;
}

.today-leaving {
  background-color: #ffe6e6;
}

.pagination-btn {
  margin: 0 3px;
}

.btn-red {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-red:hover {
  background-color: #c0392b;
}

/* ===== Umumiy konteyner va shrift ===== */
.patients-container {
  width: 100%;
  max-width: 1200px;
  /* kattaroq ekranga moslash uchun oshirildi */
  margin: 20px auto;
  padding: 20px;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
  user-select: none;
  box-sizing: border-box;
}

/* ===== Header ===== */
.header-section {
  margin-bottom: 25px;
  text-align: center;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #007bff;
  user-select: none;
}

/* ===== Yuqori boshqaruvlar ===== */
.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 12px;
}

/* ----- Qidiruv qutisi ----- */
.search-box {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 10px;
  padding: 8px 16px;
  box-shadow: 0 3px 8px rgb(0 0 0 / 0.12);
  flex-grow: 1;
  max-width: 450px;
  transition: box-shadow 0.3s ease;
}

.search-box:hover,
.search-box input:focus {
  box-shadow: 0 0 12px #007bffaa;
}

.search-box img {
  width: 22px;
  height: 22px;
  filter: grayscale(70%) brightness(60%);
}

.search-box input {
  border: none;
  outline: none;
  margin-left: 10px;
  font-size: 16px;
  width: 100%;
  background: transparent;
  color: #333;
  user-select: text;
}

.search-box input::placeholder {
  color: #aaa;
}

/* ===== Sana oralig‘i filtri ===== */
.date-range-filter {
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  justify-content: center;
}

.date-range-filter label {
  font-size: 15px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.date-range-filter input[type="date"] {
  padding: 7px 12px;
  border: 1.8px solid #ced4da;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: border-color 0.3s ease;
  user-select: text;
}

.date-range-filter input[type="date"]:focus {
  border-color: #007bff;
  outline: none;
}

.date-range-filter button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 22px;
  font-weight: 700;
  font-size: 15px;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 5px 15px rgb(0 123 255 / 0.4);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.date-range-filter button:hover {
  background-color: #0056b3;
  box-shadow: 0 7px 20px rgb(0 86 179 / 0.6);
}

/* ===== Jami bemorlar soni ===== */
.total-count {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin-bottom: 30px;
  text-align: center;
  user-select: none;
}

/* ===== Yuklanish spinner ===== */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 180px;
}

.spinner {
  border: 6px solid #e0e0e0;
  border-top: 6px solid #007bff;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== Kartalar konteyneri ===== */
.cards-wrapper {
  margin-top: 15px;
}

.cards-grid {
  display: grid;
  gap: 28px 22px;
  grid-template-columns: repeat(4, 1fr);
  /* default 4 ustun */
}

/* 5 ta ustun katta ekran uchun */
@media (min-width: 1300px) {
  .cards-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 30px 24px;
  }
}

/* 3 ustun o‘rta ekranlarda */
@media (max-width: 1199px) and (min-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 2 ustun kichik ekranlarda */
@media (max-width: 767px) and (min-width: 480px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px 18px;
  }
}

/* 1 ustun mobilda */
@media (max-width: 479px) {
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 18px 15px;
  }
}

/* ===== Har bir bemor kartasi ===== */
.patient1-card {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.1);
  padding: 28px 26px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  cursor: default;
  user-select: none;
  border: 3px solid transparent;
}

.patient1-card:hover {
  box-shadow: 0 14px 38px rgb(0 0 0 / 0.18);
  transform: translateY(-8px);
  border-color: #007bff;
}

/* Bugun ketadigan bemorlar uchun qizil chegara */
.today-leaving {
  border-color: #dc3545 !important;
}

/* Kartaning sarlavhasi */
.card__header {
  margin-bottom: 20px;
  user-select: text;
}

.card__header h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #007bff;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card__header span {
  font-size: 16px;
  font-weight: 600;
  color: #495057;
  user-select: text;
}

/* Kartaning asosiy ma'lumotlari */
.card__body p {
  margin: 12px 0;
  font-size: 16px;
  color: #343a40;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: text;
}

.card__body strong {
  color: #212529;
}

/* Text qisqartirish */
.card__body p strong,
.card__body p span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

/* ===== "Ketdi" tugmasi ===== */
.btn-ketdi {
  background-color: #28a745;
  border: none;
  color: white;
  padding: 8px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  margin-left: 14px;
  user-select: none;
  flex-shrink: 0;
  box-shadow: 0 5px 15px rgb(40 167 69 / 0.5);
}

.btn-ketdi:hover {
  background-color: #218838;
  box-shadow: 0 8px 18px rgb(33 136 56 / 0.6);
}

/* Bugun ketadiganlar uchun qizil tugma */
.btn-today {
  background-color: #dc3545;
  box-shadow: 0 5px 15px rgb(220 53 69 / 0.6);
}

.btn-today:hover {
  background-color: #b02a37;
  box-shadow: 0 8px 20px rgb(176 42 55 / 0.7);
}

/* ===== Pagination ===== */
.pagination {
  margin-top: 35px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  user-select: none;
}

.pagination-btn {
  border: 2px solid #007bff;
  background-color: white;
  color: #007bff;
  padding: 9px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
  min-width: 52px;
  text-align: center;
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
  box-shadow: none;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
  box-shadow: 0 0 14px #007bffaa;
}

.pagination-btn:disabled {
  border-color: #cfd4da;
  color: #cfd4da;
  cursor: not-allowed;
  background-color: #f8f9fa;
  box-shadow: none;
}

.pagination-btn.active {
  background-color: #007bff;
  color: white;
  box-shadow: 0 0 18px #007bffaa;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .page-title {
    font-size: 28px;
  }

  .search-box {
    max-width: 100%;
  }

  .date-range-filter button {
    padding: 9px 18px;
  }
}

@media (max-width: 767px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .patient1-card {
    padding: 22px 20px;
  }

  .card__header h3 {
    font-size: 20px;
  }

  .card__header span,
  .card__body p {
    font-size: 14px;
  }

  .btn-ketdi {
    font-size: 14px;
    padding: 7px 14px;
    margin-left: 10px;
  }
}

@media (max-width: 479px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .patient1-card {
    padding: 18px 16px;
  }

  .card__header h3 {
    font-size: 18px;
  }

  .card__header span,
  .card__body p {
    font-size: 13px;
  }

  .btn-ketdi {
    font-size: 13px;
    padding: 6px 12px;
    margin-left: 8px;
  }
}
</style>
