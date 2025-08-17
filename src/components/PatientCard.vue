<template>
  <div class="patient-cardd" v-if="!loading && patient">
    <h2>🏪 Bemor Maʼlumotlari</h2>

    <!-- Asosiy maʼlumotlar -->
    <div class="info-grid">
      <div><strong>Familiya:</strong> {{ patient.familiya }}</div>
      <div><strong>Ism:</strong> {{ patient.ism }}</div>
      <div><strong>Yoshi:</strong> {{ hisoblaYosh(patient.tugulgan_sana) }}</div>
      <div><strong>Jinsi:</strong> {{ patient.jinsi || 'Nomaʼlum' }}</div>
    </div>

    <!-- Tab menyu -->
    <div class="tab-header">
      <div :class="['tab-title', { active: activeTab === 'xizmatlar' }]" @click="activeTab = 'xizmatlar'">Xizmatlar
      </div>
      <div :class="['tab-title', { active: activeTab === 'kasalliklar' }]" @click="activeTab = 'kasalliklar'">
        Kasalliklar</div>
      <div :class="['tab-title', { active: activeTab === 'natijalar' }]" @click="activeTab = 'natijalar'">Natijalar
      </div>
      <div :class="['tab-title', { active: activeTab === 'xonalar' }]" @click="activeTab = 'xonalar'">Xonalar</div>
      <div :class="['tab-title', { active: activeTab === 'davolanishlar' }]" @click="activeTab = 'davolanishlar'">
        Davolanishlar</div>
    </div>

    <!-- Jadval -->
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>

          <template v-if="activeTab === 'xizmatlar'">
            <th>Xizmat nomi</th>
            <th>Narxi</th>
            <th>Sana</th>
            <th>Amal</th>
          </template>

          <th v-if="activeTab === 'kasalliklar'">Kasallik nomi</th>
          <th v-if="activeTab === 'natijalar'">Natija</th>

          <template v-if="activeTab === 'xonalar'">
            <th>Xona raqami</th>
            <th>Narxi</th>
            <th>Kirgan</th>
            <th>Chiqgan</th>
            <th>Amal</th>
          </template>

          <template v-if="activeTab === 'davolanishlar'">
            <th>Davolanish ID</th>
            <th>Boshlanish sanasi</th>
            <th>Tugash sanasi</th>
            <th>Status</th>
          </template>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(item, i) in filteredData" :key="item.id || i">
          <td>{{ i + 1 }}</td>

          <template v-if="activeTab === 'xizmatlar'">
            <td>{{ item.nomi || '-' }}</td>
            <td>{{ formatPrice(item.narxi || item.price) }}</td>
            <td>{{ formatDate(item.sana) }}</td>
            <td><button @click="deleteService(item)">🗑️</button></td>
          </template>

          <td v-if="activeTab === 'kasalliklar'">{{ item.nomi || '-' }}</td>
          <td v-if="activeTab === 'natijalar'">{{ item.natija || '-' }}</td>

          <template v-if="activeTab === 'xonalar'">
            <td>{{ item.roomNumber || '-' }}</td>
            <td>{{ formatPrice(item.price) }}</td>
            <td>{{ formatDate(item.kirish_sanasi) }}</td>
            <td><input type="date" v-model="item.chiqish_sanasi" /></td>
            <td>
              <button @click="updateExitDate(item)">📝</button>
              <button @click="deleteRoomAssignment(item)">🗑️</button>
            </td>
          </template>

          <template v-if="activeTab === 'davolanishlar'">
            <td>{{ item.id }}</td>
            <td>{{ formatDate(item.from_date || item.kelish_sanasi) }}</td>
            <td>{{ formatDate(item.to_date || item.tugash_sanasi) }}</td>
            <td>{{ item.status === 1 ? 'Aktiv' : 'Faol emas' }}</td>
          </template>
        </tr>

        <!-- Xizmat qo‘shish -->
        <tr v-if="activeTab === 'xizmatlar'" class="input-row">
          <td>*</td>
          <td>
            <select v-model="newService.service_id">
              <option disabled value="">Tanlang</option>
              <option v-for="s in allServices" :key="s.id" :value="s.id">{{ s.nomi || s.name }}</option>
            </select>
          </td>
          <td>{{ selectedServicePrice ? formatPrice(selectedServicePrice) : '-' }}</td>
          <td><input type="date" v-model="newService.sana" /></td>
          <td><button @click="addService">➕</button></td>
        </tr>

        <!-- Yangi xona qo‘shish -->
        <!-- Yangi xona qo‘shish -->
<tr v-if="activeTab === 'xonalar'" class="input-row">
  <td>*</td>

  <!-- Xona tanlash -->
  <td>
    <select v-model="rr.xona_id">
      <option disabled value="">Tanlang</option>
      <option v-for="r in availableRooms" :key="r.id" :value="r.id">
        {{ r.room_type?.name || 'Nomaʼlum' }} {{ r.xona }}
      </option>
    </select>
  </td>

  <!-- Narx avtomatik chiqadi, lekin o‘zgartirish mumkin -->
  <td>
    <input type="number" v-model.number="rr.price" min="0" placeholder="Narx" />
  </td>

  <!-- 1 kunlik default sana qo‘yiladi -->
  <td>
    <input type="date" v-model="rr.kirish_sanasi" />
  </td>
  <td>
    <input type="date" v-model="rr.chiqish_sanasi" />
  </td>

  <!-- HAS_CHILD checkbox -->
  <td style="display: flex; align-items: center; gap: 8px;">
    <label>
      <input type="checkbox" v-model="rr.has_child" />
      Bolalik bor
    </label>
  </td>

  <!-- NUM_CHILD input -->
  <td>
    <input
      v-if="rr.has_child"
      type="number"
      min="1"
      v-model.number="rr.num_child"
      placeholder="Bola soni"
      style="width: 80px;"
    />
  </td>

  <!-- Qo‘shish tugmasi -->
  <td>
    <button @click="submitReRegister">➕</button>
  </td>
</tr>


      </tbody>
    </table>

    <router-link :to="`/${role}/bemorlar`" class="btn-back">↩ Orqaga</router-link>
  </div>
  
  <div v-else class="loading-container">
    <p>⏳ Yuklanmoqda...</p>
  </div>
</template>
<script>
import api from '@/api';

export default {
  name: 'PatientCardView',
  data() {
    return {
      loading: false,
      patient: null,

      xizmatlar: [],
      kasalliklar: [],
      natijalar: [],
      stays: [],
      roomAssignments: [],

      availableRooms: [],
      availableRoomTypes: [],
      allServices: [],

      activeTab: 'xizmatlar',

      // yangi xizmat formasi
      newService: { service_id: '', sana: '' },

      // qayta ro‘yxatga olish formasi
      rr: {
        kirish_sanasi: '',
        chiqish_sanasi: '',
        xona_id: '',
        xizmatlar: [],
        price: 0,
        has_child: false,
        num_child: 0,
      },

      role: localStorage.getItem('role') || 'mini',
      currentUser: JSON.parse(localStorage.getItem('currentUser') || '{}'),
    };
  },

  computed: {
    latestStay() {
      if (!this.stays.length) return null;
      return this.stays.reduce((a, b) => {
        const d1 = new Date(a.kelish_sanasi || a.from_date);
        const d2 = new Date(b.kelish_sanasi || b.from_date);
        return d1 > d2 ? a : b;
      });
    },

    rrPrice() {
      if (!this.rr.xona_id || !this.rr.kirish_sanasi || !this.rr.chiqish_sanasi) return null;
      const room = this.availableRooms.find(r => String(r.id) === String(this.rr.xona_id));
      const roomType = this.availableRoomTypes.find(rt => String(rt.id) === String(room?.room_type_id));
      const pricePerDay = Number(roomType?.Narxi || roomType?.price || 0);
      const from = new Date(this.rr.kirish_sanasi);
      const to = new Date(this.rr.chiqish_sanasi);
      const days = to > from ? Math.floor((to - from) / 86400000) + 1 : 0;
      return pricePerDay * days;
    },

    selectedServicePrice() {
      const selected = this.allServices.find(s => s.id === this.newService.service_id);
      return selected ? (selected.narxi || selected.price || 0) : null;
    },

    roomData() {
      const stayIds = this.stays.map(s => s.id);
      return this.roomAssignments
        .filter(a => stayIds.includes(Number(a.davolanish_id)))
        .map(a => {
          const room = this.availableRooms.find(r => String(r.id) === String(a.room_id)) || {};
          const roomType = this.availableRoomTypes.find(rt => String(rt.id) === String(room?.room_type_id)) || {};
          const pricePerDay = Number(a.price_per_day || roomType.Narxi || roomType.price || 0) || 1;
          const from = new Date(a.from_date || a.kirish_sanasi);
          const to = new Date(a.to_date || a.chiqish_sanasi);
          const days = to > from ? Math.floor((to - from) / 86400000) + 1 : 0;
          return {
            id: a.id,
            roomNumber: room.xona || room.room_number || room.nomi || 'Nomaʼlum',
            price: pricePerDay * days,
            kirish_sanasi: a.from_date || a.kirish_sanasi,
            chiqish_sanasi: a.to_date || a.chiqish_sanasi,
          };
        });
    },

    filteredData() {
      switch (this.activeTab) {
        case 'xizmatlar': return this.xizmatlar;
        case 'kasalliklar': return this.kasalliklar;
        case 'natijalar': return this.natijalar;
        case 'xonalar': return this.roomData;
        case 'davolanishlar': return this.stays;
        default: return [];
      }
    }
  },

  watch: {
    'rr.xona_id'(newVal) {
      if (!newVal) {
        this.rr.price = 0;
        return;
      }
      const selectedRoom = this.availableRooms.find(r => String(r.id) === String(newVal));
      if (!selectedRoom) {
        this.rr.price = 0;
        return;
      }
      const roomType = this.availableRoomTypes.find(rt => String(rt.id) === String(selectedRoom.room_type_id));
      this.rr.price = Number(roomType?.Narxi || roomType?.price || 0);
    }
  },

  methods: {
    formatDate(d) {
      if (!d) return '-';
      const dt = new Date(d);
      return isNaN(dt) ? '-' : dt.toLocaleDateString('uz-UZ');
    },

    formatPrice(p) {
      return `${Number(p || 0).toLocaleString()} soʻm`;
    },

    hisoblaYosh(d) {
      if (!d) return '-';
      const birth = new Date(d);
      const today = new Date();
      let yosh = today.getFullYear() - birth.getFullYear();
      if (
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
      ) yosh--;
      return yosh;
    },

    async fetchAll() {
      this.loading = true;
      const clientId = Number(this.$route.params.id);
      try {
        const { data: patient } = await api.get(`/api/v1/clients/${clientId}`);
        this.patient = patient;

        this.kasalliklar = (patient.kasalliklar || []).filter(k => Number(k.client_id) === clientId);
        this.natijalar = (patient.natijalar || []).filter(n => Number(n.client_id) === clientId);

        const { data: stayData } = await api.get(`/api/v1/davolanish?client_id=${clientId}`);
        this.stays = Array.isArray(stayData) ? stayData : stayData?.data || [];

        const { data: roomAssignmentsData } = await api.get(`/api/v1/xona-joylashuv/kassa?client_id=${clientId}`);
        this.roomAssignments = Array.isArray(roomAssignmentsData) ? roomAssignmentsData : roomAssignmentsData?.data || [];

        const { data: roomTypesRaw } = await api.get('/api/v1/room-types');
        this.availableRoomTypes = roomTypesRaw?.data || roomTypesRaw || [];

        const { data: rooms } = await api.get('/api/v1/room');
        this.availableRooms = rooms || [];

        const { data: services } = await api.get('/api/v1/services');
        this.allServices = services || [];

        const clientServicesRes = await api.get('/api/v1/client-services', {
          params: { client_id: clientId }
        });
        const clientServices = clientServicesRes?.data?.data || clientServicesRes.data.data || [];
        this.xizmatlar = clientServices.map(s => {
          const info = this.allServices.find(a => a.id === Number(s.service_id));
          return {
            ...s,
            nomi: info?.nomi || info?.name || 'Nomaʼlum',
            narxi: Number(s.price || s.narxi || 0),
            sana: s.start_date || s.sana,
            id: s.id,
          };
        });
      } catch (err) {
        console.error('❌ Xatolik fetchAll() da:', err);
        alert('Maʼlumotlarni yuklashda xatolik yuz berdi');
      } finally {
        this.loading = false;
      }
    },

    async addService() {
      if (!this.newService.service_id || !this.newService.sana) {
        return alert('❗ Xizmat va sana tanlanishi kerak');
      }
      if (!this.latestStay) {
        return alert('❗ Avval davolanishni tanlang yoki yarating');
      }
      try {
        const service = this.allServices.find(s => s.id === this.newService.service_id);
        await api.post('/api/v1/client-services', {
          client_id: this.patient.id,
          davolanish_id: this.latestStay.id,
          service_id: this.newService.service_id,
          start_date: this.newService.sana,
          price: service?.narxi || service?.price || 0,
        });
        this.newService = { service_id: '', sana: '' };
        await this.fetchAll();
      } catch (err) {
        console.error('Xizmat qo‘shishda xatolik:', err);
        alert('Xizmat qo‘shishda xatolik yuz berdi');
      }
    },

    async deleteService(item) {
      if (!confirm('🗑️ Ushbu xizmatni o‘chirmoqchimisiz?')) return;
      try {
        await api.delete(`/api/v1/client-services/${item.id}`);
        await this.fetchAll();
      } catch (err) {
        console.error('Xizmat o‘chirishda xatolik:', err);
        alert('Xizmat o‘chirishda xatolik yuz berdi');
      }
    },

    async deleteRoomAssignment(item) {
      if (!confirm('🗑️ Ushbu xona joylashuvini o‘chirmoqchimisiz?')) return;
      try {
        await api.delete(`/api/v1/xona-joylashuv/${item.id}`);
        await this.fetchAll();
      } catch (err) {
        console.error('Xona joylashuvini o‘chirishda xatolik:', err);
        alert('Xona joylashuvini o‘chirishda xatolik yuz berdi');
      }
    },

    async updateExitDate(item) {
      if (!item.chiqish_sanasi) return alert('❌ Chiqish sanasi kiritilmagan');
      try {
        await api.put(`/api/v1/xona-joylashuv/${item.id}`, { to_date: item.chiqish_sanasi });

        let davolanishId = item.davolanish_id;
        if (!davolanishId) {
          const res = await api.get('/api/v1/davolanish', {
            params: { client_id: this.patient.id, kelish_sanasi: item.kirish_sanasi || item.from_date },
          });
          const data = res.data.data || [];
          if (data.length > 0) davolanishId = data[0].id;
        }

        if (davolanishId) {
          await api.put(`/api/v1/davolanish/${davolanishId}`, { ketish_sanasi: item.chiqish_sanasi });
        }

        await this.fetchAll();
      } catch (error) {
        alert('Xatolik yuz berdi, iltimos qayta urinib ko‘ring.');
      }
    },

    async submitReRegister() {
      const r = this.rr;
      if (!r.kirish_sanasi || !r.chiqish_sanasi || !r.xona_id) {
        return alert('❗ Barcha maydonlar toʻldirilishi kerak');
      }

      try {
        let stay = this.latestStay;

        // agar oxirgi davolanish yopilgan bo‘lsa, yangi yaratish
        if (!stay || stay.ketish_sanasi || stay.to_date) {
          const { data: newStayResponse } = await api.post('/api/v1/davolanish', {
            client_id: this.patient.id,
            kelish_sanasi: r.kirish_sanasi,
            ketish_sanasi: r.chiqish_sanasi,
            xona_id: r.xona_id,
            create_user_id: this.currentUser.id,
          });
          stay = newStayResponse.data || newStayResponse;
        }

        // eski xona yopish
        const lastRoom = [...this.roomAssignments]
          .filter((ra) => ra.davolanish_id === stay.id)
          .sort((a, b) => new Date(b.kirish_sanasi || b.from_date) - new Date(a.kirish_sanasi || a.from_date))[0];

        if (lastRoom) {
          await api.put(`/api/v1/xona-joylashuv/${lastRoom.id}`, {
            ...lastRoom,
            to_date: r.kirish_sanasi,
          });
        }

        // yangi xona qo‘shish
        await api.post('/api/v1/xona-joylashuv', {
          davolanish_id: stay.id,
          room_id: r.xona_id,
          from_date: r.kirish_sanasi,
          to_date: r.chiqish_sanasi,
          price_per_day: r.price || 0,
          has_child: r.has_child ? 1 : 0,
          num_child: r.num_child || 0,
        });

        // xizmatlar qo‘shish
        for (const sid of r.xizmatlar) {
          const s = this.allServices.find((srv) => srv.id === sid);
          await api.post('/api/v1/client-services', {
            client_id: this.patient.id,
            davolanish_id: stay.id,
            service_id: sid,
            start_date: r.kirish_sanasi,
            price: s ? s.narxi || s.price || 0 : 0,
          });
        }

        // formani tozalash
        this.rr = {
          kirish_sanasi: '',
          chiqish_sanasi: '',
          xona_id: '',
          xizmatlar: [],
          price: 0,
          has_child: false,
          num_child: 0,
        };

        await this.fetchAll();
      } catch (err) {
        console.error('❌ Qayta ro‘yxatga olishda xatolik:', err.response?.data || err.message);
        alert('Qayta ro‘yxatga olishda xatolik yuz berdi');
      }
    }
  },

  mounted() {
    this.fetchAll();
  },
};
</script>










<style scoped>
.patient-cardd {
  max-width: 1200px;
  margin: 20px auto;
  width: 100%;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease;
}

.patient-cardd h2 {
  text-align: center;
  color: #007BFF;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
  background: #f4f9ff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e1eaff;
}

.info-grid div {
  font-size: 15px;
  color: #333;
}

.tab-header {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-title {
  padding: 12px 18px;
  font-weight: 600;
  cursor: pointer;
  color: #666;
  transition: all 0.25s;
  border-bottom: 3px solid transparent;
}

.tab-title:hover {
  color: #007BFF;
}

.tab-title.active {
  color: #007BFF;
  border-color: #007BFF;
  background-color: #f0f8ff;
  border-radius: 6px 6px 0 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 25px;
}

.data-table th,
.data-table td {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  text-align: left;
  font-size: 14px;
}

.data-table th {
  background-color: #f1f6ff;
  font-weight: bold;
  color: #333;
}

.data-table tr:nth-child(even) {
  background-color: #fafafa;
}

.input-row input[type="date"],
.input-row select {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  transition: border 0.3s ease;
}

.input-row input[type="date"]:focus,
.input-row select:focus {
  border-color: #007BFF;
  outline: none;
}

button {
  padding: 6px 12px;
  border: none;
  background-color: #007BFF;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.25s;
}

button:hover {
  background-color: #0056b3;
}

.btn-back {
  display: inline-block;
  margin-top: 15px;
  text-decoration: none;
  background: #f0f0f0;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  color: #007BFF;
  transition: background 0.25s;
}

.btn-back:hover {
  background: #e6f0ff;
}

.loading-container {
  text-align: center;
  margin-top: 80px;
  font-size: 18px;
  color: #888;
}
</style>
