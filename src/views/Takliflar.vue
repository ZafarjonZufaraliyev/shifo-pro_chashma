<template>
  <div class="taklif-container">
    <h2 class="title">Takliflar sahifasi</h2>

    <!-- Mijoz ma'lumotlari -->
    <div v-if="client" class="user-info">
      <p><strong>F.I.Sh:</strong> {{ client.familiya }} {{ client.ism }}</p>
    </div>

    <!-- Filtrlar -->
    <div class="filter-row">
      <input v-model="roomFilterNumber" placeholder="Xona raqami" />
      <input v-model="roomFilterName" placeholder="Xona turi" />
      <input type="number" v-model.number="roomFilterSigim" placeholder="Sig'imi" />
      <button class="clear-filter-btn" @click="clearFilters">Tozalash</button>
    </div>

    <!-- Xonalar ro'yxati -->
    <div v-if="!selectedRoom">
      <table class="rooms-table">
        <thead>
          <tr>
            <th>Turi</th>
            <th>№</th>
            <th>Sig'imi</th>
            <th>Narxi</th>
            <th>Holati</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filteredRooms" :key="r.id"
            :class="['room-row', { busy: r.busy }, { current: isCurrentRoom(r.id) }]" @click="selectRoom(r)"
            :title="r.busy ? 'Band' : 'Tanlash'">
            <td>{{ r.room_type }}</td>
            <td>{{ r.xona }}</td>
            <td>{{ r.sigim }}</td>
            <td>{{ r.price.toLocaleString('ru-RU') }}</td>
            <td>
              <span v-if="isCurrentRoom(r.id)" style="color: #d97706; font-weight: 700;">
                Joriy yotmoqda ({{ r.currentPeople }}/{{ r.sigim }})
              </span>
              <span v-else-if="r.busy" style="color: red">
                Band ({{ r.currentPeople }}/{{ r.sigim }})
              </span>
              <span v-else style="color: green">
                Bo'sh <span v-if="r.currentPeople">({{ r.currentPeople }}/{{ r.sigim }})</span>
              </span>
            </td>
          </tr>
          <tr v-if="filteredRooms.length === 0">
            <td class="no-rooms" colspan="5">Xonalar topilmadi</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tanlangan xona haqida ma'lumot -->
    <div v-if="selectedRoom" class="selected-room">
      <h3>{{ selectedRoom.display }}</h3>

      <p>
        Narxi:
        <input type="number" v-model.number="selectedRoom.price" style="width:120px" /> so'm
      </p>

      <div class="date-row">
        <div class="form-group">
          <label>Kelish</label>
          <input type="date" :min="today" v-model="arrivalDate" @change="loadAllData" />
        </div>
        <div class="form-group">
          <label>Kunlar</label>
          <input type="number" min="1" v-model.number="stayDays" @input="loadAllData" />
        </div>
        <div class="form-group">
          <label>Ketish</label>
          <input type="date" :value="leaveDate" readonly />
        </div>
      </div>

      <!-- Bolalik checkbox va bola soni input -->
      <div class="form-group" style="margin:10px 0; display: flex; align-items: center; gap: 10px;">
        <label style="display: flex; align-items: center; gap: 5px;">
          <input type="checkbox" v-model="has_child" /> Bolalik 
          
        </label>

        <input v-if="has_child" type="number" min="1" v-model.number="childCount" placeholder="Bola soni"
          style="width: 100px;" />
      </div>

      <!-- Xizmatlar -->
      <div class="services-section">
        <h4>Majburiy xizmatlar</h4>
        <div v-for="(s, i) in mandatoryServices" :key="'m' + i" class="service-item">
          <input type="checkbox" v-model="s.selected" />
          {{ s.name }} —
          <input type="number" v-model.number="s.price" style="width:80px" /> so'm
        </div>

        <h4>Qo‘shimcha xizmatlar</h4>
        <div v-for="(s, i) in additionalServices" :key="'a' + i" class="service-item">
          <input type="checkbox" v-model="s.selected" />
          {{ s.name }} —
          <input type="number" v-model.number="s.price" style="width:80px" />
          <button @click="removeAdditionalService(i)" class="remove-btn" title="Xizmatni o'chirish">❌</button>
        </div>
      </div>

      <!-- Qo'shimcha to'lovlar -->
      <div class="extra-payments" style="margin-top: 20px;">
        <h4>Qo'shimcha to'lovlar</h4>
        <div class="payment-item">
          <label>Naqd to'lov:</label>
          <input type="number" min="0" v-model.number="extraPayments.cash" />
        </div>
        <div class="payment-item">
          <label>Karta to'lov:</label>
          <input type="number" min="0" v-model.number="extraPayments.card" />
        </div>
        <div class="payment-item">
          <label>Click to'lov:</label>
          <input type="number" min="0" v-model.number="extraPayments.click" />
        </div>
      </div>

      <div class="total-sum" style="margin: 15px 0;">
        Jami: <strong>{{ totalSum.toLocaleString('ru-RU') }} so'm</strong><br />
        To‘lovlar jami: <strong>{{ totalPaid.toLocaleString('ru-RU') }} so'm</strong><br />
        Qoldiq: <strong :style="{ color: balance < 0 ? 'red' : 'green' }">{{ balance.toLocaleString('ru-RU') }}
          so'm</strong>
      </div>
      <div v-if="loading" class="overlay">
        <div class="spinner"></div>
        <p>Iltimos kuting...</p>
      </div>
      <div v-if="message" :class="['message-box', messageType]">
        {{ message }}
      </div>
     <button 
  class="submit-btn" 
  @click="submitDavolanish" 
  :disabled="loading"
>
  <span v-if="loading">Saqlanmoqda...</span>
  <span v-else>📥 Saqlash</span>
</button>

      <button class="cancel-btn" @click="cancelSelection">Bekor</button>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  props: ['clientId'],
  data() {
    return {
      today: new Date().toISOString().slice(0, 10),
      client: null,
      loading: false,  // submit jarayonini nazorat qilish uchun
      selectedRoom: null,
      rooms: [],
      mandatoryServices: [],
      additionalServices: [],
      arrivalDate: new Date().toISOString().slice(0, 10),
      stayDays: 7,
      roomFilterNumber: '',
      roomFilterName: '',
      roomFilterSigim: null,
      has_child: false,
      childCount: 0,
      davolanishlar: [],
      bronlar: [],
      extraPayments: {
        cash: 0,
        card: 0,
        click: 0,
      },
      message: '',       // Ekranda ko‘rsatiladigan xabar
      messageType: '',   // 'success' yoki 'error' uchun
    };
  },
  computed: {
    leaveDate() {
      const d = new Date(this.arrivalDate);
      d.setDate(d.getDate() + this.stayDays - 1);
      return d.toISOString().slice(0, 10);
    },
    filteredRooms() {
      return this.rooms.filter(r => {
        const matchNumber = this.roomFilterNumber ? r.xona.toString().includes(this.roomFilterNumber) : true;
        const matchName = this.roomFilterName ? r.room_type.toLowerCase().includes(this.roomFilterName.toLowerCase()) : true;
        const matchSigim = this.roomFilterSigim ? r.sigim == this.roomFilterSigim : true;
        return matchNumber && matchName && matchSigim;
      });
    },
    totalSum() {
      const roomCost = this.selectedRoom ? this.selectedRoom.price * this.stayDays : 0;
      const mandCost = this.mandatoryServices
        .filter(s => s.selected)
        .reduce((sum, svc) => sum + svc.price, 0);
      const addCost = this.additionalServices
        .filter(svc => svc.selected)
        .reduce((sum, svc) => sum + svc.price, 0);
      return roomCost + mandCost + addCost;
    },
    totalPaid() {
      return (
        (this.extraPayments.cash || 0) +
        (this.extraPayments.card || 0) +
        (this.extraPayments.click || 0)
      );
    },
    balance() {
      return this.totalSum - this.totalPaid;
    }
  },
  methods: {
    async loadClient(id) {
      try {
        const res = await api.get(`/api/v1/clients/${id}`);
        this.client = res.data;
      } catch (error) {
        console.error('Client load error:', error);
        this.showMessage('Mijoz ma\'lumotlari yuklanishda xatolik yuz berdi', 'error');
      }
    },
    async loadRooms() {
      try {
        const res = await api.get('/api/v1/room');
        this.rooms = res.data.map(r => ({
          ...r,
          sigim: r.sigim || r.capacity || 1,
          room_type: r.room_type?.name || 'Nomaʼlum',
          price: +r.room_type?.Narxi || 0,
          display: `${r.room_type?.name} (xona №${r.xona})`,
          busy: false,
          currentPeople: 0,
        }));
      } catch (error) {
        console.error('Rooms load error:', error);
        this.showMessage('Xonalar yuklanishda xatolik yuz berdi', 'error');
      }
    },
    async loadServices() {
      try {
        const res = await api.get('/api/v1/services');
        this.mandatoryServices = res.data
          .filter(s => s.required == 1)
          .map(s => ({ ...s, selected: true, price: +s.price }));
        this.additionalServices = res.data
          .filter(s => s.required != 1)
          .map(s => ({ ...s, selected: false, price: +s.price }));
      } catch (error) {
        console.error('Services load error:', error);
        this.showMessage('Xizmatlar yuklanishda xatolik yuz berdi', 'error');
      }
    },
    async loadDavolanishlar() {
      try {
        const res = await api.get('/api/v1/davolanish');
        this.davolanishlar = Array.isArray(res.data) ? res.data : res.data.data || [];
      } catch (error) {
        console.error('Davolanish load error:', error);
        this.davolanishlar = [];
        this.showMessage('Davolanishlar yuklanmadi', 'error');
      }
    },
    async loadBronlar() {
      try {
        const res = await api.get('/api/v1/bron');
        this.bronlar = Array.isArray(res.data) ? res.data : res.data.data || [];
      } catch (error) {
        console.error('Bron load error:', error);
        this.bronlar = [];
        this.showMessage('Bronlar yuklanmadi', 'error');
      }
    },
    markBusyRooms() {
      const today = new Date(this.today);
      const roomOccupancy = {};

      this.davolanishlar.forEach(dav => {
        if (!dav.kelish_sanasi || !dav.ketish_sanasi) return;
        const kelish = new Date(dav.kelish_sanasi);
        const ketish = new Date(dav.ketish_sanasi);
        if (today >= kelish && today <= ketish) {
          const roomId = dav.xona_id.toString();
          roomOccupancy[roomId] = (roomOccupancy[roomId] || 0) + 1;
        }
      });

      this.bronlar.forEach(bron => {
        if (bron.status !== 'faol') return;
        if (!bron.start || !bron.end) return;
        const start = new Date(bron.start);
        const end = new Date(bron.end);
        if (today >= start && today <= end) {
          const roomId = (bron.xona?.id || bron.xona_id).toString();
          roomOccupancy[roomId] = (roomOccupancy[roomId] || 0) + 1;
        }
      });

      this.rooms = this.rooms.map(r => {
        const roomId = (r.id ?? r.xona).toString();
        const odamlarSoni = roomOccupancy[roomId] || 0;
        const isBusy = odamlarSoni >= r.sigim;
        return {
          ...r,
          busy: isBusy,
          currentPeople: odamlarSoni
        };
      });
    },
    isCurrentRoom(roomId) {
      const today = new Date(this.today);
      return this.davolanishlar.some(dav => {
        if (dav.xona_id.toString() !== roomId.toString()) return false;
        const kelish = new Date(dav.kelish_sanasi);
        const ketish = new Date(dav.ketish_sanasi);
        return today >= kelish && today <= ketish;
      });
    },
    selectRoom(room) {
      if (!room.busy) {
        this.selectedRoom = { ...room };
      } else {
        this.showMessage('Bu xona band!', 'error');
      }
    },
    clearFilters() {
      this.roomFilterNumber = '';
      this.roomFilterName = '';
      this.roomFilterSigim = null;
    },
    cancelSelection() {
      this.selectedRoom = null;
      this.loadServices();
      this.extraPayments = { cash: 0, card: 0, click: 0 };
      this.has_child = false;
      this.childCount = 0;
    },
    isLeavingRoom(roomId) {
    const today = new Date(this.today);
    return this.davolanishlar.some(dav => {
      if (dav.xona_id.toString() !== roomId.toString()) return false;
      if (!dav.ketish_sanasi) return false;
      const ketish = new Date(dav.ketish_sanasi);
      // Ketish sanasi bugun yoki undan oldin bo‘lsa
      return ketish <= today;
    });
  },
    removeAdditionalService(index) {
      this.additionalServices.splice(index, 1);
    },

    showMessage(text, type = 'success') {
      this.message = text;
      this.messageType = type;
      // 5 sekunddan keyin xabarni o‘chirish
      setTimeout(() => {
        this.message = '';
        this.messageType = '';
      }, 5000);
    },

   async submitDavolanish() {
  // 🔹 Ikki martta bosishga qarshi himoya
  if (this.loading) return;
  this.loading = true;

  // Xabarlarni tozalash
  this.message = '';
  this.messageType = '';

  try {
    // 1️⃣ Xona tanlanganini tekshirish
    if (!this.selectedRoom) {
      this.showMessage('Xona tanlang!', 'error');
      return;
    }

    // 2️⃣ Mijoz tanlanganini tekshirish
    if (!this.client?.id) {
      this.showMessage('Mijoz tanlanmagan!', 'error');
      return;
    }

    // 3️⃣ Davolanish yaratish
    let davolanish;
    try {
      const res = await api.post('/api/v1/davolanish', {
        client_id: this.client.id,
        xona_id: this.selectedRoom.id,
        kelish_sanasi: this.arrivalDate,
        ketish_sanasi: this.leaveDate
      });
      davolanish = res.data.data || res.data;
    } catch (error) {
      this.showMessage('Davolanish saqlanmadi', 'error');
      return;
    }

    // Davolanish ID tekshirish
    if (!davolanish?.id) {
      this.showMessage('Davolanish ID topilmadi', 'error');
      return;
    }

    // 4️⃣ Xona joylashuvini saqlash
    try {
      await api.post('/api/v1/xona-joylashuv', {
        davolanish_id: davolanish.id,
        room_id: this.selectedRoom.id,
        from_date: this.arrivalDate,
        to_date: this.leaveDate,
        has_child: this.has_child ? 1 : 0,
        num_child: this.childCount || 0,
        price_per_day: this.selectedRoom.price
      });
    } catch (error) {
      this.showMessage('Joylashuv saqlanmadi', 'error');
      return;
    }

    // 5️⃣ Xizmatlarni tayyorlash
    const selectedServices = [
      ...this.mandatoryServices.filter(s => s.selected),
      ...this.additionalServices.filter(s => s.selected)
    ];

    // 6️⃣ Xizmatlarni saqlash
    try {
      await api.post('/api/v1/client-services', {
        client_id: this.client.id,
        davolanish_id: davolanish.id,
        services: selectedServices.map(s => ({
          service_id: s.id,
          price: s.price,
          mahal: s.mahal || 1,
          total_days: this.stayDays,
          start_date: this.arrivalDate,
          kunlik_vaqtlari: s.kunlik_vaqtlari || []
        }))
      });
    } catch (error) {
      this.showMessage('Xizmatlar saqlanmadi', 'error');
      return;
    }

    // 7️⃣ To‘lovni saqlash
    try {
      await api.post('/api/v1/payments', {
        davolanish_id: davolanish.id,
        is_patient_payment: 1,
        client_id: this.client.id,
        cash: this.extraPayments.cash,
        card: this.extraPayments.card,
        click: this.extraPayments.click,
        total: this.totalSum,
        type: 'kirim',
        from: `${this.client.familiya} ${this.client.ism}`,
        datetime: new Date().toISOString()
      });
    } catch (error) {
      this.showMessage('To‘lov ma\'lumotlari saqlanmadi', 'error');
      return;
    }

    // 8️⃣ Formani tozalash
    this.cancelSelection();

    // 9️⃣ Ma’lumotlarni qayta yuklash
    await Promise.all([
      this.loadRooms(),
      this.loadDavolanishlar(),
      this.loadBronlar(),
      this.loadServices()
    ]);
    this.markBusyRooms();

    // 🔟 Muvaffaqiyat xabari
    this.showMessage('Davolanish muvaffaqiyatli saqlandi!', 'success');
  } finally {
    // Har qanday holatda loading ni o‘chirish
    this.loading = false;
  }
},

    async loadAllData() {
      await Promise.all([
        this.loadRooms(),
        this.loadServices(),
        this.loadDavolanishlar(),
        this.loadBronlar()
      ]);
      this.markBusyRooms();
    }
  },
  async mounted() {
    const id = this.clientId || this.$route.params.clientId;
    if (!id) {
      this.showMessage('Client ID topilmadi!', 'error');
      return;
    }
    await this.loadClient(id);
    await this.loadAllData();
  }
};
</script>


<style scoped>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.taklif-container {
  max-width: 1200px;
  margin: auto;
  padding: 1rem;
  font-family: Arial, sans-serif;
}

.title {
  text-align: center;
  margin-bottom: 1rem;
}

.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-row input {
  flex: 1;
  padding: 5px 10px;
  font-size: 1rem;
}

.clear-filter-btn {
  padding: 5px 10px;
  background-color: #e3342f;
  color: white;
  border: none;
  cursor: pointer;
}

.message-box {
  padding: 12px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  user-select: none;
  text-align: center;
}

.message-box.success {
  background-color: #d4edda;
  color: #155724;
  border: 1.5px solid #c3e6cb;
}

.message-box.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1.5px solid #f5c6cb;
}

.rooms-table {
  width: 100%;
  border-collapse: collapse;
}

.rooms-table th,
.rooms-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #ccc;
  border-top: 5px solid #3a86ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.room-row.busy {
  background-color: #f8d7da;
  cursor: not-allowed;
}

.room-row.current {
  background-color: #fff3cd;
}

.no-rooms {
  text-align: center;
  font-style: italic;
  color: #777;
}

.selected-room {
  border: 1px solid #ccc;
  padding: 15px;
  margin-top: 20px;
  background: #f9f9f9;
}

.date-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.services-section {
  margin-top: 10px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.remove-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #e3342f;
  font-weight: bold;
  font-size: 1rem;
}

.extra-payments {
  display: flex;
  gap: 15px;
}

.payment-item {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.submit-btn {
  background-color: #38c172;
  border: none;
  padding: 10px 20px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  margin-right: 10px;
}

.cancel-btn {
  background-color: #6c757d;
  border: none;
  padding: 10px 20px;
  color: white;
  font-weight: 700;
  cursor: pointer;
}
</style>
