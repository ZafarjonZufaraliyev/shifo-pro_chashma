<template>
  <div class="container">
    <!-- Filtrlar -->
    <router-link :to="`/${role}/RegisterPage`">
      <button class="add-button">+ Qo'shish</button>
    </router-link>
    <div class="filters">
      <input v-model="filters.familiya" @input="debouncedFetchClients" placeholder="Familiya bo'yicha qidirish"
        class="input" />
      <input v-model="filters.ism" @input="debouncedFetchClients" placeholder="Ism bo'yicha qidirish" class="input" />
      <input v-model="filters.pasport" @input="debouncedFetchClients" placeholder="Pasport bo'yicha qidirish"
        class="input" />
      <input v-model="filters.tugulgan_sana" @input="debouncedFetchClients" type="date"
        placeholder="Tug'ilgan sana bo'yicha qidirish" class="input" />
    </div>

    <!-- Klientlar jadvali -->
    <table class="client-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Familiya</th>
          <th>Ism</th>
          <th>Pasport</th>
          <th>Qayerdan</th>
          <th>Tel</th>
          <th>Tug'ilgan sana</th>
          <th>Taxrir</th>
        </tr>
      </thead>
      <tbody>
  <tr
    v-for="(client, index) in clients"
    :key="client.id"
    class="table-row"
    tabindex="0"
    @keydown.enter="$emit('select-client', client)"
  >
    <td>{{ index + 1 + (pagination.current_page - 1) * pagination.per_page }}</td>
    <td>{{ client.familiya }}</td>
    <td>{{ client.ism }}</td>
    <td>{{ client.pasport }}</td>
    <td>{{ client.viloyat }}, {{ client.tuman }}</td>
    <td>{{ client.tel1 }}</td>
    <td>{{ client.tugulgan_sana }}</td>
    <td class="action-buttons">
      <!-- Ko'z belgisi -->
      <button
        class="icon-btn"
        title="Bemor kartasiga o'tish"
        @click="goToPatientCard(client.id)"
      >
        👁️
      </button>

      <!-- Qo'shish + -->
      <button
        class="icon-btn"
        title="Takliflarga o'tish"
        @click="goToTakliflar(client.id)"
      >
        +
      </button>
    </td>
  </tr>
  <tr v-if="clients.length === 0">
    <td colspan="8" class="no-data">Hech qanday ma'lumot topilmadi</td>
  </tr>
</tbody>

    </table>

    <!-- Paginatsiya -->
    <div v-if="pagination.last_page > 1" class="pagination">
      <button class="btn pagination-btn" :disabled="pagination.current_page === 1"
        @click="changePage(pagination.current_page - 1)" aria-label="Previous page">
        ← Oldingi
      </button>

      <!-- Sahifa raqamlari -->
      <button v-for="page in pagesToShow" :key="page" class="btn pagination-btn"
        :class="{ active: pagination.current_page === page }" @click="changePage(page)">
        {{ page }}
      </button>

      <!-- Agar oxirgi sahifa ko‘rinmasa, alohida tugma -->
      <button v-if="!pagesToShow.includes(pagination.last_page)" class="btn pagination-btn"
        :class="{ active: pagination.current_page === pagination.last_page }" @click="changePage(pagination.last_page)">
        {{ pagination.last_page }}
      </button>

      <button class="btn pagination-btn" :disabled="pagination.current_page === pagination.last_page"
        @click="changePage(pagination.current_page + 1)" aria-label="Next page">
        Keyingi →
      </button>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import debounce from 'lodash.debounce';

export default {
  name: 'ClientTable',
  data() {
    return {
      clients: [],
      filters: {
        familiya: '',
        ism: '',
        pasport: '',
        tugulgan_sana: '',
      },
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 50,           // Har sahifada 50 ta klient ko‘rsatish
        prev_page_url: null,
        next_page_url: null,
      },
      role: null,
      token: null,
    };
  },
  computed: {
    pagesToShow() {
      const total = this.pagination.last_page;
      const current = this.pagination.current_page;
      const maxButtons = 7; // ko‘rsatadigan sahifa tugmalari soni

      let start = Math.max(1, current - Math.floor(maxButtons / 2));
      let end = start + maxButtons - 1;

      if (end > total) {
        end = total;
        start = Math.max(1, end - maxButtons + 1);
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  created() {
    this.role = localStorage.getItem('role');
    this.token = localStorage.getItem('token');

    const allowedRoles = ['admin', 'kassa'];
    if (!allowedRoles.includes(this.role)) {
      alert('Sizda bu sahifaga kirish uchun ruxsat yo‘q!');
      this.$router.push({ name: 'LoginPage' });
      return;
    }

    if (api.defaults) {
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }

    this.debouncedFetchClients = debounce(this.fetchClients, 400);
    this.fetchClients();
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        this.pagination.current_page = 1;
        this.debouncedFetchClients();
      },
    },
  },
  methods: {
    async fetchClients() {
      try {
        const filteredParams = {};
        Object.entries(this.filters).forEach(([key, val]) => {
          if (val && val.toString().trim() !== '') {
            filteredParams[key] = val.toString().trim();
          }
        });

        const params = {
          ...filteredParams,
          page: this.pagination.current_page,
          per_page: this.pagination.per_page,
        };

        const res = await api.get('public/api/v1/clients', { params });

        this.clients = res.data.data;
        this.pagination = {
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          per_page: res.data.per_page,
          prev_page_url: res.data.prev_page_url,
          next_page_url: res.data.next_page_url,
        };
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert("Sessiya muddati tugagan. Qayta login qiling.");
          localStorage.clear();
          this.$router.push({ name: 'LoginPage' });
        } else {
          console.error('Xatolik:', error);
        }
        this.clients = [];
        this.pagination.last_page = 1;
      }
    },
    
  goToPatientCard(clientId) {
    // To'g'ridan-to'g'ri bemor kartasiga yo'naltirish
    this.$router.push({ path: `/${this.role}/BemorCard/${clientId}` });
  },

  goToTakliflar(clientId) {
    // Rolyga qarab takliflar sahifasiga yo'naltirish
    if (this.role === 'kassa') {
      this.$router.push({ name: 'miniTakliflar', params: { clientId } });
    } else if (this.role === 'admin') {
      this.$router.push({ name: 'adminTakliflar', params: { clientId } });
    } else {
      alert('Sizda takliflarga otish uchun ruxsat yoq');
    }
  },
    changePage(page) {
      if (page > 0 && page <= this.pagination.last_page && page !== this.pagination.current_page) {
        this.pagination.current_page = page;
        this.fetchClients();
      }
    },

    onPageInputChange() {
      if (this.pagination.current_page < 1) {
        this.pagination.current_page = 1;
      } else if (this.pagination.current_page > this.pagination.last_page) {
        this.pagination.current_page = this.pagination.last_page;
      }
      this.fetchClients();
    },
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 20px auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgb(0 0 0 / 0.12);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.input {
  flex: 1 1 200px;
  padding: 14px 18px;
  font-size: 16px;
  border: 2px solid #d1d9e6;
  border-radius: 10px;
  background-color: #f9fbfd;
  color: #34495e;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.input::placeholder {
  color: #a3abc6;
  font-style: italic;
}

.input:focus {
  outline: none;
  border-color: #4f8ef7;
  box-shadow: 0 0 8px rgba(79, 142, 247, 0.4);
}

.add-button {
  display: inline-block;
  margin-bottom: 20px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #4f8ef7 0%, #3a6ed8 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(79, 142, 247, 0.45);
  transition: background 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.add-button:hover {
  background: linear-gradient(135deg, #3a6ed8 0%, #2b54b5 100%);
  box-shadow: 0 8px 18px rgba(58, 110, 216, 0.6);
}

.client-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  font-size: 15px;
  color: #34495e;
}

.client-table thead tr {
  background-color: #4f8ef7;
  color: white;
  font-weight: 700;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(79, 142, 247, 0.3);
  user-select: none;
}

.client-table thead th {
  padding: 14px 22px;
  text-align: left;
  vertical-align: middle;
}

.client-table tbody tr {
  background-color: #f5f8ff;
  border-radius: 12px;
  transition: background-color 0.3s ease;
  box-shadow: 0 3px 6px rgb(79 142 247 / 0.12);
  cursor: pointer;
  user-select: none;
}

.client-table tbody tr:hover,
.client-table tbody tr:focus-visible {
  background-color: #d9e4ff;
  outline: none;
  box-shadow: 0 5px 12px rgba(79, 142, 247, 0.5);
}

.client-table tbody td {
  padding: 14px 22px;
  vertical-align: middle;
  border-bottom: none;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
}

.icon-btn {
  font-size: 18px;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background-color: #4f8ef7;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.icon-btn:hover {
  background-color: #3a6ed8;
  box-shadow: 0 4px 14px rgba(58, 110, 216, 0.6);
}

.no-data {
  text-align: center;
  padding: 18px 0;
  font-style: italic;
  color: #8e9db4;
  font-size: 16px;
  user-select: none;
}

/* Paginatsiya */
.pagination {
  margin-top: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  user-select: none;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.pagination-btn {
  background-color: #4f8ef7;
  border: none;
  color: white;
  padding: 10px 18px;
  font-size: 16px;
  border-radius: 10px;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  font-weight: 600;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #3a6ed8;
  box-shadow: 0 4px 14px rgba(58, 110, 216, 0.6);
}

.pagination-btn:disabled {
  background-color: #a3b1d1;
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-btn.active {
  background-color: #2b54b5;
  cursor: default;
  box-shadow: 0 0 12px rgba(43, 84, 181, 0.8);
  font-weight: 700;
}

</style>
