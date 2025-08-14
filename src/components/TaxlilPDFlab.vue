<template>
  <div class="containerrr">
    <h2>Tahlil varog‘i to‘ldirish va PDF olish</h2>

    <!-- Bemor tanlash -->
    <div class="form-group">
      <label for="clientSelect">Bemor:</label>
      <select id="clientSelect" v-model="selectedClientId" @change="onClientSelect">
        <option value="" disabled>-- Bemorni tanlang --</option>
        <option v-for="client in clients" :key="client.id" :value="client.id">
          {{ client.familiya }} {{ client.ism }} {{ client.sharif || '' }}
        </option>
      </select>
    </div>

    <!-- Tanlangan bemor ma'lumotlari -->
    <div v-if="selectedClient" class="client-info">
      <p><strong>Familiya:</strong> {{ selectedClient.familiya }}</p>
      <p><strong>Ism:</strong> {{ selectedClient.ism }}</p>
      <p><strong>Sharif:</strong> {{ selectedClient.sharif || '-' }}</p>
      <p><strong>Tug‘ilgan sana:</strong> {{ formatDate(selectedClient.tugilgan_sana) }}</p>
    </div>

    <!-- Barcha tahlil turlari -->
    <div class="test-types-list">
      <h3>Tahlil turlari</h3>
      <div
        v-for="testType in testTypes"
        :key="testType.id"
        class="test-type-item"
        @click="selectTestType(testType)"
        :class="{ active: labTestData.test_type_id === testType.id }"
      >
        <h4>{{ testType.name }} - {{ testType.price ? testType.price + ' so‘m' : 'Narx kiritilmagan' }}</h4>
        <p>{{ testType.description || '-' }}</p>
      </div>
    </div>

    <!-- Tanlangan tahlil parametrlari -->
    <div v-if="selectedTestType" class="test-parameters">
      <h3>{{ selectedTestType.name }} parametrlari</h3>
      <table>
        <thead>
          <tr>
            <th>Parametr nomi</th>
            <th>Norma oralig‘i</th>
            <th>Natija</th>
            <th>O‘chirish</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in labTestData.results" :key="result.parametr_name">
            <td>{{ result.parametr_name }}</td>
            <td>{{ result.parametr_norma }}</td>
            <td>
              <input v-model="result.parametr_value" placeholder="Natija" />
            </td>
            <td>
              <button @click="removeResult(index)">×</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Parametr qo‘shish -->
      <div class="form-group">
        <label for="paramSelect">Parametr qo‘shish:</label>
        <select v-model="selectedParamToAdd" id="paramSelect">
          <option disabled value="">-- Parametr tanlang --</option>
          <option
            v-for="param in filteredAvailableParams"
            :key="param.name"
            :value="param.name"
          >
            {{ param.name }} ({{ param.norma || '-' }})
          </option>
        </select>
        <button @click="addSelectedParam" :disabled="!selectedParamToAdd">
          Qo‘shish
        </button>
      </div>
    </div>

    <!-- Test sanasi -->
    <div class="form-group">
      <label for="testDate">Test sanasi:</label>
      <input id="testDate" v-model="labTestData.test_date" type="date" />
    </div>

    <!-- Shifokor kommentariyasi -->
    <div class="form-group">
      <label for="doctorComment">Shifokor kommentariyasi:</label>
      <textarea
        id="doctorComment"
        v-model="labTestData.doctor_comment"
        placeholder="Kommentariyani kiriting"
        rows="3"
      ></textarea>
    </div>

    <!-- Tugmalar -->
    <div class="actions">
      <button @click="saveLabTest" type="button" class="btn-save">Saqlash</button>
      <button
        @click="generatePDF"
        type="button"
        :disabled="!selectedClient || !selectedTestType || !labTestData.test_date"
        class="btn-pdf"
      >
        PDF olish
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { jsPDF } from "jspdf";
import logo from "@/assets/image/logo.png";

export default {
  name: "TaxlilVaroghi",
  data() {
    return {
      clients: [],
      testTypes: [],
      parameters: [], // 🔹 barcha parametrlar shu yerda saqlanadi
      selectedClientId: "",
      selectedClient: null,
      selectedTestType: null,
      selectedParamToAdd: "",
      labTestData: {
        client_id: null,
        test_type_id: null,
        test_date: "",
        doctor_comment: "",
        results: [],
      },
    };
  },
  created() {
    this.fetchPatients();
    this.fetchTestTypes();
    this.fetchParameters();
  },
  methods: {
    async fetchPatients() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/davolanish", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const davolanishlar = Array.isArray(res.data)
          ? res.data
          : (res.data.data || []);
        
        this.clients = davolanishlar
          .filter(item => item.status != 0 && item.client)
          .map(item => item.client);
      } catch (error) {
        console.error("❌ Bemorlar ro'yxatini olishda xatolik:", error);
      }
    },

    async fetchTestTypes() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/lab-test-types", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.testTypes = Array.isArray(res.data) ? res.data : (res.data.data || []);
      } catch (error) {
        console.error("❌ Tahlil turlarini olishda xatolik:", error);
      }
    },

    async fetchParameters() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/test-parameters", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.parameters = Array.isArray(res.data) ? res.data : (res.data.data || []);
      } catch (error) {
        console.error("❌ Parametrlarni olishda xatolik:", error);
      }
    },

    onClientSelect() {
      const id = Number(this.selectedClientId);
      this.selectedClient = this.clients.find(c => c.id === id) || null;
      this.labTestData.client_id = id;
    },

    selectTestType(testType) {
      this.selectedTestType = testType;
      this.labTestData.test_type_id = testType.id;
      this.labTestData.results = [];
      this.selectedParamToAdd = "";
    },

    addSelectedParam() {
      if (!this.selectedParamToAdd) return;
      if (this.labTestData.results.some(r => r.parametr_name === this.selectedParamToAdd)) {
        alert("Ushbu parametr allaqachon qo‘shilgan!");
        return;
      }
      const paramObj = this.filteredAvailableParams.find(
        p => p.name === this.selectedParamToAdd
      );
      if (!paramObj) return;
      this.labTestData.results.push({
        parametr_name: paramObj.name,
        parametr_value: "",
        parametr_norma: paramObj.normal_range || "", // API dagi maydon nomi
      });
      this.selectedParamToAdd = "";
    },

    removeResult(index) {
      if (this.labTestData.results.length > 0) {
        this.labTestData.results.splice(index, 1);
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      return d.toLocaleDateString("uz-UZ");
    },

    async saveLabTest() {
      if (
        !this.labTestData.client_id ||
        !this.labTestData.test_type_id ||
        !this.labTestData.test_date ||
        this.labTestData.results.length === 0
      ) {
        alert("Iltimos, barcha maydonlarni to‘ldiring!");
        return;
      }
      for (const [i, r] of this.labTestData.results.entries()) {
        if (!r.parametr_name.trim() || !r.parametr_value.trim()) {
          alert(`${i + 1}-parametr to‘liq kiritilmagan.`);
          return;
        }
      }
      try {
        const token = localStorage.getItem("token");
        const payload = {
          client_id: this.labTestData.client_id,
          test_type_id: this.labTestData.test_type_id,
          test_date: this.labTestData.test_date,
          doctor_comment: this.labTestData.doctor_comment,
          results: this.labTestData.results.map(r => ({
            parametr_name: r.parametr_name.trim(),
            parametr_value: r.parametr_value.trim(),
            parametr_norma: r.parametr_norma.trim(),
          })),
        };
        await axios.post("/api/v1/lab-test-results", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        alert("✅ Ma'lumotlar muvaffaqiyatli saqlandi!");
      } catch (error) {
        console.error("❌ Saqlashda xatolik:", error);
        alert("❌ Ma'lumotlarni saqlashda xatolik yuz berdi");
      }
    },

    generatePDF() {
      if (!this.selectedClient || !this.selectedTestType || !this.labTestData.test_date) {
        alert("Iltimos, barcha maydonlarni to‘ldiring!");
        return;
      }
      const testDateTime = new Date(this.labTestData.test_date).toLocaleDateString("uz-UZ");
      const htmlContent = `
        <div style="max-width: 800px; font-family: Arial, sans-serif;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div style="font-size: 24px; font-weight: bold; color: #004c97; display: flex; align-items: center;">
              <img src="${logo}" alt="Logo" style="height:40px; margin-right:8px;" />
              Koinot Kavsari
            </div>
            <div style="font-size: 14px; text-align: right;">
              <strong>Manzil:</strong><br />
              Farg‘ona tuman, Chimyon,<br />
              Yangi zamon ko‘chasi 1-uy<br />
              <strong>Telefon:</strong> <span style="color:green;">+998 73 240 00 03</span>, <span style="color:green;">+998 99 240 00 03</span>
            </div>
          </div>
          <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
            <tr>
              <th style="border: 1px solid #ccc; padding: 8px; background: #f0f0f0;">Bemor</th>
              <td style="border: 1px solid #ccc; padding: 8px;">${this.selectedClient.familiya} ${this.selectedClient.ism}</td>
            </tr>
            <tr>
              <th style="border: 1px solid #ccc; padding: 8px; background: #f0f0f0;">Tahlil olingan sana</th>
              <td style="border: 1px solid #ccc; padding: 8px;">${testDateTime}</td>
            </tr>
            <tr>
              <th style="border: 1px solid #ccc; padding: 8px; background: #f0f0f0;">Shifokor</th>
              <td style="border: 1px solid #ccc; padding: 8px;">Qodirov Anzabek</td>
            </tr>
          </table>
          <table style="border-collapse: collapse; width: 100%;">
            <caption style="font-weight: bold; margin-bottom: 10px;">${this.selectedTestType.name.toUpperCase()}</caption>
            <thead>
              <tr>
                <th style="border: 1px solid #ccc; padding: 8px;">Tahlil turi</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Natija</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Norma</th>
              </tr>
            </thead>
            <tbody>
              ${this.labTestData.results.map(r => `
                <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">${r.parametr_name}</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${r.parametr_value}</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${r.parametr_norma || "-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <p style="margin-top: 20px;"><strong>Shifokor kommentariyasi:</strong> ${this.labTestData.doctor_comment || "-"}</p>
        </div>
      `;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      doc.html(htmlContent, {
        callback: function (doc) {
          doc.save(`Bemor_${this.selectedClient.familiya}_tahlil_natijalari.pdf`);
        }.bind(this),
        x: 10,
        y: 10,
        html2canvas: { scale: 0.6 },
      });
    },
  },
  computed: {
    filteredAvailableParams() {
      if (!this.selectedTestType) return [];
      const addedNames = this.labTestData.results.map(r => r.parametr_name);
      // API javobidagi 'lab_test_type_id' bilan solishtirish uchun tipni moslashtiramiz
      return this.parameters
        .filter(p => String(p.lab_test_type_id) === String(this.selectedTestType.id))
        .filter(p => !addedNames.includes(p.name));
    },
  },
};
</script>


<style scoped>
.containerrr {
  width:100%;
    max-width: 1200px;
  margin: 30px auto;
  padding: 25px 30px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border-radius: 10px;
  color: #222;
}

h2 {
  text-align: center;
  font-weight: 700;
  color: #004c97;
  margin-bottom: 30px;
  user-select: none;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 7px;
  color: #333;
  user-select: none;
}

select,
input[type="date"],
textarea,
input.result-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 15px;
  border: 1.8px solid #ddd;
  border-radius: 6px;
  outline-offset: 2px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  font-family: inherit;
  box-sizing: border-box;
}

select:focus,
input[type="date"]:focus,
textarea:focus,
input.result-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 6px #1890ffaa;
}

.client-info p {
  font-size: 15px;
  margin: 5px 0;
  user-select: text;
}

.test-types-list {
  margin: 25px 0;
}

.test-type-item {
  padding: 15px 20px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 14px;
  background: #f9fbfd;
  transition: background-color 0.25s ease, border-color 0.25s ease;
  user-select: none;
}

.test-type-item:hover {
  background: #e6f0ff;
  border-color: #1890ff;
}

.test-type-item.active {
  border-color: #004c97;
  background: #d7e6ff;
  font-weight: 600;
  color: #004c97;
}

.test-type-item h4 {
  margin: 0 0 6px 0;
  font-size: 18px;
}

.test-type-item p {
  margin: 0;
  font-size: 14px;
  color: #555;
}

.test-parameters {
  margin-top: 25px;
  overflow-x: auto;
}

.test-parameters h3 {
  margin-bottom: 15px;
  color: #004c97;
  font-weight: 600;
  user-select: none;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  user-select: none;
}

thead tr {
  background-color: #f0f4ff;
}

th,
td {
  padding: 12px 14px;
  border: 1px solid #ccc;
  text-align: left;
  vertical-align: middle;
}

tbody tr:nth-child(even) {
  background-color: #fafafa;
}

input.result-input {
  padding: 6px 10px;
  font-size: 15px;
  border: 1.5px solid #bbb;
  border-radius: 4px;
  transition: border-color 0.3s ease;
}

input.result-input:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 5px #1890ffaa;
}

button {
  cursor: pointer;
  border: none;
  border-radius: 5px;
  padding: 8px 14px;
  font-size: 15px;
  font-weight: 600;
  transition: background-color 0.3s ease;
  user-select: none;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  filter: brightness(0.9);
}

.test-parameters button {
  background-color: #ff4d4f;
  color: white;
  font-size: 20px;
  line-height: 1;
  padding: 0 10px;
}

.test-parameters button:hover {
  background-color: #d9363e;
}

.form-group > button {
  background-color: #1890ff;
  color: white;
  margin-left: 10px;
  min-width: 100px;
  user-select: none;
}

.form-group > button:disabled {
  background-color: #a0c4ff;
}

.actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  user-select: none;
}

.btn-save {
  background-color: #1890ff;
  color: white;
  min-width: 130px;
  font-weight: 700;
  border-radius: 8px;
  box-shadow: 0 6px 12px rgb(24 144 255 / 0.4);
}

.btn-save:hover {
  background-color: #1070d3;
  box-shadow: 0 8px 16px rgb(16 112 211 / 0.5);
}

.btn-pdf {
  background-color: #52c41a;
  color: white;
  min-width: 130px;
  font-weight: 700;
  border-radius: 8px;
  box-shadow: 0 6px 12px rgb(82 196 26 / 0.4);
}

.btn-pdf:disabled {
  background-color: #a0d911;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-pdf:hover:not(:disabled) {
  background-color: #389e0d;
  box-shadow: 0 8px 16px rgb(56 158 13 / 0.6);
}

/* Responsive kichik ekranlar uchun */
@media (max-width: 640px) {
  .containerrr {
    padding: 20px 15px;
  }

  .test-type-item h4 {
    font-size: 16px;
  }

  table, thead, tbody, th, td, tr {
    font-size: 13px;
  }

  .actions {
    flex-direction: column;
    gap: 15px;
  }

  .form-group > button {
    margin-left: 0;
    width: 100%;
  }
}
</style>
