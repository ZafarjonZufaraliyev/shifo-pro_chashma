<template>
     <div class="inventory-page">
          <h2>🏪 Ombordagi Mahsulotlar Balansi</h2>

          <div class="search-bar">
               <input type="text" v-model="search" placeholder="🔍 Mahsulot nomi bo‘yicha qidirish..." />
          </div>

          <div v-if="loading" class="loading">⏳ Yuklanmoqda...</div>

          <table v-else>
               <thead>
                    <tr>
                         <th>#</th>
                         <th>Mahsulot nomi</th>
                         <th>Birlik</th>
                         <th>Jami miqdor</th>
                    </tr>
               </thead>
               <tbody>
                    <tr v-for="(item, index) in filteredInventory" :key="item.product_id"
                         @click="selectProduct(item.product_id)" class="clickable">
                         <td>{{ index + 1 }}</td>
                         <td>{{ item.product_name }}</td>
                         <td>{{ item.unit }}</td>
                         <td>{{ item.balance.toFixed(2) }}</td>
                    </tr>

               </tbody>
          </table>

          <!-- Tanlangan mahsulot tafsilotlari -->
          <div v-if="selectedProductDetails" class="details-card">
               <h3>📦 {{ selectedProductDetails.product?.name || '—' }} haqida maʼlumot</h3>
               <p><strong>Birlik:</strong> {{ selectedProductDetails.unit }}</p>
               <p><strong>Jami miqdor:</strong> {{ selectedProductDetails.balance.toFixed(2) }}</p>
               <p><strong>Oxirgi yangilangan:</strong> {{ selectedProductDetails.updated_at || '—' }}</p>
          </div>

     </div>
</template>

<script>
import api from '@/api'; // Axios instance with token

export default {
     name: 'InventoryPage',
     data() {
          return {
               inventory: [],
               selectedProductDetails: null,
               loading: false,
               search: '',
          };
     },
     computed: {
          filteredInventory() {
               return this.inventory.filter(item =>
                    (item.name || '').toLowerCase().includes(this.search.toLowerCase())
               );
          }
     },
     mounted() {
          this.fetchInventory();
     },
     methods: {
          async fetchInventory() {
               this.loading = true;
               try {
                    const res = await api.get('/api/v1/inventory');
                    console.log('📦 Inventar javobi:', res.data); // 
                    this.inventory = res.data || [];
               } catch (err) {
                    console.error('Inventar maʼlumotlarini olishda xatolik:', err);
                    alert('❌ Inventar maʼlumotlarini olishda xatolik yuz berdi');
               } finally {
                    this.loading = false;
               }
          },
          async selectProduct(productId) {
               try {
                    const res = await api.get(`/api/v1/inventory/${productId}`);
                    if (res.data) {
                         this.selectedProductDetails = res.data;
                    }
               } catch (err) {
                    console.error('Mahsulot tafsilotlarini olishda xatolik:', err);
                    alert('❌ Mahsulot tafsilotlarini olishda xatolik yuz berdi');
               }
          }

     }
};
</script>

<style scoped>
.inventory-page {
     max-width: 1100px;
     margin: 20px 0px 0px 270px;
     width:100%;
     padding: 20px;
     background: #f8fbff;
     border-radius: 14px;
     box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
     font-family: 'Segoe UI', sans-serif;
     color: #333;
}

h2 {
     text-align: center;
     margin-bottom: 20px;
     color: #2c3e50;
}

.search-bar {
     margin-bottom: 15px;
     text-align: right;
}

input[type="text"] {
     padding: 8px 12px;
     font-size: 15px;
     border: 1px solid #ccc;
     border-radius: 10px;
}

table {
     width: 100%;
     border-collapse: collapse;
     margin-bottom: 20px;
}

th,
td {
     padding: 10px;
     border: 1px solid #ddd;
     text-align: left;
}

th {
     background: #ecf0f1;
}

tr.clickable:hover {
     background: #f1f9ff;
     cursor: pointer;
}

.details-card {
     background: #ffffff;
     padding: 20px;
     border-radius: 12px;
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
</style>
