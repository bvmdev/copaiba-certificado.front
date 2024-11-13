<template>
  <v-container>
    <v-stepper v-model="currentStep">
      <v-stepper-header>
        <v-stepper-item
          :value="1"
          :complete="currentStep > 1"
        >
          Configurar Certificado
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item
          :value="2"
          :complete="currentStep > 2"
        >
          Revisar Destinatários
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item
          :value="3"
        >
          Processar Certificados
        </v-stepper-item>
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item :value="1">
          <v-card class="mb-4">
            <v-card-title>Upload do Modelo de Certificado</v-card-title>
            <v-card-text>
              <v-file-input
                v-model="certificateFile"
                accept="image/*"
                label="Escolha a imagem do certificado"
                @change="loadImage"
                :loading="loading"
                prepend-icon="mdi-file-image"
                show-size
              ></v-file-input>
              
              <div id="canvas-container" :class="{ 'd-none': !imageLoaded }">
                <canvas id="fabricCanvas"></canvas>
              </div>

              <v-row v-if="imageLoaded">
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="sampleText"
                    label="Digite um nome de exemplo"
                    @input="updateSampleText"
                    hint="Arraste o texto na imagem para posicionar"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-slider
                    v-model="fontSize"
                    label="Tamanho da fonte"
                    min="10"
                    max="100"
                    step="1"
                    @update:modelValue="updateText"
                    thumb-label
                    hint="Ajuste o tamanho do texto"
                    persistent-hint
                  ></v-slider>
                </v-col>
                <v-col cols="12" md="4">
                  <v-color-picker
                    v-model="textColor"
                    mode="hex"
                    hide-inputs
                    hide-canvas
                    @update:model-value="updateTextColor"
                    class="ma-2"
                    elevation="2"
                  ></v-color-picker>
                  <span class="text-caption">Cor do texto</span>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn
                color="primary"
                :disabled="!imageLoaded"
                @click="nextStep"
              >
                Próximo
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-window-item>

        <!-- Step 2: Revisão dos Destinatários -->
        <v-stepper-window-item :value="2">
          <v-card>
            <v-card-title class="d-flex align-center">
              Revisar Lista de Destinatários
              <v-spacer></v-spacer>
              <v-file-input
                v-model="csvFile"
                accept=".csv"
                label="Upload CSV"
                @change="loadCsv"
                hide-details
                class="max-width-200"
                density="compact"
              ></v-file-input>
            </v-card-title>

            <v-card-text>
              <v-data-table
                v-if="recipients.length"
                :headers="headers"
                :items="recipients"
                :items-per-page="10"
              >
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-toolbar-title>
                      Total de Destinatários: {{ recipients.length }}
                    </v-toolbar-title>
                  </v-toolbar>
                </template>
              </v-data-table>

              <v-alert
                v-else
                type="info"
                class="mt-4"
              >
                Faça upload do arquivo CSV com os destinatários
              </v-alert>
            </v-card-text>

            <v-card-actions class="justify-space-between">
              <v-btn
                color="grey"
                @click="currentStep = 1"
              >
                Voltar
              </v-btn>
              <v-btn
                color="primary"
                :disabled="!recipients.length"
                @click="nextStep"
              >
                Próximo: Processar Certificados
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-window-item>

        <!-- Step 3: Processamento -->
        <v-stepper-window-item :value="3">
          <v-card>
            <v-card-title>Processar Certificados</v-card-title>
            <v-card-text>
              <v-alert
                type="info"
                class="mb-4"
              >
                Serão gerados {{ recipients.length }} certificados com as configurações definidas.
              </v-alert>

              <v-list>
                <v-list-item>
                  <v-list-item-title>Configurações:</v-list-item-title>
                  <v-list-item-subtitle>
                    Tamanho da fonte: {{ fontSize }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    Cor do texto: {{ textColor }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-progress-linear
                v-if="processing"
                indeterminate
                color="primary"
                class="mb-4"
              ></v-progress-linear>
            </v-card-text>

            <v-card-actions class="justify-space-between">
              <v-btn
                color="grey"
                @click="currentStep = 2"
                :disabled="processing"
              >
                Voltar
              </v-btn>
              <v-btn
                color="primary"
                :loading="processing"
                :disabled="!recipients.length"
                @click="processAllCertificates"
              >
                Gerar Certificados
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- Resultado do Processamento -->
          <v-dialog v-model="showResults" max-width="800">
            <v-card>
              <v-card-title>Resultado do Processamento</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item
                    v-for="result in processingResults"
                    :key="result.email"
                    :class="result.success ? 'text-success' : 'text-error'"
                  >
                    <template v-slot:prepend>
                      <v-icon :color="result.success ? 'success' : 'error'">
                        {{ result.success ? 'mdi-check' : 'mdi-alert' }}
                      </v-icon>
                    </template>

                    <v-list-item-title>
                      {{ result.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ result.email }}
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <v-btn
                        v-if="result.success && result.imageUrl"
                        icon="mdi-download"
                        variant="text"
                        color="primary"
                        @click="downloadCertificate(result)"
                        :title="'Baixar certificado de ' + result.name"
                      ></v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  @click="finishProcess"
                >
                  Concluir
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-stepper-window-item>

      </v-stepper-window>
    </v-stepper>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { fabric } from 'fabric'

const certificateFile = ref(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const fabricCanvas = ref<fabric.Canvas | null>(null)
const imageLoaded = ref(false)
const loading = ref(false)
const fontSize = ref(40)
const sampleText = ref('Nome do Participante')
const status = ref('Aguardando upload da imagem...')
const textColor = ref('#000000')

let textObject: fabric.Text | null = null

onMounted(() => {
  // Removido initCanvas daqui
})

const initCanvas = () => {
  try {
    // Usar ID fixo ao invés de ref
    const canvasElement = document.getElementById('fabricCanvas')
    if (!canvasElement) {
      console.error('Canvas element não encontrado')
      return null
    }

    const canvas = new fabric.Canvas('fabricCanvas', {
      selection: false,
      backgroundColor: '#f0f0f0',
      width: 800,
      height: 600
    })

    console.log('Canvas inicializado com sucesso')
    return canvas
  } catch (error) {
    console.error('Erro ao inicializar canvas:', error)
    return null
  }
}

const loadImage = async () => {
  if (!certificateFile.value) {
    status.value = 'Nenhum arquivo selecionado'
    return
  }

  loading.value = true
  status.value = 'Carregando imagem...'

  try {
    const file = certificateFile.value
    const imgUrl = URL.createObjectURL(file)
    
    // Carregar a imagem primeiro
    const img = await loadImagePromise(imgUrl)

    // Garantir que o container do canvas existe
    const container = document.getElementById('canvas-container')
    if (!container) {
      throw new Error('Container do canvas não encontrado')
    }

    // Resetar o canvas
    container.innerHTML = '<canvas id="fabricCanvas"></canvas>'
    
    // Inicializar o canvas
    fabricCanvas.value = initCanvas()
    
    if (!fabricCanvas.value) {
      throw new Error('Erro ao inicializar canvas')
    }

    // Salvar dimensões originais
    originalImageSize.value = {
      width: img.width,
      height: img.height
    }

    // Calcular dimensões
    const maxWidth = 800
    const scale = img.width > maxWidth ? maxWidth / img.width : 1
    imageScale.value = scale

    const width = Math.floor(img.width * scale)
    const height = Math.floor(img.height * scale)

    // Atualizar canvas
    fabricCanvas.value.setDimensions({
      width: width,
      height: height
    })

    // Criar imagem Fabric
    new fabric.Image.fromURL(imgUrl, (fabricImg) => {
      if (!fabricCanvas.value) return

      fabricImg.scaleToWidth(width)
      fabricCanvas.value.setBackgroundImage(fabricImg, () => {
        fabricCanvas.value?.renderAll()
        addDraggableText(width, height)
        imageLoaded.value = true
        status.value = 'Imagem carregada com sucesso'
      })
    })

  } catch (error) {
    console.error('Erro ao carregar imagem:', error)
    imageLoaded.value = false // Garantir que imageLoaded seja false em caso de erro
    status.value = error instanceof Error ? error.message : 'Erro ao carregar imagem'
  } finally {
    loading.value = false
  }
}

const loadImagePromise = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

const addDraggableText = (width: number, height: number) => {
  if (!fabricCanvas.value) return

  if (textObject) {
    fabricCanvas.value.remove(textObject)
  }

  textObject = new fabric.Text(sampleText.value, {
    left: width / 2,
    top: height / 2,
    fontSize: fontSize.value,
    fontFamily: 'Arial',
    fill: textColor.value,
    originX: 'center',
    originY: 'center',
    selectable: true,
    hasControls: false,
    hasBorders: true,
    borderColor: '#2196F3',
    cornerColor: '#2196F3'
  })

  fabricCanvas.value.add(textObject)
  fabricCanvas.value.setActiveObject(textObject)
  
  textObject.on('moving', () => {
    const pos = textObject!.getCenterPoint()
    console.log('Nova posição:', { x: pos.x, y: pos.y })
  })

  fabricCanvas.value.renderAll()
}

const updateText = (newSize?: number) => {
  if (!textObject || !fabricCanvas.value) return

  const size = newSize || fontSize.value
  textObject.set({
    fontSize: size
  })
  
  // Centralizar o texto após mudar o tamanho
  textObject.setCoords()
  fabricCanvas.value.renderAll()
  
  console.log('Fonte atualizada para:', size)
}

const updateSampleText = () => {
  if (!textObject || !fabricCanvas.value) return

  textObject.set({
    text: sampleText.value
  })
  
  // Centralizar o texto após mudar o conteúdo
  textObject.setCoords()
  fabricCanvas.value.renderAll()
}

const updateTextColor = (color: string) => {
  if (!textObject || !fabricCanvas.value) return
  
  textObject.set({
    fill: color
  })
  
  fabricCanvas.value.renderAll()
  console.log('Cor atualizada para:', color)
}

// Observar mudanças na cor
watch(textColor, (newColor) => {
  updateTextColor(newColor)
})

// Novas refs para o processamento
const processing = ref(false)
const showPreview = ref(false)
const processedImageUrl = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// Adicione estas variáveis para armazenar as dimensões originais e a escala
const originalImageSize = ref({ width: 0, height: 0 })
const imageScale = ref(1)

// Novas refs para o CSV e destinatários
const currentStep = ref<number>(1)
const csvFile = ref<File | null>(null)
const recipients = ref<Recipient[]>([])
const selectedRecipients = ref<Recipient[]>([])
const showResults = ref(false)
const processingResults = ref<ProcessingResult[]>([])

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'E-mail', key: 'email' },
]

const loadCsv = async () => {
  if (!csvFile.value) return

  const text = await csvFile.value.text()
  const lines = text.split('\n')
  
  // Remove cabeçalho e linhas vazias
  const data = lines
    .slice(1)
    .filter(line => line.trim())
    .map(line => {
      const [name, email] = line.split(';').map(field => field.trim())
      return { name, email }
    })

  recipients.value = data
}

const nextStep = () => {
  if (currentStep.value === 1 && !imageLoaded.value) {
    return // Não permite avançar se a imagem não foi configurada
  }
  currentStep.value++
}

const processSelectedRecipients = async () => {
  processing.value = true
  processingResults.value = []

  try {
    for (const recipient of selectedRecipients.value) {
      try {
        const formData = new FormData()
        formData.append('imageFile', certificateFile.value!)

        const pos = textObject!.getBoundingRect()
        const originalX = Math.round(pos.left / imageScale.value)
        const originalY = Math.round(pos.top / imageScale.value)

        const params = new URLSearchParams({
          text: recipient.name,
          x: originalX.toString(),
          y: originalY.toString(),
          fontSize: Math.round(fontSize.value / imageScale.value).toString(),
          textColor: textColor.value.replace('#', '')
        })

        const response = await fetch(`http://localhost:5000/api/Image/process?${params}`, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(await response.text())
        }

        processingResults.value.push({
          ...recipient,
          success: true
        })

      } catch (error) {
        processingResults.value.push({
          ...recipient,
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao processar certificado'
        })
      }
    }

    showResults.value = true
  } finally {
    processing.value = false
  }
}

// Função para processar a imagem
const processImage = async () => {
  if (!textObject || !certificateFile.value) {
    errorMessage.value = 'Configuração incompleta'
    return
  }

  processing.value = true
  errorMessage.value = null

  try {
    const formData = new FormData()
    formData.append('imageFile', certificateFile.value)

    // Obter posição atual do texto
    const pos = textObject.getBoundingRect()
    
    // Converter coordenadas do canvas para coordenadas da imagem original
    const originalX = Math.round(pos.left / imageScale.value)
    const originalY = Math.round(pos.top / imageScale.value)
    
    // Construir URL com parâmetros sem encode no texto
    const params = new URLSearchParams()
    params.append('text', sampleText.value) // Removido encodeURIComponent
    params.append('x', originalX.toString())
    params.append('y', originalY.toString())
    params.append('fontSize', Math.round(fontSize.value / imageScale.value).toString())
    params.append('textColor', textColor.value.replace('#', ''))

    console.log('Enviando requisição com parâmetros:', {
      text: sampleText.value,
      x: originalX,
      y: originalY,
      fontSize: Math.round(fontSize.value / imageScale.value),
      textColor: textColor.value.replace('#', ''),
      scale: imageScale.value,
      originalSize: originalImageSize.value,
      boundingBox: {
        left: pos.left,
        top: pos.top,
        width: pos.width,
        height: pos.height
      }
    })

    const response = await fetch(`http://localhost:5000/api/Image/process?${params}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': '*/*'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro ao processar imagem: ${errorText}`)
    }

    // Receber a imagem processada
    const blob = await response.blob()
    processedImageUrl.value = URL.createObjectURL(blob)
    showPreview.value = true

  } catch (error) {
    console.error('Erro ao processar certificado:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao processar certificado'
  } finally {
    processing.value = false
  }
}

// Função para download da imagem processada
const downloadProcessedImage = () => {
  if (!processedImageUrl.value) return

  const link = document.createElement('a')
  link.href = processedImageUrl.value
  link.download = `certificado-${sampleText.value.replace(/\s+/g, '-')}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Atualize a interface ProcessingResult
interface ProcessingResult extends Recipient {
  success: boolean;
  message?: string;
  imageUrl?: string; // URL da imagem processada
  imageBlob?: Blob; // Blob da imagem para download
}

const processAllCertificates = async () => {
  processing.value = true
  processingResults.value = []

  try { 
    for (const recipient of recipients.value) {
      try {
        const formData = new FormData()
        formData.append('imageFile', certificateFile.value!)

        const pos = textObject!.getBoundingRect()
        const originalX = Math.round(pos.left / imageScale.value)
        const originalY = Math.round(pos.top / imageScale.value)

        const params = new URLSearchParams({
          text: recipient.name,
          x: originalX.toString(),
          y: originalY.toString(),
          fontSize: Math.round(fontSize.value / imageScale.value).toString(),
          textColor: textColor.value.replace('#', '')
        })

        const response = await fetch(`https://copaiba-certificado-api.azurewebsites.net/api/Image/process?${params}`, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(await response.text())
        }

        // Obter o blob da imagem processada
        const imageBlob = await response.blob()
        const imageUrl = URL.createObjectURL(imageBlob)

        processingResults.value.push({
          ...recipient,
          success: true,
          imageUrl,
          imageBlob
        })

      } catch (error) {
        processingResults.value.push({
          ...recipient,
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao processar certificado'
        })
      }
    }

    showResults.value = true
  } finally {
    processing.value = false
  }
}

const downloadCertificate = (result: ProcessingResult) => {
  if (!result.imageBlob || !result.imageUrl) return

  const link = document.createElement('a')
  link.href = result.imageUrl
  link.download = `certificado-${result.name.replace(/\s+/g, '-')}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const finishProcess = () => {
  // Limpar URLs criadas para evitar vazamento de memória
  processingResults.value.forEach(result => {
    if (result.imageUrl) {
      URL.revokeObjectURL(result.imageUrl)
    }
  })
  
  showResults.value = false
  currentStep.value = 1
  // Resetar estados se necessário
}
</script>

<style scoped>
.canvas-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20px 0;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 20px;
}

#canvas-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
}

.d-none {
  display: none !important;
}

#fabricCanvas {
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.text-controls {
  background-color: #f8f9fa;
}

.debug-info {
  background-color: #f5f5f5;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

:deep(.canvas-container) {
  margin: 0 auto;
}

.v-color-picker {
  max-width: 300px;
  margin: 0 auto;
}

.text-caption {
  display: block;
  text-align: center;
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.6);
}

.preview-image-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.preview-image {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.max-width-200 {
  max-width: 200px;
}

:deep(.v-data-table) {
  margin-top: 20px;
}
</style>
