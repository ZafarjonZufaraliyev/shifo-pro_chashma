<template>
  <div class="xodimlar-container">
    <div class="header">
      <h2>🧑‍💼 Xodimlar roʻyxati</h2>
      <button class="add-btn" @click="openModal()">➕ Yangi xodim qoʻshish</button>
    </div>

    <!-- Yuklanmoqda -->
    <div v-if="loading">⏳ Yuklanmoqda...</div>

    <!-- Xodimlar jadvali -->
    <table v-else class="xodim-table">
      <thead>
        <tr>
          <th>F.I.Sh</th>
          <th>Telefon</th>
          <th>Email</th>
          <th>Rol</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="xodim in xodimlar" :key="xodim.id" @click="openModal(xodim)" style="cursor:pointer">
          <td>{{ xodim.name }}</td>
          <td>{{ xodim.phone }}</td>
          <td>{{ xodim.email }}</td>
          <td>{{ getRoleName(xodim.section_id) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ isEditing ? 'Xodimni tahrirlash' : 'Yangi xodim qoʻshish' }}</h3>
        <form @submit.prevent="saveXodim">
          <div class="row">
            <label class="half">
              Ism:
              <input v-model="form.ism" type="text" required />
            </label>
            <label class="half">
              Familiya:
              <input v-model="form.familiya" type="text" required />
            </label>
          </div>

          <label>
            Telefon:
            <input v-model="form.telefon" type="tel" placeholder="+998..." required />
          </label>

          <label>
            Email:
            <input v-model="form.email" type="email" required />
          </label>

          <label>
            Login:
            <input v-model="form.login" type="text" required />
          </label>

          <label>
            Rol:
            <select v-model="form.role" required>
              <option disabled value="">-- Rolni tanlang --</option>
              <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
            </select>
          </label>

          <div class="row">
            <label class="half">
              Parol:
              <input v-model="form.parol" type="password" :required="!isEditing" />
            </label>
            <label class="half">
              Parolni tasdiqlash:
              <input v-model="form.parol2" type="password" :required="!isEditing" />
            </label>
          </div>

          <div class="actions">
            <button type="submit">{{ isEditing ? 'Saqlash' : 'Qoʻshish' }}</button>
            <button type="button" @click="closeModal">Bekor qilish</button>
          </div>

          <p v-if="formError" class="error">{{ formError }}</p>
          <p v-if="successMsg" class="success">{{ successMsg }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      loading: false,
      showModal: false,
      isEditing: false,
      xodimlar: [],
      roles: [],
      formError: null,
      successMsg: null,
      form: {
        id: null,
        ism: '',
        familiya: '',
        telefon: '',
        email: '',
        login: '',
        parol: '',
        parol2: '',
        role: '',  // endi string bo'ladi
      },
    };
  },
  mounted() {
    this.loadXodimlar();
    this.loadRoles();
  },
  methods: {
    async loadXodimlar() {
      this.loading = true;
      try {
        const res = await api.get('/api/v1/users');
        this.xodimlar = res.data;
      } catch (e) {
        this.formError = "Xodimlar yuklanmadi";
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async loadRoles() {
      try {
        const res = await api.get('/api/v1/roles');
        // Agar API oddiy string[] qaytarsa shunday saqlaymiz
        if (Array.isArray(res.data) && typeof res.data[0] === 'string') {
          this.roles = res.data;
        } else {
          // Agar obyektlar bo'lsa to'g'ridan to'g'ri saqlaymiz
          this.roles = res.data.map(r => r.name || r); 
        }
      } catch (e) {
        this.formError = "Rol ro'yxati yuklanmadi";
        console.error(e);
      }
    },
    getRoleName(roleKey) {
      // roleKey bu string, oddiy stringlar orasidan topamiz
      return this.roles.includes(roleKey) ? roleKey : 'Nomaʼlum';
    },
    openModal(xodim = null) {
      this.formError = null;
      this.successMsg = null;
      this.isEditing = !!xodim;

      if (xodim) {
        const [ism, ...fam] = xodim.name.split(' ');
        this.form = {
          id: xodim.id,
          ism,
          familiya: fam.join(' '),
          telefon: xodim.phone,
          email: xodim.email,
          login: xodim.username,
          parol: '',
          parol2: '',
          role: xodim.role, // string kutilmoqda
        };
      } else {
        this.resetForm();
      }
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.resetForm();
      this.formError = null;
      this.successMsg = null;
      this.isEditing = false;
    },
    resetForm() {
      this.form = {
        id: null,
        ism: '',
        familiya: '',
        telefon: '',
        email: '',
        login: '',
        parol: '',
        parol2: '',
        role: '',
      };
    },
    async saveXodim() {
      this.formError = null;
      this.successMsg = null;
      const f = this.form;

      if (!f.ism || !f.familiya || !f.telefon || !f.email || !f.login || !f.role) {
        this.formError = 'Iltimos, barcha maydonlarni toʻldiring!';
        return;
      }
      if (f.parol !== f.parol2) {
        this.formError = 'Parollar mos emas!';
        return;
      }

      const payload = {
        name: `${f.ism} ${f.familiya}`,
        phone: f.telefon,
        email: f.email,
        username: f.login,
        role: f.role,  // string, masalan "admin"
        // Password faqat yangi qo'shilganda yoki o'zgartirilganda jo'natiladi
        ...(f.parol ? { password: f.parol, password_confirmation: f.parol2 } : {}),
      };

      try {
        if (this.isEditing) {
          await api.put(`/api/v1/users/${f.id}`, payload);
          this.successMsg = "Xodim muvaffaqiyatli yangilandi";
        } else {
          await api.post('/api/v1/users', payload);
          this.successMsg = "Yangi xodim muvaffaqiyatli qoʻshildi";
        }
        await this.loadXodimlar();
        this.closeModal();
      } catch (err) {
        this.formError = err.response?.data?.message || 'Saqlashda xatolik yuz berdi';
        console.error(err.response?.data || err);
      }
    },
  },
};
</script>

<style scoped>
.xodimlar-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.add-btn {
  padding: 8px 14px;
  font-size: 16px;
  background-color: #2d8cf0;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.add-btn:hover {
  background-color: #1a6ed8;
}
.xodim-table {
  width: 100%;
  border-collapse: collapse;
}
.xodim-table th,
.xodim-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
.xodim-table tr:hover {
  background-color: #f3f7fb;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: white;
  padding: 20px;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 3px 7px rgba(0,0,0,0.2);
}
.row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.half {
  flex: 1;
}
label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
}
input,
select {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
button[type="submit"] {
  background-color: #28a745;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
button[type="submit"]:hover {
  background-color: #218838;
}
button[type="button"] {
  background-color: #dc3545;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
button[type="button"]:hover {
  background-color: #c82333;
}
.error {
  color: red;
  margin-top: 12px;
}
.success {
  color: green;
  margin-top: 12px;
}
</style>
