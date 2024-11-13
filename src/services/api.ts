import axios, { AxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: 'https://copaiba-certificado-api.azurewebsites.net/',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Adiciona um interceptor para logging
api.interceptors.request.use((config: AxiosRequestConfig) => {
  console.log('Request URL:', config.baseURL + config.url)
  return config
})

export default api 