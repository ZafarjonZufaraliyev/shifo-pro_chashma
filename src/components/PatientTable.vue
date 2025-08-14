<template>
  <table class="patients-table">
    <thead>
      <tr>
        <th>Ism Familiya</th>
        <th>Telefon</th>
        <th>Keldi</th>
        <th>Ketdi</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="patient in patients" :key="patient.id">
        <td data-label="Ism Familiya">{{ patient.familiya }} {{ patient.ism }}</td>
        <td data-label="Telefon">{{ patient.tel1 }}</td>
        <td data-label="Keldi">{{ formatDate(patient.arrivalDate) }}</td>
        <td data-label="Ketdi">{{ formatDate(patient.departureDate) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import "@/assets/css/PatientTable.css"
export default {
  name: "PatientTable",
  props: {
    patients: {
      type: Array,
      required: true,
    },
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '—';
      const date = new Date(dateStr);
      return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
};
</script>

<style scoped>

</style>
