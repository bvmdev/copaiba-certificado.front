import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig(({ command, mode }) => {
  // Carrega as variáveis de ambiente baseado no mode
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue(), vuetify()],
    define: {
      'process.env': env
    }
  }
}) 