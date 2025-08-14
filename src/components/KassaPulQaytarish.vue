<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modalTitle"
    tabindex="0"
  >
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <!-- Yopish tugmasi -->
      <button
        @click="close"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        aria-label="Modalni yopish"
      >
        &times;
      </button>

      <h2 id="modalTitle" class="text-xl font-semibold mb-4">Pulni qaytarish</h2>

      <div aria-live="polite" class="mb-4 text-gray-700">
        <p><strong>To‘lov ID:</strong> {{ payment?.id || '-' }}</p>
        <p><strong>Sana:</strong> {{ formatDate(payment?.datetime) }}</p>
        <p>
          <strong>To‘lov turi:</strong>
          {{ payment?.type === 'kirim' ? 'Kirim' : payment?.type === 'chiqim' ? 'Chiqim' : '-' }}
        </p>
        <p><strong>Jami summa:</strong> {{ formatAmount(totalPaymentAmount) }} so‘m</p>
      </div>

      <form @submit.prevent="submitRefund" novalidate>
        <div class="mb-4">
          <label for="refundAmount" class="block font-medium mb-1"
            >Qaytariladigan summa (so‘m):</label
          >
          <input
            id="refundAmount"
            type="number"
            v-model.number="refundAmount"
            :max="totalPaymentAmount"
            min="1"
            required
            :placeholder="`Maksimum: ${totalPaymentAmount.toLocaleString()}`"
            aria-describedby="refundAmountHelp"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
          <p id="refundAmountHelp" class="text-sm text-gray-500 mt-1">
            1 dan {{ totalPaymentAmount.toLocaleString() }} gacha summa kiriting.
          </p>
        </div>

        <div class="mb-4">
          <label for="note" class="block font-medium mb-1">Izoh (ixtiyoriy):</label>
          <textarea
            id="note"
            v-model="note"
            rows="3"
            placeholder="Qo‘shimcha ma’lumot"
            class="w-full border border-gray-300 rounded px-3 py-2 resize-none"
          ></textarea>
        </div>

        <div aria-live="assertive" class="mb-4">
          <p v-if="error" role="alert" class="text-red-600 font-semibold">{{ error }}</p>
          <p v-if="success" role="alert" class="text-green-600 font-semibold">
            Pul muvaffaqiyatli qaytarildi!
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 border rounded border-gray-300 hover:bg-gray-100"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {{ loading ? 'Jarayon...' : 'Qaytarish' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/api' // Api axios instance (yozilgan fayl)

export default {
  name: 'PulQaytarishModali',
  props: {
    payment: {
      type: Object,
      default: null,
      required: false,
    },
  },
  data() {
    return {
      isOpen: false,
      refundAmount: null,
      note: '',
      loading: false,
      error: null,
      success: false,
    }
  },
  computed: {
    totalPaymentAmount() {
      if (!this.payment) return 0
      return (
        (this.payment.cash || 0) +
        (this.payment.card || 0) +
        (this.payment.click || 0) +
        (this.payment.humo || 0)
      )
    },
  },
  methods: {
    open() {
      this.isOpen = true
      this.refundAmount = null
      this.note = ''
      this.error = null
      this.success = false
      this.$nextTick(() => {
        const input = this.$el.querySelector('#refundAmount')
        if (input) input.focus()
      })
    },
    close() {
      this.isOpen = false
      this.error = null
      this.success = false
      this.refundAmount = null
      this.note = ''
    },
    formatDate(datetime) {
      if (!datetime) return '-'
      const date = new Date(datetime)
      return date.toLocaleString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    formatAmount(amount) {
      if (!amount || amount <= 0) return '-'
      return amount.toLocaleString('uz-UZ')
    },
    async submitRefund() {
      if (
        !this.refundAmount ||
        this.refundAmount < 1 ||
        this.refundAmount > this.totalPaymentAmount
      ) {
        this.error = `Iltimos, 1 dan ${this.totalPaymentAmount.toLocaleString()} gacha summa kiriting.`
        this.success = false
        return
      }

      this.loading = true
      this.error = null
      this.success = false

      try {
        const payload = {
          payment_id: this.payment.id,
          amount: this.refundAmount,
          note: this.note,
          datetime: new Date().toISOString(),
          cashier: localStorage.getItem('username') || 'NoName',
        }
        await api.post('/api/v1/refunds', payload)
        this.success = true
        this.$emit('success')
        setTimeout(() => this.close(), 1500)
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          "Xatolik yuz berdi, iltimos qayta urinib ko‘ring."
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
/* Minimal va chiroyli CSS */

.fixed {
  position: fixed;
}
.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.bg-black {
  background-color: rgba(0, 0, 0, 0.6);
}
.bg-opacity-40 {
  background-color: rgba(0, 0, 0, 0.4);
}
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.z-50 {
  z-index: 50;
}
.bg-white {
  background-color: #fff;
}
.rounded-lg {
  border-radius: 0.5rem;
}
.shadow-lg {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}
.w-full {
  width: 100%;
}
.max-w-md {
  max-width: 28rem;
}
.p-6 {
  padding: 1.5rem;
}
.relative {
  position: relative;
}
.absolute {
  position: absolute;
}
.top-3 {
  top: 0.75rem;
}
.right-3 {
  right: 0.75rem;
}
.text-gray-500 {
  color: #6b7280;
}
.hover\:text-gray-700:hover {
  color: #374151;
}
.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}
.font-bold {
  font-weight: 700;
}
.font-semibold {
  font-weight: 600;
}
.mb-4 {
  margin-bottom: 1rem;
}
.mb-1 {
  margin-bottom: 0.25rem;
}
.text-gray-700 {
  color: #374151;
}
.text-red-600 {
  color: #dc2626;
}
.text-green-600 {
  color: #16a34a;
}
.font-medium {
  font-weight: 500;
}
.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.border {
  border-width: 1px;
  border-style: solid;
  border-color: #d1d5db;
}
.rounded {
  border-radius: 0.375rem;
}
.resize-none {
  resize: none;
}
.w-full {
  width: 100%;
}
.text-sm {
  font-size: 0.875rem;
}
.mt-1 {
  margin-top: 0.25rem;
}
.disabled\:opacity-50:disabled {
  opacity: 0.5;
}
.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}
.bg-red-600 {
  background-color: #dc2626;
}
.hover\:bg-red-700:hover {
  background-color: #b91c1c;
}
.text-white {
  color: #fff;
}
.flex {
  display: flex;
}
.justify-end {
  justify-content: flex-end;
}
.space-x-3 > :not([hidden]) ~ :not([hidden]) {
  margin-left: 0.75rem;
}
</style>
