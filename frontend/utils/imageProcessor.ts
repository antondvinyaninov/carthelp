import imageCompression from 'browser-image-compression'

interface ImageProcessOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  quality?: number
}

/**
 * Обрабатывает изображение: сжимает и оптимизирует для печати
 * @param file - исходный файл изображения
 * @returns обработанный файл
 */
export async function processCardPhoto(file: File): Promise<File> {
  try {
    // Настройки для качественного изображения для печати
    // Для карты размером 85.6mm x 54mm при 300 DPI нужно примерно 1000x640 пикселей
    // Делаем с запасом для качественной печати
    const options: ImageProcessOptions = {
      maxSizeMB: 2, // Максимум 2 МБ после сжатия
      maxWidthOrHeight: 1200, // Достаточно для качественной печати
      useWebWorker: true,
      quality: 0.9 // Высокое качество (90%)
    }

    console.log('Исходный размер:', (file.size / 1024 / 1024).toFixed(2), 'MB')

    const compressedFile = await imageCompression(file, options)

    console.log('Сжатый размер:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB')

    // Создаем новый File объект с правильным именем и типом
    // browser-image-compression иногда возвращает Blob, а не File
    const finalFile = new File(
      [compressedFile], 
      file.name || 'photo.jpg',
      { 
        type: compressedFile.type || 'image/jpeg',
        lastModified: Date.now()
      }
    )

    console.log('Финальный файл:', {
      name: finalFile.name,
      type: finalFile.type,
      size: (finalFile.size / 1024 / 1024).toFixed(2) + ' MB'
    })

    return finalFile
  } catch (error) {
    console.error('Ошибка при обработке изображения:', error)
    throw new Error('Не удалось обработать изображение')
  }
}

/**
 * Проверяет, является ли файл изображением
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Проверяет размер файла
 */
export function isFileSizeValid(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Создает превью изображения для отображения
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
