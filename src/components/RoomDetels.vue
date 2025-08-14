<template>
  <div class="room-details">
    <h2 class="title">Xona haqida ma'lumot</h2>

    <div v-if="room" class="info-wrapper">
      
      <div v-if="showArrivalTodayAlert" class="notification alert-booking">
        Diqqat! <strong>{{ nextBooking.name }}</strong> ismli mijoz bugun <strong>{{ today }}</strong> kuni kelishi kerak!  
        Iltimos, unga telefon qiling: <strong>{{ nextBooking.phone }}</strong>
      </div>

      <div v-if="currentBooking" class="info-block current-guest">
        <h3 class="section-title">Hozirgi mehmon</h3>
        <p><strong>Ismi:</strong> {{ currentBooking.name }}</p>
        <p><strong>Telefon:</strong> {{ currentBooking.phone }}</p>
        <p><strong>Kelgan sana:</strong> {{ currentBooking.arrival }}</p>
        <p><strong>Ketadigan sana:</strong> {{ currentBooking.departure }}</p>
      </div>

      <div v-if="nextBooking" class="info-block next-guest">
        <h3 class="section-title">Navbatdagi mehmon</h3>
        <p><strong>Ismi:</strong> {{ nextBooking.name }}</p>
        <p><strong>Telefon:</strong> {{ nextBooking.phone }}</p>
        <p><strong>Kelish sanasi:</strong> {{ nextBooking.arrival }}</p>
        <p><strong>Ketish sanasi:</strong> {{ nextBooking.departure }}</p>
      </div>

      <div class="info-block">
        <h3 class="section-title">Xona tafsilotlari</h3>
        <p><strong>Raqami:</strong> {{ room.number }}</p>
        <p><strong>Turi:</strong> {{ room.type }}</p>
        <p><strong>Narxi:</strong> {{ formatPrice(room.price) }}</p>
        <p><strong>Joylashuvi:</strong> {{ room.floor }}</p>
        <p><strong>Sig‘imi:</strong> {{ room.capacity }} kishi</p>
        <p><strong>Holati:</strong>
          <span :class="['badge', isRoomFreeToday ? 'free' : 'busy']">
            {{ isRoomFreeToday ? 'Bo‘sh' : 'Band' }}
          </span>
        </p>
      </div>

      <div class="form-block">
        <h3 class="section-title">Yangi band qilish</h3>

        <form @submit.prevent="assignGuest" novalidate>
          <input
            v-model.trim="guest.name"
            type="text"
            placeholder="Ism Familiya"
            :class="{ invalid: errors.name }"
            required
          />
          <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>

          <input
            v-model.trim="guest.phone"
            type="tel"
            placeholder="Telefon raqam (+998901234567)"
            pattern="^\\+998\\d{9}$"
            :class="{ invalid: errors.phone }"
            required
          />
          <span v-if="errors.phone" class="error-msg">{{ errors.phone }}</span>

          <label for="arrival">Kelish sanasi:</label>
          <input
            v-model="guest.arrival"
            type="date"
            id="arrival"
            :min="today"
            :class="{ invalid: errors.arrival }"
            required
          />
          <span v-if="errors.arrival" class="error-msg">{{ errors.arrival }}</span>

          <label for="departure">Ketish sanasi:</label>
          <input
            v-model="guest.departure"
            type="date"
            id="departure"
            :min="guest.arrival || today"
            :class="{ invalid: errors.departure }"
            required
          />
          <span v-if="errors.departure" class="error-msg">{{ errors.departure }}</span>

          <button type="submit">Band qilish</button>

          <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
        </form>
      </div>
    </div>

    <router-link to="/" class="back-link">Orqaga qaytish</router-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      room: null,
      guest: { name: '', phone: '', arrival: '', departure: '' },
      errors: {},
      formError: '',
      successMessage: ''
    };
  },
  computed: {
    today() {
      return new Date().toISOString().split('T')[0];
    },
    currentBooking() {
      return this.room?.bookings.find(b => b.arrival <= this.today && b.departure >= this.today) || null;
    },
    nextBooking() {
      return this.room?.bookings.filter(b => b.arrival > this.today).sort((a, b) => new Date(a.arrival) - new Date(b.arrival))[0] || null;
    },
    isRoomFreeToday() {
      return !this.room?.bookings.some(b => b.arrival <= this.today && b.departure >= this.today);
    },
    showArrivalTodayAlert() {
      return this.nextBooking?.arrival === this.today;
    }
  },
  created() {
    
    const roomId = this.$route.params.id;
    this.room = allRooms.find(r => r.id == roomId);
  },
  methods: {
    assignGuest() {
      this.clearMessages();
      if (!this.validateForm()) return;
      const overlap = this.room.bookings.some(b => this.dateOverlap(this.guest.arrival, this.guest.departure, b.arrival, b.departure));
      if (overlap) {
        this.formError = 'Ushbu sana oralig‘ida xona allaqachon band qilingan.';
        return;
      }
      const phoneRegex = /^\+998\d{9}$/;
      if (!phoneRegex.test(this.guest.phone)) {
        this.errors.phone = 'Telefon raqam +998XXXXXXXXX formatida bo‘lishi kerak.';
        return;
      }
      this.room.bookings.push({ ...this.guest });
      this.successMessage = 'Xona muvaffaqiyatli band qilindi!';
      this.resetGuestForm();
    },
    validateForm() {
      this.errors = {};
      if (!this.guest.name) this.errors.name = "Ism Familiya kiritilishi shart.";
      if (!this.guest.phone) this.errors.phone = "Telefon raqam kiritilishi shart.";
      if (!this.guest.arrival) this.errors.arrival = "Kelish sanasi kiritilishi shart.";
      if (this.guest.arrival && this.guest.departure && this.guest.arrival > this.guest.departure) {
        this.errors.departure = "Ketish sanasi kelish sanasidan oldin bo‘lishi mumkin emas.";
      }
      return Object.keys(this.errors).length === 0;
    },
    clearMessages() {
      this.formError = '';
      this.successMessage = '';
      this.errors = {};
    },
    resetGuestForm() {
      this.guest = { name: '', phone: '', arrival: '', departure: '' };
    },
    dateOverlap(start1, end1, start2, end2) {
      return !(end1 < start2 || start1 > end2);
    },
    formatPrice(val) {
      return val.toLocaleString('uz-UZ') + ' soʻm';
    }
  }
};
</script>

<style scoped>
/* Asosiy konteyner */
.room-details {
  max-width: 1200px;
  margin: 20px auto;
  padding:20px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
}

/* Sarlavha */
.title {
  text-align: center;
  font-size: 2.8rem;
  font-weight: 900;
  color: #1A6291;
  margin-bottom: 40px;
  letter-spacing: 1.3px;
  user-select: none;
}

/* Ogohlantirish paneli */
.notification.alert-booking {
  background-color: #fff4e5;
  border: 2px solid #ff9800;
  color: #bf5700;
  font-weight: 700;
  border-radius: 16px;
  padding: 20px 28px;
  margin-bottom: 36px;
  text-align: center;
  box-shadow: 0 6px 16px rgba(255, 152, 0, 0.3);
  font-size: 1.15rem;
  user-select: none;
}

/* Flex konteyner, ustunli joylashuv */
.info-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-between;
}

/* Har bir info blok */
.info-block {
  background: #f9faff;
  border-radius: 18px;
  padding: 24px 28px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  flex: 1 1 280px;
  min-width: 280px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.info-block:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 36px rgba(0, 119, 204, 0.2);
}

/* Bo‘lim sarlavhalari */
.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: #1A6291;
  border-bottom: 3px solid #1A6291;
  padding-bottom: 8px;
  user-select: none;
}

/* Paragraf matni */
p {
  font-size: 1.05rem;
  color: #333;
  margin-bottom: 14px;
  line-height: 1.6;
  user-select: text;
  word-break: break-word;
   display: flex;
  align-items: center;
  gap: 10px;
}

/* Status belgilari */
.badge {
  display: inline-block;
  padding: 10px 26px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 1rem;
  color: white;
  min-width: 90px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  user-select: none;
  transition: background-color 0.3s ease;
}

.free {
  background: linear-gradient(135deg, #28a745, #56d68a);
  box-shadow: 0 6px 20px #28a745aa;
}

.busy {
  background: linear-gradient(135deg, #dc3545, #f16a6a);
  box-shadow: 0 6px 20px #dc3545aa;
}

/* --- Yangi band qilish formasi --- */
.form-block {
  background: #e9f0fb;
  border-radius: 20px;
  padding: 30px 36px;
  flex: 1 1 100%;
  max-width: 100%;
  user-select: none;
  box-shadow: 0 10px 28px rgba(0, 119, 204, 0.1);
}

.form-block form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.form-block label {
  font-weight: 600;
  color: #005a9e;
  font-size: 1.05rem;
  margin-bottom: 6px;
  user-select: none;
}

.form-block input[type="text"],
.form-block input[type="tel"],
.form-block input[type="date"] {
  width: 100%;
  padding: 16px 22px;
  font-size: 1rem;
  border: 2.5px solid #a7c0f2;
  border-radius: 16px;
  background-color: #fff;
  color: #222;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.form-block input[type="text"]:focus,
.form-block input[type="tel"]:focus,
.form-block input[type="date"]:focus {
  border-color: #1A6291;
  box-shadow: 0 0 14px #005a9e88;
  outline: none;
}

.invalid {
  border-color: #e03e3e !important;
  box-shadow: 0 0 14px #e03e3eaa !important;
}

.error-msg {
  color: #e03e3e;
  font-size: 0.9rem;
  margin-top: -10px;
  margin-bottom: 12px;
  font-weight: 700;
  user-select: none;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.02em;
}

.success-msg {
  color: #28a745;
  font-size: 1.2rem;
  font-weight: 900;
  margin-top: 20px;
  margin-bottom: 12px;
  text-align: center;
  user-select: none;
  letter-spacing: 0.04em;
  font-family: 'Montserrat', sans-serif;
  text-shadow: 0 0 6px #28a745cc;
}

/* Submit tugma */
form button {
  padding: 18px 0;
  font-weight: 900;
  font-size: 1.25rem;
  background: linear-gradient(135deg, #1A6291, #1A6291);
  color: #fff;
  border: none;
  border-radius: 28px;
  cursor: pointer;
  user-select: none;
  transition: background 0.4s ease, transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 8px 28px rgba(0, 119, 204, 0.6);
  font-family: 'Montserrat', sans-serif;
}

form button:hover {
  background: linear-gradient(135deg, #0077cc, #005a9e);
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(0, 119, 204, 0.9);
}

form button:active {
  transform: translateY(0);
  box-shadow: 0 8px 28px rgba(0, 119, 204, 0.6);
}

/* Orqaga tugma */
.back-link {
  display: inline-block;
  margin-top: 50px;
  color: #1A6291;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.1rem;
  text-align: center;
  width: 100%;
  user-select: none;
  transition: color 0.3s ease;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.04em;
}

.back-link:hover {
  color: #1A6291;
  text-decoration: underline;
}

/* RESPONSIVE */
@media (max-width: 860px) {
  .info-wrapper {
    flex-direction: column;
    gap: 30px;
  }

  .info-block {
    max-width: 100%;
  }

  .form-block form {
    max-width: 100%;
    padding: 0 10px;
  }
}

@media (max-width: 480px) {
  .room-details {
    padding: 24px 20px;
    margin: 20px 12px;
  }

  .title {
    font-size: 2.2rem;
    margin-bottom: 32px;
  }

  form button {
    font-size: 1.1rem;
    padding: 14px 0;
  }
}


</style>
