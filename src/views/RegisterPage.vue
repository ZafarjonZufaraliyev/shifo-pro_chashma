<template>
  <div class="register-container">
    <h2>Ro'yxatdan O'tkazish</h2>
    <form @submit.prevent="registerClient" class="form">
      <!-- Familiya, Ism -->
      <div class="form-group">
        <label>Familiya, Ism</label>
        <div class="ismfamilya">
          <input v-model="form.familiya" type="text" placeholder="Familiya" required />
          <input v-model="form.ism" type="text" placeholder="Ism" required />
        </div>
      </div>
      <div class="form-group">
        <label>Fuqaroligi</label>
        <select v-model="form.davlat" required>
          <option disabled value="">Tanlang</option>
          <option value="O‘zbekiston">O‘zbekiston</option>
          <option value="Xorijiy">Xorijiy</option>
        </select>
      </div>
      <div class="form-group">
          <label>Tug‘ilgan sana</label>
          <input v-model="form.tugulgan_sana" type="date" required />
        </div>

      <!-- Jins -->
      <div class="form-group">
        <label>Jins</label>
        <select v-model="form.jinsi" required>
          <option disabled value="">Tanlang</option>
          <option value="Erkak">Erkak</option>
          <option value="Ayol">Ayol</option>
        </select>
      </div>

      <!-- Fuqarolik -->
      

    

      <!-- Viloyat -->
      <div v-if="form.davlat === 'O‘zbekiston'" class="form-group">
        <label>Viloyat</label>
        <select v-model="form.viloyat" required>
          <option disabled value="">Tanlang</option>
          <option v-for="(viloyat, index) in viloyatlar" :key="index" :value="viloyat">
            {{ viloyat }}
          </option>
        </select>
      </div>
      <div v-else-if="form.davlat === 'Xorijiy'" class="form-group">
        <label>Viloyat (yozma)</label>
        <input v-model="form.viloyat" type="text" placeholder="Viloyatni kiriting" required />
      </div>
  <!-- Pasport va Tug‘ilgan sana -->
     <input 
  v-model="form.pasport" 
  type="text" 
  placeholder="AA1234567" 
  pattern="[A-ZА-ЯЁ]{2}[0-9]{7}"
  title="Ikki harf va yetti raqam kiriting, harflar lotin yoki kiril bo‘lishi mumkin"
  required
  @input="form.pasport = form.pasport.toUpperCase()" 
/>

      <!-- Telefon raqamlari -->
      <div class="form-group">
        <label>Telefon raqamlari</label>
        <div class="ismfamilya">
          <input v-model="form.tel1" type="tel" placeholder="Asosiy: +998901234567" required />
          <input v-model="form.tel2" type="tel" placeholder="Qo‘shimcha: +998901234568" />
        </div>
      </div>
      <div class="form-group">
        <label>Uy manzili</label>
        <input v-model="form.manzil" type="text" placeholder="To‘liq manzilingizni kiriting" required />
      </div>
      <!-- Biz haqimizda qayerdan eshitdingiz? -->
      <div class="form-group">
        <label>Biz haqimizda qayerdan eshitdingiz?</label>
        <div class="referral-dropdown">
          <button type="button" @click="toggleReferralList" class="dropdown-btn">
            {{ form.referral || 'Tanlang' }}
            <span :class="{ 'arrow-up': referralListOpen, 'arrow-down': !referralListOpen }"></span>
          </button>

          <div v-if="referralListOpen" class="referral-list">
            <ul>
              <li v-for="(item, index) in referrals" :key="index"
                :class="{ 'default-referral': isDefaultReferral(item), 'custom-referral': !isDefaultReferral(item) }">
                <span @click="selectReferral(item)" class="referral-text">{{ item }}</span>
                <button type="button" @click.stop="removeReferral(index)" :disabled="isDefaultReferral(item)"
                  class="remove-btn">×</button>
              </li>
            </ul>
            <div class="add-referral">
              <input v-model="newReferral" type="text" placeholder="Yangi variant..." @keyup.enter="addReferral" />
              <button type="button" @click="addReferral">Qo‘shish</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Parhez -->
      <div class="form-group">
        <label>Parhez (ixtiyoriy)</label>
        <select v-model="form.parhez">
          <option disabled value="">Tanlang</option>
          <option value="Diabetik">Diabetik</option>
          <option value="Allergik">Allergik</option>
          <option value="Davleniya">Davleniya</option>
        </select>
      </div>

      <!-- Submit -->
      <button type="submit">Yuborish</button>
    </form>
    <div v-if="loading" class="overlay">
    <div class="spinner"></div>
    <p>Iltimos, kuting...</p>
  </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'RegisterPage',
  data() {
    return {
      loading: false,
      viloyatlar: [
        'Toshkent viloyat', 'Toshkent shaxar', 'Andijon', 'Farg‘ona', 'Namangan',
        'Samarqand', 'Buxoro', 'Xorazm', 'Qashqadaryo',
        'Surxondaryo', 'Jizzax', 'Sirdaryo', 'Navoiy',
        'Qoraqalpog‘iston Respublikasi'
      ],
      defaultReferrals: [
        "Do‘stdan", "Reklama", "Ijtimoiy tarmoq",
        "Vrach tavsiyasi", "Boshqa"
      ],
      referrals: [],
      referralListOpen: false,
      newReferral: '',
      form: {
        familiya: '',
        ism: '',
        jinsi: '',
        davlat: '',
        pasport: '',
        tugulgan_sana: '',
        viloyat: '',
        tel1: '',
        tel2: '',
        referral: '',
        parhez: '',
        manzil: '',
        create_user_id: null,
        create_user_name: '',
      },
    };
  },

  watch: {
    referrals: {
      handler(newVal) {
        localStorage.setItem('referrals', JSON.stringify(newVal));
      },
      deep: true,
    },
    'form.referral'(newVal) {
      localStorage.setItem('referral', newVal);
    },
  },

  mounted() {
    const role = (localStorage.getItem('role') || '').trim();
    const allowedRoles = ['admin', 'kassa'];
    if (!allowedRoles.includes(role)) {
      alert("Sizda bu sahifaga kirish huquqi yo'q!");
      this.$router.push({ name: 'LoginPage' });
      return;
    }

    this.fetchCurrentUser();

    const storedReferrals = localStorage.getItem('referrals');
    if (storedReferrals) {
      try {
        const parsed = JSON.parse(storedReferrals);
        this.referrals = [...new Set([...this.defaultReferrals, ...parsed])];
      } catch {
        this.referrals = [...this.defaultReferrals];
      }
    } else {
      this.referrals = [...this.defaultReferrals];
    }

    const storedSelectedReferral = localStorage.getItem('referral');
    if (storedSelectedReferral && this.referrals.includes(storedSelectedReferral)) {
      this.form.referral = storedSelectedReferral;
    }
  },

  methods: {
    fetchCurrentUser() {
      api.get('/api/v1/user_data')
        .then(res => {
          const user = res.data?.user || res.data;
          if (user?.id && user?.name) {
            this.form.create_user_id = user.id;
            this.form.create_user_name = user.name;
          }
        })
        .catch(err => {
          console.error('Foydalanuvchini olishda xatolik:', err);
        });
    },

    toggleReferralList() {
      this.referralListOpen = !this.referralListOpen;
    },

    selectReferral(item) {
      this.form.referral = item;
      this.referralListOpen = false;
    },

    addReferral() {
      const val = this.newReferral.trim();
      if (!val) return;
      if (this.referrals.includes(val)) {
        alert('Bu variant allaqachon mavjud!');
        return;
      }
      this.referrals.push(val);
      this.form.referral = val;
      this.newReferral = '';
      this.referralListOpen = true;
    },

    removeReferral(index) {
      const item = this.referrals[index];
      if (this.isDefaultReferral(item)) {
        alert('Standart variantni o‘chirib bo‘lmaydi!');
        return;
      }
      this.referrals.splice(index, 1);
      if (this.form.referral === item) {
        this.form.referral = '';
      }
    },

    isDefaultReferral(item) {
      return this.defaultReferrals.includes(item);
    },

    async registerClient() {
  if (this.loading) return; // ikki marta yuborishni oldini olish
  this.loading = true;

  try {
    console.log('Yuborilayotgan form:', this.form); // Debug uchun

    const res = await api.post('/api/v1/clients', this.form);
    const client = res.data?.data;

    if (!client?.id) {
      alert('Ro‘yxatdan o‘tishda mijoz ID topilmadi!');
      this.loading = false;
      return;
    }

    alert("✅ Mijoz muvaffaqiyatli qo‘shildi.");

    const role = (localStorage.getItem('role') || '').trim();

    if (role === 'kassa') {
      this.$router.push({ name: 'miniTakliflar', params: { clientId: client.id } });
    } else if (role === 'admin') {
      this.$router.push({ name: 'adminTakliflar', params: { clientId: client.id } });
    } else {
      this.$router.push({ name: 'ClientListPage' });
    }
  } catch (err) {
    if (err.response && err.response.status === 422) {
      const errors = err.response.data.errors;
      let msg = '❗ Xatoliklar:\n';
      for (let key in errors) {
        msg += `- ${key}: ${errors[key].join(', ')}\n`;
      }
      alert(msg);
    } else if (err.response) {
      alert(`❌ Serverdan xatolik qaytdi: ${err.response.status} ${err.response.statusText}`);
    } else {
      console.error('API xatosi:', err);
      alert('❌ Ro‘yxatdan o‘tishda nomaʼlum xatolik yuz berdi!');
    }
  } finally {
    this.loading = false;
  }
},

  },
};
</script>

<style scoped>
.register-container {
  width: 100%;
  max-width: 1200px;
  margin: 30px auto;
  padding: 25px 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  font-family: 'Segoe UI', sans-serif;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.85);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #ccc;
  border-top-color: #2980b9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.overlay p {
  font-size: 18px;
  color: #2980b9;
  font-weight: 600;
}

h2 {
  text-align: center;
  font-size: 26px;
  color: #2c3e50;
  margin-bottom: 30px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #34495e;
}

input[type="text"],
input[type="date"],
input[type="tel"],
select {
  padding: 12px 14px;
  border: 1.8px solid #bdc3c7;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #2980b9;
  box-shadow: 0 0 8px rgba(41, 128, 185, 0.3);
}

.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.ismfamilya {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

button[type="submit"] {
  padding: 14px;
  background-color: #2980b9;
  color: white;
  border: none;
  font-weight: bold;
  font-size: 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #1c5986;
}

/* Referral dropdown styles */
.referral-dropdown {
  position: relative;
  font-family: inherit;
}

.dropdown-btn {
  width: 100%;
  padding: 12px 14px;
  font-size: 16px;
  text-align: left;
  background-color: #fff;
  border: 1.8px solid #bdc3c7;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.arrow-down::after,
.arrow-up::after {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  border: solid #34495e;
  border-width: 0 2px 2px 0;
  padding: 3px;
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.arrow-down::after {
  transform: rotate(45deg);
}

.arrow-up::after {
  transform: rotate(-135deg);
}

.referral-list {
  position: absolute;
  top: 105%;
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: #fff;
  border: 1.8px solid #bdc3c7;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 20;
  padding: 12px 14px;
}

.referral-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.referral-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  margin-bottom: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.referral-list li:hover {
  background-color: #ecf0f1;
}

.referral-text {
  flex-grow: 1;
  font-weight: 500;
  color: #2c3e50;
}

.default-referral {
  color: #e74c3c;
  font-weight: 600;
}

.remove-btn {
  background-color: #e74c3c;
  color: white;
  font-weight: bold;
  border: none;
  padding: 0 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.remove-btn:hover {
  background-color: #c0392b;
}

.remove-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  color: #888;
}

.add-referral {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.add-referral input {
  flex-grow: 1;
  padding: 10px 12px;
  font-size: 15px;
  border: 1.8px solid #bdc3c7;
  border-radius: 8px;
}

.add-referral button {
  padding: 10px 16px;
  font-size: 15px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-referral button:hover {
  background-color: #1e8449;
}

@media (max-width: 768px) {

  .form-row,
  .ismfamilya {
    flex-direction: column;
  }
}
</style>
