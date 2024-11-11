import api from '../services/api'

// Em seus métodos
const getData = async () => {
  try {
    const response = await api.get('/seu-endpoint')
    // ... tratar a resposta
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
  }
} 