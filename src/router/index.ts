import { createRouter, createWebHistory } from 'vue-router'
import CertificateEditor from '../views/CertificateEditor.vue'
import CertificateSender from '../views/CertificateSender.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/editor'
    },
    {
      path: '/editor',
      component: CertificateEditor
    },
    {
      path: '/sender',
      component: CertificateSender
    }
  ]
})

export default router 