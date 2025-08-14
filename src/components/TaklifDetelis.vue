<template>
  <div class="details-page" v-if="booking">
    <h2>🧾 Bemor Ma'lumotlari</h2>

    <!-- KO‘RISH HOLATI -->
    <div class="card-view" v-if="!editMode">
      <div class="info-block">
        <p><strong>F.I.Sh:</strong> {{ booking.fullName }}</p>
        <p><strong>Yosh:</strong> {{ booking.age }} yosh</p>
        <p><strong>Jinsi:</strong> {{ booking.gender }}</p>
        <p><strong>Kelgan sana:</strong> {{ booking.arrivalDate }}</p>
        <p><strong>Ketgan sana:</strong> {{ booking.leaveDate }}</p>
        <p><strong>Xona:</strong> {{ booking.room.name }} — {{ booking.room.price }} so'm</p>
        <p><strong>Xizmatlar:</strong></p>
        <ul>
          <li v-for="(s, i) in booking.services" :key="i">{{ s.name }} — {{ s.price }} so'm</li>
        </ul>
        <p class="total">Jami: {{ booking.totalSum }} so'm</p>
      </div>

      <div class="action-buttons">
        <button class="btn primary" @click="editMode = true">✏️ Tahrirlash</button>
        <button class="btn danger" @click="deleteAll">🗑 O‘chirish</button>
        <button class="btn success" @click="save">💾 Saqlash</button>
      </div>
    </div>

    <!-- TAHRIR HOLATI -->
    <div class="edit-block" v-else>
      <input v-model="edited.fullName" placeholder="F.I.Sh" />
      <input v-model="edited.age" type="number" placeholder="Yosh" />
      <select v-model="edited.gender">
        <option>Erkak</option>
        <option>Ayol</option>
      </select>
      <input type="date" v-model="edited.arrivalDate" />
      <input type="date" v-model="edited.leaveDate" />
      <input v-model="edited.room.name" placeholder="Xona nomi" />

      <ul>
        <li v-for="(s, i) in edited.services" :key="i">
          {{ s.name }} — {{ s.price }} so'm
        </li>
      </ul>

      <div class="action-buttons">
        <button class="btn success" @click="save">💾 Saqlash</button>
        <button class="btn secondary" @click="cancelEdit">❌ Bekor qilish</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'PatientCardView',

  /* ---------------------------------------------------------------- data */
  data() {
    return {
      /* Foydalanuvchi */
      currentUser: {},

      /* Bemor va davolanishlar */
      patient: null,
      stays: [],
      roomAssignments: [],

      /* Qo‘shimcha ma’lumotlar */
      xizmatlar: [],
      kasalliklar: [],
      natijalar: [],

      /* Kataloglar */
      availableRooms: [],
      availableRoomTypes: [],
      allServices: [],

      /* UI holati */
      activeTab: 'xizmatlar',
      rr: { kirish_sanasi: '', chiqish_sanasi: '', xona_id: '', xizmatlar: [] },

      /* Yuklanish va rol */
      loading: false,
      role: localStorage.getItem('role') || 'mini'
    };
  },

  /* ----------------------------------------------------------- lifecycle */
  async mounted() {
    await this.fetchUserData();  // 1) user_data
    await this.fetchAll();       // 2) bemor va u bilan bog‘liq narsalar
  },

  /* ----------------------------------------------------------- computed */
  computed: {
    /* xona turlari ➜ narx map */
    roomTypePriceMap() {
      const map = {};
      (Array.isArray(this.availableRoomTypes) ? this.availableRoomTypes : [])
        .forEach(rt => { map[rt.id] = +rt.Narxi || +rt.price || +rt.narxi || 0; });
      return map;
    },

    /* eng so‘nggi davolanish */
    latestStay() {
      return this.stays[0] || null;
    },

    /* jadvalda ko‘rinadigan xona ma’lumotlari */
    roomData() {
      return (Array.isArray(this.roomAssignments) ? this.roomAssignments : []).map(a => {
        const room = (a.room || this.availableRooms.find(r => r.id == a.room_id)) || {};
        const dayPrice = +a.price_per_day || this.roomTypePriceMap[room.room_type_id] || 0;
        const days = Math.max(Math.ceil((new Date(a.to_date) - new Date(a.from_date)) / 864e5), 0);

        return {
          roomNumber: room.xona || '-',
          roomName:   room.nomi || room.xona || '-',
          price:      dayPrice * days,
          kirish_sanasi: a.from_date,
          chiqish_sanasi: a.to_date,
          sana: a.from_date
        };
      });
    },

    /* joriy tabdagi ma’lumot */
    filteredData() {
      switch (this.activeTab) {
        case 'xizmatlar': return this.xizmatlar;
        case 'kasalliklar': return this.kasalliklar;
        case 'natijalar':   return this.natijalar;
        case 'xonalar':     return this.roomData;
        default:           return [];
      }
    },

    /* yangi xona tanlansa ➜ kunlik narx */
    rrPrice() {
      const r = this.availableRooms.find(x => x.id === this.rr.xona_id);
      return r ? this.roomTypePriceMap[r.room_type_id] || 0 : 0;
    },

    /* moliyaviy yig‘indilar */
    total() {
      return this.xizmatlar.reduce((s, x) => s + (+x.narxi || 0), 0);
    },
    totalPaid() {
      return this.xizmatlar.filter(x => x.tolangan).reduce((s, x) => s + (+x.narxi || 0), 0);
    },
    totalUnpaid() {
      return this.total - this.totalPaid;
    }
  },

  /* ------------------------------------------------------------- methods */
  methods: {
    /* ---------- format yordamchilari ---------- */
    formatDate(d) {
      return d ? new Date(d).toLocaleDateString('uz-UZ') : '-';
    },
    formatPrice(p) {
      return p ? `${(+p).toLocaleString()} soʻm` : '0 soʻm';
    },
    hisoblaYosh(d) {
      if (!d) return '-';
      const b = new Date(d), t = new Date();
      let y = t.getFullYear() - b.getFullYear();
      if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) y--;
      return y;
    },

    /* ---------- 1) user_data ---------- */
    async fetchUserData() {
      try {
        const { data } = await api.get('/api/v1/user_data');
        this.currentUser = data;
        localStorage.setItem('currentUser', JSON.stringify(data));
      } catch (err) {
        console.error('user_data xatosi', err);
        alert('Foydalanuvchi maʼlumotlarini olishda xatolik. Iltimos, qayta kiring.');
      }
    },

    /* ---------- 2) bemor va bog‘liq ma’lumotlar ---------- */
    async fetchAll() {
      this.loading = true;
      try {
        const id = this.$route.params.id;

        const [
          p, st, rooms, services, roomTypes, roomAssigns
        ] = await Promise.all([
          api.get(`/api/v1/clients/${id}`),
          api.get(`/api/v1/davolanish?client_id=${id}`),
          api.get('/api/v1/room'),
          api.get('/api/v1/services'),
          api.get('/api/v1/room-types'),
          api.get(`/api/v1/xona-joylashuv?client_id=${id}`)
        ]);

        this.patient            = p.data;
        this.stays              = st.data;
        this.availableRooms     = rooms.data;
        this.allServices        = services.data;
        this.availableRoomTypes = roomTypes.data || [];
        this.roomAssignments    = roomAssigns.data || [];
        this.kasalliklar        = this.patient.kasalliklar || [];
        this.natijalar          = this.patient.natijalar   || [];

        if (this.latestStay) {
          const { data: clientSrv } = await api.get(
            `/api/v1/client-services?davolanish_id=${this.latestStay.id}`
          );
          this.xizmatlar = clientSrv.map(srv => ({
            ...srv,
            nomi:  this.allServices.find(a => a.id === srv.service_id)?.nomi || srv.nomi,
            narxi: srv.narxi ?? srv.price ?? 0
          }));
        }
      } catch (err) {
        console.error(err);
        alert('Maʼlumotlarni olishda xatolik');
      } finally {
        this.loading = false;
      }
    },

    /* ---------- “Yana yotaman” ---------- */
    async submitReRegister() {
      const r = this.rr;
      if (!r.kirish_sanasi || !r.chiqish_sanasi || !r.xona_id) {
        return alert('Barcha maydonlarni toʻldiring');
      }
      if (!this.currentUser.id) {
        return alert('Foydalanuvchi maʼlum emas. Qayta kiring.');
      }

      try {
        /* 1. Davolanish yaratish */
        const { data: newStay } = await api.post('/api/v1/davolanish', {
          client_id:      this.patient.id,
          room_id:        r.xona_id,
          from_date:      r.kirish_sanasi,
          to_date:        r.chiqish_sanasi,
          create_user_id: this.currentUser.id
        });

        /* 2. Xona-joylashuv */
        await api.post('/api/v1/xona-joylashuv', {
          davolanish_id: newStay.id,
          room_id:       r.xona_id,
          from_date:     r.kirish_sanasi,
          to_date:       r.chiqish_sanasi
        });

        /* 3. Xizmatlar */
        for (const sid of r.xizmatlar) {
          await api.post('/api/v1/client-services', {
            client_id:     this.patient.id,
            davolanish_id: newStay.id,
            service_id:    sid,
            start_date:    r.kirish_sanasi,
            price:         this.allServices.find(s => s.id === sid)?.narxi || 0
          });
        }

        alert('✅ Yangi yotish muvaffaqiyatli qo‘shildi');
        this.rr = { kirish_sanasi: '', chiqish_sanasi: '', xona_id: '', xizmatlar: [] };
        this.fetchAll();
      } catch (err) {
        console.error(err);
        alert('❌ Saqlashda xatolik yuz berdi');
      }
    }
  }
};
</script>





<style scoped>
.details-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #fefefe;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  font-family: "Segoe UI", sans-serif;
  color: #1f2937;
}

h2 {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 30px;
  color: #0f172a;
}

.card-view,
.edit-block {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-block {
  background: #f8fafc;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.info-block p,
ul li {
  margin: 6px 0;
}

.total {
  margin-top: 12px;
  font-weight: 600;
  color: #16a34a;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn.primary {
  background-color: #3b82f6;
  color: white;
}

.btn.danger {
  background-color: #ef4444;
  color: white;
}

.btn.success {
  background-color: #10b981;
  color: white;
}

.btn.secondary {
  background-color: #9ca3af;
  color: white;
}

.edit-block input,
.edit-block select {
  padding: 10px;
  font-size: 15px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f9fafb;
  outline: none;
}

.edit-block input:focus,
.edit-block select:focus {
  border-color: #3b82f6;
  background: #eef6ff;
}

ul {
  padding-left: 20px;
  margin: 10px 0;
  list-style: disc;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
}
</style>
