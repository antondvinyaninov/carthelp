import pkg from 'pdfkit';
const PDFDocument = pkg.default || pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к шрифту с кириллицей
const FONT_PATH = path.join(__dirname, '../fonts/Inter-Regular.ttf');
const FONT_BOLD_PATH = path.join(__dirname, '../fonts/Inter-Bold.ttf');
const FONT_SEMIBOLD_PATH = path.join(__dirname, '../fonts/Inter-SemiBold.ttf');

// Режим разработки - показывать рамки для отладки
const DEBUG_MODE = false; // false = без рамок для пользователей, true = с рамками для настройки

// Размеры карты в пунктах (1 пункт = 1/72 дюйма)
// 85.6mm x 54mm = 242.65pt x 153pt (стандартная кредитная карта)
const CARD_WIDTH = 600;
const CARD_HEIGHT = 378;

// Базовая сетка старого макета
const BASE_WIDTH = 540;
const BASE_HEIGHT = 320;

// Итоговый размер страницы шаблона
const PAGE_WIDTH = CARD_WIDTH;
const PAGE_HEIGHT = CARD_HEIGHT;

// Коэффициенты масштабирования базовой сетки под новый размер страницы
const SCALE_X = PAGE_WIDTH / BASE_WIDTH;
const SCALE_Y = PAGE_HEIGHT / BASE_HEIGHT;

// Для построения сохраняем старые координаты
const WIDTH = BASE_WIDTH;
const HEIGHT = BASE_HEIGHT;

function createFrontTemplate() {
  const doc = new PDFDocument({
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    margins: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  const outputPath = path.join(__dirname, '../templates/card-front.pdf');
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Регистрируем шрифт с кириллицей
  doc.registerFont('Inter', FONT_PATH);
  doc.registerFont('Inter-Bold', FONT_BOLD_PATH);
  doc.registerFont('Inter-SemiBold', FONT_SEMIBOLD_PATH);

  // Лицевая сторона 1:1 с UI-превью
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill('#FFFFFF');

  // Верхняя красная плашка
  doc.rect(0, 0, PAGE_WIDTH, 40).fill('#DC2626');
  doc.font('Inter-Bold')
     .fontSize(14)
     .fillColor('#FFFFFF')
     .text('КАРТА ЭКСТРЕННОЙ ПОМОЩИ', 0, 14, {
       width: PAGE_WIDTH,
       align: 'center'
     });

  // Фото-плейсхолдер
  doc.roundedRect(24, 48, 122, 122, 8)
     .lineWidth(2)
     .strokeColor('#D1D5DB')
     .fillColor('#F3F4F6')
     .fillAndStroke();

  doc.font('Inter')
     .fontSize(12)
     .fillColor('#9CA3AF')
     .text('ФОТО', 24, 108, {
       width: 122,
       align: 'center'
     });

  // Отладочные рамки ФИО
  if (DEBUG_MODE) {
    doc.roundedRect(168, 62, 408, 38, 4).lineWidth(1).strokeColor('#E5E7EB').stroke();
    doc.roundedRect(168, 102, 408, 38, 4).lineWidth(1).strokeColor('#E5E7EB').stroke();
    doc.roundedRect(168, 142, 408, 38, 4).lineWidth(1).strokeColor('#E5E7EB').stroke();
  }

  // Блок контактов
  const emergencyTitle = 'ЭКСТРЕННЫЕ КОНТАКТЫ';
  doc.font('Inter-SemiBold')
     .fontSize(17)
     .fillColor('#DC2626')
     .text(emergencyTitle, 24, 206);

  const emergencyTitleWidth = doc.widthOfString(emergencyTitle);
  const lineStartX = 24 + emergencyTitleWidth + 10;
  doc.moveTo(lineStartX, 219)
     .lineTo(576, 219)
     .lineWidth(2)
     .strokeColor('#DC2626')
     .stroke();

  if (DEBUG_MODE) {
    doc.roundedRect(24, 228, 270, 88, 4).lineWidth(1).strokeColor('#E5E7EB').stroke();
    doc.roundedRect(306, 228, 270, 88, 4).lineWidth(1).strokeColor('#E5E7EB').stroke();
  }

  // Нижняя зона
  const footerY = PAGE_HEIGHT - 44;
  const leftFooterWidth = 180;
  doc.rect(0, footerY, leftFooterWidth, 44).fill('#FFFFFF');

  // QR placeholder (сайт)
  doc.roundedRect(24, footerY + 6, 32, 32, 4)
     .lineWidth(1)
     .strokeColor('#E5E7EB')
     .fillColor('#E5E7EB')
     .fillAndStroke();
  doc.font('Inter')
     .fontSize(8)
     .fillColor('#9CA3AF')
     .text('QR', 24, footerY + 19, {
       width: 32,
       align: 'center'
     });

  doc.font('Inter-SemiBold')
     .fontSize(15)
     .fillColor('#4B5563')
     .text('carthelp.ru', 64, footerY + 13);

  // Правая красная часть футера (диагональный срез как в UI clip-path)
  const rightFooterCut = 21;
  const rightFooterTextX = leftFooterWidth + 32;
  const rightFooterPhoneX = PAGE_WIDTH - 65;

  doc.save();
  doc.fillColor('#DC2626');
  doc.moveTo(leftFooterWidth + rightFooterCut, footerY)
     .lineTo(PAGE_WIDTH, footerY)
     .lineTo(PAGE_WIDTH, PAGE_HEIGHT)
     .lineTo(leftFooterWidth, PAGE_HEIGHT)
     .closePath()
     .fill();
  doc.restore();

  doc.font('Inter-SemiBold')
     .fontSize(11)
     .fillColor('#FFFFFF')
     .text('Телефон экстренных спасательных служб', rightFooterTextX, footerY + 15, {
       width: 309,
       align: 'left'
     });

  doc.font('Inter-Bold')
     .fontSize(28)
     .fillColor('#FFFFFF')
     .text('112', rightFooterPhoneX, footerY + 8);

  // Внешняя рамка
  doc.roundedRect(1, 1, PAGE_WIDTH - 2, PAGE_HEIGHT - 2, 12)
     .lineWidth(2)
     .strokeColor('#E5E7EB')
     .stroke();

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      console.log('✓ Создан шаблон лицевой стороны:', outputPath);
      resolve(outputPath);
    });
    stream.on('error', reject);
  });
}

function createBackTemplate() {
  const doc = new PDFDocument({
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    margins: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  const outputPath = path.join(__dirname, '../templates/card-back.pdf');
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Регистрируем шрифт с кириллицей
  doc.registerFont('Inter', FONT_PATH);
  doc.registerFont('Inter-Bold', FONT_BOLD_PATH);
  doc.registerFont('Inter-SemiBold', FONT_SEMIBOLD_PATH);

  // Масштабируем старую координатную сетку до нового размера страницы
  doc.transform(SCALE_X, 0, 0, SCALE_Y, 0, 0);

  // Белый фон
  doc.rect(0, 0, WIDTH, HEIGHT).fill('#FFFFFF');

  // Левая половина - QR код
  // Текст "СКАНИРУЙТЕ ТЕЛЕФОНОМ"
  doc.font('Inter-SemiBold')
     .fontSize(9)
     .fillColor('#4B5563')
     .text('СКАНИРУЙТЕ ТЕЛЕФОНОМ', 0, 30, {
       width: 270,
       align: 'center'
     });

  // Рамка для QR кода с плейсхолдером
  if (DEBUG_MODE) {
    doc.roundedRect(25, 50, 220, 220, 8)
       .lineWidth(2)
       .strokeColor('#E5E7EB')
       .fillColor('#F3F4F6')
       .fillAndStroke();
    
    doc.font('Inter')
       .fontSize(12)
       .fillColor('#9CA3AF')
       .text('QR КОД', 25, 150, {
         width: 220,
         align: 'center'
       });
  }

  // Правая половина - медицинская информация
  const rightX = 280;
  
  // Заголовок "ГРУППА КРОВИ"
  doc.font('Inter-Bold')
     .fontSize(11)
     .fillColor('#DC2626')
     .text('ГРУППА КРОВИ', rightX, 30);

  // Плейсхолдер для группы крови
  if (DEBUG_MODE) {
    doc.roundedRect(rightX, 50, 100, 30, 4)
       .lineWidth(1)
       .strokeColor('#E5E7EB')
       .stroke();
    
    doc.font('Inter-Bold')
       .fontSize(20)
       .fillColor('#D1D5DB')
       .text('II Rh+', rightX + 5, 57);
  }

  // Заголовок "АЛЛЕРГИИ"
  doc.font('Inter-Bold')
     .fontSize(11)
     .fillColor('#DC2626')
     .text('АЛЛЕРГИИ', rightX, 100);

  // Плейсхолдеры для аллергий - каждый отдельно
  if (DEBUG_MODE) {
    doc.font('Inter')
       .fontSize(11)
       .fillColor('#D1D5DB');
    doc.text('• аллергия 1', rightX, 120);
    doc.save();
    doc.restore();
    
    doc.font('Inter')
       .fontSize(11)
       .fillColor('#D1D5DB');
    doc.text('• аллергия 2', rightX, 136);
    doc.save();
    doc.restore();
    
    doc.font('Inter')
       .fontSize(11)
       .fillColor('#D1D5DB');
    doc.text('• аллергия 3', rightX, 152);
    doc.save();
    doc.restore();
  }

  // Заголовок "ХРОНИЧЕСКИЕ ЗАБОЛЕВАНИЯ"
  doc.font('Inter-Bold')
     .fontSize(11)
     .fillColor('#DC2626')
     .text('ХРОНИЧЕСКИЕ ЗАБОЛЕВАНИЯ', rightX, 170);

  // Плейсхолдеры для заболеваний - каждый отдельно
  if (DEBUG_MODE) {
    doc.font('Inter')
       .fontSize(11)
       .fillColor('#D1D5DB');
    doc.text('• заболевание 1', rightX, 190);
    doc.save();
    doc.restore();
    
    doc.font('Inter')
       .fontSize(11)
       .fillColor('#D1D5DB');
    doc.text('• заболевание 2', rightX, 206);
    doc.save();
    doc.restore();
    
    doc.font('Inter')
       .fontSize(11)
       .fillColor('#D1D5DB');
    doc.text('• заболевание 3', rightX, 222);
    doc.save();
    doc.restore();
  }

  // Синяя полоска внизу правой части
  doc.rect(270, 270, 270, 50).fill('#2563EB');

  // Текст в синей полоске
  doc.font('Inter-SemiBold')
     .fontSize(8)
     .fillColor('#FFFFFF')
     .text('В экстренном случае просим связаться\nпо контактам, указанным на карте', 280, 283, {
       width: 250,
       align: 'center',
       lineGap: 2
     });

  // Внешняя рамка карты
  doc.roundedRect(0, 0, WIDTH, HEIGHT, 12)
     .lineWidth(2)
     .strokeColor('#E5E7EB')
     .stroke();

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      console.log('✓ Создан шаблон обратной стороны:', outputPath);
      resolve(outputPath);
    });
    stream.on('error', reject);
  });
}

async function createTemplates() {
  console.log('Создание PDF шаблонов...\n');
  
  try {
    await createFrontTemplate();
    await createBackTemplate();
    console.log('\n✓ Все шаблоны успешно созданы!');
  } catch (error) {
    console.error('Ошибка при создании шаблонов:', error);
    process.exit(1);
  }
}

// Запускаем если файл вызван напрямую
createTemplates();

export { createFrontTemplate, createBackTemplate, createTemplates };
