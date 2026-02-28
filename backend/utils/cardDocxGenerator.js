import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Генерирует DOCX карты на основе шаблона
 */
export async function generateCardDOCX(cardData, type = 'back') {
  try {
    const templatePath = path.join(__dirname, '../templates', `card-${type}.docx`);
    
    // Проверяем существование шаблона
    if (!fs.existsSync(templatePath)) {
      throw new Error(`DOCX шаблон не найден: ${templatePath}`);
    }
    
    // Загружаем шаблон
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // Подготавливаем данные для шаблона
    const templateData = {
      bloodType: cardData.bloodType || '',
      rhFactor: cardData.rhFactor || '',
      bloodTypeFull: cardData.bloodType && cardData.rhFactor 
        ? `${cardData.bloodType} ${cardData.rhFactor}`
        : '—',
      
      // Аллергии как массив
      allergies: cardData.allergies 
        ? cardData.allergies.split(', ').filter(Boolean).map(a => ({ name: a }))
        : [{ name: 'нет' }],
      
      hasAllergies: cardData.allergies && cardData.allergies.trim() !== '',
      
      // Заболевания как массив
      diseases: cardData.chronicDiseases
        ? cardData.chronicDiseases.split(', ').filter(Boolean).map(d => ({ name: d }))
        : [{ name: 'нет' }],
      
      hasDiseases: cardData.chronicDiseases && cardData.chronicDiseases.trim() !== '',
      
      // QR код URL
      qrUrl: `https://carthelp.ru/card/${cardData.uniqueCode}`,
    };
    
    // Заполняем шаблон данными
    doc.render(templateData);
    
    // Получаем заполненный документ
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
    
    return buf;
    
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw error;
  }
}

/**
 * Сохраняет DOCX в файл
 */
export async function saveCardDOCX(cardData, outputPath, type = 'back') {
  const docxBuffer = await generateCardDOCX(cardData, type);
  fs.writeFileSync(outputPath, docxBuffer);
  return outputPath;
}

export default { generateCardDOCX, saveCardDOCX };
