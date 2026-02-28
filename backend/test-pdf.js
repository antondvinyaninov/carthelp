import { generateCardPDF } from './utils/cardPdfGenerator.js';
import fs from 'fs';

const testCard = {
  lastName: 'Двинянинов',
  firstName: 'Антон',
  middleName: 'Александрович',
  photo: 'avatar-1771769435278-271907189.jpg',
  uniqueCode: 'TEST-123',
  contacts: [
    {
      name: 'Вероника Двинянинова',
      phone: '+7 (950) 155-20-09',
      relationship: 'Жена'
    },
    {
      name: 'Мария Двинянинова',
      phone: '+7 (900) 123-45-67',
      relationship: 'Мама'
    }
  ],
  bloodType: 'A',
  rhFactor: 'Rh+',
  allergies: 'Пенициллин, Арахис',
  chronicDiseases: 'Диабет 2 типа, Гипертония'
};

console.log('Генерация тестового PDF (лицевая сторона)...');
try {
  const pdfFront = await generateCardPDF(testCard, 'front');
  fs.writeFileSync('./temp/test-front.pdf', pdfFront);
  console.log('✓ Лицевая сторона сохранена: temp/test-front.pdf');
  console.log('  Размер:', pdfFront.length, 'байт');
} catch (error) {
  console.error('✗ Ошибка при генерации лицевой стороны:', error.message);
}

console.log('\nГенерация тестового PDF (обратная сторона)...');
try {
  const pdfBack = await generateCardPDF(testCard, 'back');
  fs.writeFileSync('./temp/test-back.pdf', pdfBack);
  console.log('✓ Обратная сторона сохранена: temp/test-back.pdf');
  console.log('  Размер:', pdfBack.length, 'байт');
} catch (error) {
  console.error('✗ Ошибка при генерации обратной стороны:', error.message);
}

console.log('\n✓ Тестирование завершено!');
