<template>
  <v-card>
    <v-card-title>Send Certificates</v-card-title>
    <v-card-text>
      <v-file-input
        v-model="csvFile"
        accept=".csv"
        label="Upload CSV with names and emails"
      ></v-file-input>

      <v-table v-if="recipients.length">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(recipient, index) in recipients" :key="index">
            <td>{{ recipient.name }}</td>
            <td>{{ recipient.email }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        :loading="sending"
        :disabled="!recipients.length"
        @click="sendCertificates"
      >
        Send Certificates
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  certificateConfig: {
    type: Object,
    required: true
  }
})

const csvFile = ref(null)
const recipients = ref([])
const sending = ref(false)

const sendCertificates = async () => {
  sending.value = true
  try {
    // Here you would implement the API call to send certificates
    console.log('Sending certificates with config:', props.certificateConfig)
    console.log('Recipients:', recipients.value)
  } catch (error) {
    console.error('Error sending certificates:', error)
  } finally {
    sending.value = false
  }
}
</script> 