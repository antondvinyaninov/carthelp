import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  PDFDocument,
  rgb,
  pushGraphicsState,
  popGraphicsState,
  moveTo,
  lineTo,
  appendBezierCurve,
  closePath,
  clip,
  endPath
} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_TEMPLATE_WIDTH = 540;
const BASE_TEMPLATE_HEIGHT = 320;
const FRONT_TEMPLATE_WIDTH = 600;
const FRONT_TEMPLATE_HEIGHT = 378;

function drawRoundedImage(page, image, { x, y, width, height, radius }) {
  const r = Math.min(radius, width / 2, height / 2);
  const k = 0.552284749831; // bezier approx for quarter-circle

  const ox = r * k;
  const oy = r * k;
  const right = x + width;
  const top = y + height;

  page.pushOperators(
    pushGraphicsState(),
    moveTo(x + r, y),
    lineTo(right - r, y),
    appendBezierCurve(right - r + ox, y, right, y + r - oy, right, y + r),
    lineTo(right, top - r),
    appendBezierCurve(right, top - r + oy, right - r + ox, top, right - r, top),
    lineTo(x + r, top),
    appendBezierCurve(x + r - ox, top, x, top - r + oy, x, top - r),
    lineTo(x, y + r),
    appendBezierCurve(x, y + r - oy, x + r - ox, y, x + r, y),
    closePath(),
    clip(),
    endPath()
  );

  page.drawImage(image, { x, y, width, height });
  page.pushOperators(popGraphicsState());
}

function getScaleHelpers(pageWidth, pageHeight, baseWidth = BASE_TEMPLATE_WIDTH, baseHeight = BASE_TEMPLATE_HEIGHT) {
  const scaleX = pageWidth / baseWidth;
  const scaleY = pageHeight / baseHeight;
  const fontScale = (scaleX + scaleY) / 2;

  return {
    sx: (value) => value * scaleX,
    sy: (value) => value * scaleY,
    sf: (value) => value * fontScale,
    yFromTop: (offset) => pageHeight - (offset * scaleY),
  };
}

/**
 * Генерирует PDF карты с обеими сторонами (2 страницы)
 */
export async function generateCardPDFBothSides(cardData) {
  try {
    // Загружаем оба шаблона
    const frontTemplatePath = path.join(__dirname, '../templates', 'card-front.pdf');
    const backTemplatePath = path.join(__dirname, '../templates', 'card-back.pdf');
    
    if (!fs.existsSync(frontTemplatePath) || !fs.existsSync(backTemplatePath)) {
      throw new Error('PDF шаблоны не найдены');
    }
    
    // Создаем новый PDF документ
    const pdfDoc = await PDFDocument.create();
    
    // Регистрируем fontkit
    pdfDoc.registerFontkit(fontkit);
    
    // Загружаем шрифты
    const fontPath = path.join(__dirname, '../fonts/Inter-Regular.ttf');
    const fontBoldPath = path.join(__dirname, '../fonts/Inter-Bold.ttf');
    const fontSemiBoldPath = path.join(__dirname, '../fonts/Inter-SemiBold.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const fontBoldBytes = fs.readFileSync(fontBoldPath);
    const fontSemiBoldBytes = fs.readFileSync(fontSemiBoldPath);
    const customFont = await pdfDoc.embedFont(fontBytes);
    const customFontBold = await pdfDoc.embedFont(fontBoldBytes);
    const customFontSemiBold = await pdfDoc.embedFont(fontSemiBoldBytes);
    
    // === СТРАНИЦА 1: ЛИЦЕВАЯ СТОРОНА ===
    const frontTemplateBytes = fs.readFileSync(frontTemplatePath);
    const frontTemplatePdf = await PDFDocument.load(frontTemplateBytes);
    const [frontPage] = await pdfDoc.copyPages(frontTemplatePdf, [0]);
    pdfDoc.addPage(frontPage);
    
    const { width: frontWidth, height: frontHeight } = frontPage.getSize();
    const frontScale = getScaleHelpers(
      frontWidth,
      frontHeight,
      FRONT_TEMPLATE_WIDTH,
      FRONT_TEMPLATE_HEIGHT
    );
    
    // ФИО - крупный текст
    const fontSize = frontScale.sf(32);
    const nameX = frontScale.sx(168);
    const nameColor = rgb(0.067, 0.094, 0.153);
    
    if (cardData.lastName) {
      frontPage.drawText(cardData.lastName, {
        x: nameX,
        y: frontScale.yFromTop(88),
        size: fontSize,
        font: customFontBold,
        color: nameColor,
      });
    }
    
    if (cardData.firstName) {
      frontPage.drawText(cardData.firstName, {
        x: nameX,
        y: frontScale.yFromTop(128),
        size: fontSize,
        font: customFontBold,
        color: nameColor,
      });
    }
    
    if (cardData.middleName) {
      frontPage.drawText(cardData.middleName, {
        x: nameX,
        y: frontScale.yFromTop(168),
        size: fontSize,
        font: customFontBold,
        color: nameColor,
      });
    }
    
    // Контакты
    const contact1 = cardData.contacts?.[0] || {};
    const contact2 = cardData.contacts?.[1] || {};
    
    const contactColor = rgb(0.067, 0.094, 0.153);
    const labelColor = rgb(0.294, 0.333, 0.424);
    
    // Контакт 1
    if (contact1.relationship) {
      frontPage.drawText(`${contact1.relationship}:`, {
        x: frontScale.sx(24),
        y: frontScale.yFromTop(242),
        size: frontScale.sf(16),
        font: customFont,
        color: labelColor,
      });
    }
    
    if (contact1.name) {
      frontPage.drawText(contact1.name, {
        x: frontScale.sx(24),
        y: frontScale.yFromTop(266),
        size: frontScale.sf(20),
        font: customFontSemiBold,
        color: contactColor,
      });
    }
    
    if (contact1.phone) {
      frontPage.drawText(contact1.phone, {
        x: frontScale.sx(24),
        y: frontScale.yFromTop(296),
        size: frontScale.sf(22),
        font: customFontBold,
        color: contactColor,
      });
    }
    
    // Контакт 2
    if (contact2.relationship) {
      frontPage.drawText(`${contact2.relationship}:`, {
        x: frontScale.sx(306),
        y: frontScale.yFromTop(242),
        size: frontScale.sf(16),
        font: customFont,
        color: labelColor,
      });
    }
    
    if (contact2.name) {
      frontPage.drawText(contact2.name, {
        x: frontScale.sx(306),
        y: frontScale.yFromTop(266),
        size: frontScale.sf(20),
        font: customFontSemiBold,
        color: contactColor,
      });
    }
    
    if (contact2.phone) {
      frontPage.drawText(contact2.phone, {
        x: frontScale.sx(306),
        y: frontScale.yFromTop(296),
        size: frontScale.sf(22),
        font: customFontBold,
        color: contactColor,
      });
    }
    
    // Вставляем фото
    if (cardData.photo) {
      const photoPath = path.join(__dirname, '../uploads/avatars', cardData.photo);
      if (fs.existsSync(photoPath)) {
        const photoBytes = fs.readFileSync(photoPath);
        const photoExt = path.extname(cardData.photo).toLowerCase();
        
        let image;
        if (photoExt === '.png') {
          image = await pdfDoc.embedPng(photoBytes);
        } else {
          image = await pdfDoc.embedJpg(photoBytes);
        }
        
        const photoWidth = frontScale.sx(122);
        const photoHeight = frontScale.sy(122);
        const photoX = frontScale.sx(24);
        const photoY = frontScale.yFromTop(170);
        
        drawRoundedImage(frontPage, image, {
          x: photoX,
          y: photoY,
          width: photoWidth,
          height: photoHeight,
          radius: frontScale.sx(8),
        });
      }
    }
    
    // QR код для страницы карты
    const qrCodeUrl = cardData.uniqueCode 
      ? `https://carthelp.ru/card/${cardData.uniqueCode}`
      : 'https://carthelp.ru';
    
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeUrl, {
      width: 128,
      margin: 0,
      type: 'png'
    });
    
    const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
    
    const qrWidth = frontScale.sx(32);
    const qrHeight = frontScale.sy(32);
    const qrX = frontScale.sx(24);
    const qrY = frontScale.yFromTop(372);
    
    frontPage.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrWidth,
      height: qrHeight,
    });
    
    // === СТРАНИЦА 2: ОБРАТНАЯ СТОРОНА ===
    const backTemplateBytes = fs.readFileSync(backTemplatePath);
    const backTemplatePdf = await PDFDocument.load(backTemplateBytes);
    const [backPage] = await pdfDoc.copyPages(backTemplatePdf, [0]);
    pdfDoc.addPage(backPage);
    
    const { width: backWidth, height: backHeight } = backPage.getSize();
    const backScale = getScaleHelpers(backWidth, backHeight);
    
    // Левая половина - QR код (ниже надписи "СКАНИРУЙТЕ ТЕЛЕФОНОМ")
    const cardQrCodeBuffer = await QRCode.toBuffer(
      `https://carthelp.ru/card/${cardData.uniqueCode}`,
      { width: 1024, margin: 1, type: 'png' }
    );
    
    const cardQrImage = await pdfDoc.embedPng(cardQrCodeBuffer);
    
    const cardQrWidth = backScale.sx(220);
    const cardQrHeight = backScale.sy(220);
    const cardQrX = backScale.sx(25);
    const cardQrY = backScale.yFromTop(280);
    
    backPage.drawImage(cardQrImage, {
      x: cardQrX,
      y: cardQrY,
      width: cardQrWidth,
      height: cardQrHeight,
    });
    
    // Группа крови
    const bloodType = cardData.bloodType && cardData.rhFactor
      ? `${cardData.bloodType} ${cardData.rhFactor}`
      : '—';
    
    backPage.drawText(bloodType, {
      x: backScale.sx(280),
      y: backScale.yFromTop(60),
      size: backScale.sf(24),
      font: customFontBold,
      color: rgb(0.067, 0.094, 0.153),
    });
    
    // Аллергии
    const allergies = cardData.allergies 
      ? cardData.allergies.split(', ').filter(Boolean).slice(0, 4)
      : [];
    
    let allergyY = backScale.yFromTop(120);
    for (let i = 0; i < allergies.length; i++) {
      backPage.drawText(`• ${allergies[i]}`, {
        x: backScale.sx(280),
        y: allergyY,
        size: backScale.sf(12),
        font: customFont,
        color: rgb(0.294, 0.333, 0.424),
      });
      allergyY -= backScale.sy(16);
    }
    
    if (allergies.length === 0) {
      backPage.drawText('нет', {
        x: backScale.sx(280),
        y: allergyY,
        size: backScale.sf(12),
        font: customFont,
        color: rgb(0.6, 0.6, 0.6),
      });
    }
    
    // Хронические заболевания
    const diseases = cardData.chronicDiseases
      ? cardData.chronicDiseases.split(', ').filter(Boolean).slice(0, 4)
      : [];
    
    let diseaseY = backScale.yFromTop(190);
    for (let i = 0; i < diseases.length; i++) {
      backPage.drawText(`• ${diseases[i]}`, {
        x: backScale.sx(280),
        y: diseaseY,
        size: backScale.sf(12),
        font: customFont,
        color: rgb(0.294, 0.333, 0.424),
      });
      diseaseY -= backScale.sy(16);
    }
    
    if (diseases.length === 0) {
      backPage.drawText('нет', {
        x: backScale.sx(280),
        y: diseaseY,
        size: backScale.sf(10),
        font: customFont,
        color: rgb(0.6, 0.6, 0.6),
      });
    }
    
    // Возвращаем PDF как буфер
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    console.error('Error generating PDF with both sides:', error);
    throw error;
  }
}

/**
 * Генерирует PDF карты на основе шаблонов
 */
export async function generateCardPDF(cardData, type = 'front') {
  try {
    const templatePath = path.join(__dirname, '../templates', `card-${type}.pdf`);
    
    // Проверяем существование шаблона
    if (!fs.existsSync(templatePath)) {
      throw new Error(`PDF шаблон не найден: ${templatePath}`);
    }
    
    // Загружаем шаблон
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Регистрируем fontkit для поддержки кастомных шрифтов
    pdfDoc.registerFontkit(fontkit);
    
    // Загружаем шрифт с поддержкой кириллицы
    const fontPath = path.join(__dirname, '../fonts/Inter-Regular.ttf');
    const fontBoldPath = path.join(__dirname, '../fonts/Inter-Bold.ttf');
    const fontSemiBoldPath = path.join(__dirname, '../fonts/Inter-SemiBold.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const fontBoldBytes = fs.readFileSync(fontBoldPath);
    const fontSemiBoldBytes = fs.readFileSync(fontSemiBoldPath);
    const customFont = await pdfDoc.embedFont(fontBytes);
    const customFontBold = await pdfDoc.embedFont(fontBoldBytes);
    const customFontSemiBold = await pdfDoc.embedFont(fontSemiBoldBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    const isFront = type === 'front';
    const scale = isFront
      ? getScaleHelpers(width, height, FRONT_TEMPLATE_WIDTH, FRONT_TEMPLATE_HEIGHT)
      : getScaleHelpers(width, height);
    
    if (type === 'front') {
      // ФИО - крупный текст
      const fontSize = scale.sf(32);
      const nameX = scale.sx(168);
      const nameColor = rgb(0.067, 0.094, 0.153); // #111827
      
      if (cardData.lastName) {
        firstPage.drawText(cardData.lastName, {
          x: nameX,
          y: scale.yFromTop(88),
          size: fontSize,
          font: customFontBold,
          color: nameColor,
        });
      }
      
      if (cardData.firstName) {
        firstPage.drawText(cardData.firstName, {
          x: nameX,
          y: scale.yFromTop(128),
          size: fontSize,
          font: customFontBold,
          color: nameColor,
        });
      }
      
      if (cardData.middleName) {
        firstPage.drawText(cardData.middleName, {
          x: nameX,
          y: scale.yFromTop(168),
          size: fontSize,
          font: customFontBold,
          color: nameColor,
        });
      }
      
      // Контакты
      const contact1 = cardData.contacts?.[0] || {};
      const contact2 = cardData.contacts?.[1] || {};
      
      const contactColor = rgb(0.067, 0.094, 0.153); // #111827
      const labelColor = rgb(0.294, 0.333, 0.424); // #4B5563
      
      // Контакт 1
      if (contact1.relationship) {
        firstPage.drawText(`${contact1.relationship}:`, {
          x: scale.sx(24),
          y: scale.yFromTop(242),
          size: scale.sf(16),
          font: customFont,
          color: labelColor,
        });
      }
      
      if (contact1.name) {
        firstPage.drawText(contact1.name, {
          x: scale.sx(24),
          y: scale.yFromTop(266),
          size: scale.sf(20),
          font: customFontSemiBold,
          color: contactColor,
        });
      }
      
      if (contact1.phone) {
        firstPage.drawText(contact1.phone, {
          x: scale.sx(24),
          y: scale.yFromTop(296),
          size: scale.sf(22),
          font: customFontBold,
          color: contactColor,
        });
      }
      
      // Контакт 2
      if (contact2.relationship) {
        firstPage.drawText(`${contact2.relationship}:`, {
          x: scale.sx(306),
          y: scale.yFromTop(242),
          size: scale.sf(16),
          font: customFont,
          color: labelColor,
        });
      }
      
      if (contact2.name) {
        firstPage.drawText(contact2.name, {
          x: scale.sx(306),
          y: scale.yFromTop(266),
          size: scale.sf(20),
          font: customFontSemiBold,
          color: contactColor,
        });
      }
      
      if (contact2.phone) {
        firstPage.drawText(contact2.phone, {
          x: scale.sx(306),
          y: scale.yFromTop(296),
          size: scale.sf(22),
          font: customFontBold,
          color: contactColor,
        });
      }
      
      // Вставляем фото
      if (cardData.photo) {
        const photoPath = path.join(__dirname, '../uploads/avatars', cardData.photo);
        if (fs.existsSync(photoPath)) {
          const photoBytes = fs.readFileSync(photoPath);
          const photoExt = path.extname(cardData.photo).toLowerCase();
          
          let image;
          if (photoExt === '.png') {
            image = await pdfDoc.embedPng(photoBytes);
          } else {
            image = await pdfDoc.embedJpg(photoBytes);
          }
          
          const photoWidth = scale.sx(122);
          const photoHeight = scale.sy(122);
          const photoX = scale.sx(24);
          const photoY = scale.yFromTop(170);
          
          drawRoundedImage(firstPage, image, {
            x: photoX,
            y: photoY,
            width: photoWidth,
            height: photoHeight,
            radius: scale.sx(8),
          });
          
          console.log('Photo inserted');
        }
      }
      
      // Генерируем и вставляем QR код для страницы карты
      const qrCodeUrl = cardData.uniqueCode 
        ? `https://carthelp.ru/card/${cardData.uniqueCode}`
        : 'https://carthelp.ru';
      
      const qrCodeBuffer = await QRCode.toBuffer(qrCodeUrl, {
        width: 128,
        margin: 0,
        type: 'png'
      });
      
      const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
      
      const qrWidth = scale.sx(32);
      const qrHeight = scale.sy(32);
      const qrX = scale.sx(24);
      const qrY = scale.yFromTop(372);
      
      firstPage.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: qrWidth,
        height: qrHeight,
      });
      
      console.log('QR code inserted');
      
    } else if (type === 'back') {
      // Группа крови
      const bloodType = cardData.bloodType && cardData.rhFactor
        ? `${cardData.bloodType} ${cardData.rhFactor}`
        : '—';
      
      firstPage.drawText(bloodType, {
        x: scale.sx(280),
        y: scale.yFromTop(60),
        size: scale.sf(20),
        font: customFontBold,
        color: rgb(0.067, 0.094, 0.153),
      });
      
      // Аллергии
      const allergies = cardData.allergies 
        ? cardData.allergies.split(', ').filter(Boolean).slice(0, 4)
        : [];
      
      let allergyY = scale.yFromTop(120);
      for (let i = 0; i < allergies.length; i++) {
        firstPage.drawText(`• ${allergies[i]}`, {
          x: scale.sx(280),
          y: allergyY,
          size: scale.sf(10),
          font: customFont,
          color: rgb(0.294, 0.333, 0.424),
        });
        allergyY -= scale.sy(14);
      }
      
      if (allergies.length === 0) {
        firstPage.drawText('нет', {
          x: scale.sx(280),
          y: allergyY,
          size: scale.sf(10),
          font: customFont,
          color: rgb(0.6, 0.6, 0.6),
        });
      }
      
      // Хронические заболевания
      const diseases = cardData.chronicDiseases
        ? cardData.chronicDiseases.split(', ').filter(Boolean).slice(0, 4)
        : [];
      
      let diseaseY = scale.yFromTop(190);
      for (let i = 0; i < diseases.length; i++) {
        firstPage.drawText(`• ${diseases[i]}`, {
          x: scale.sx(280),
          y: diseaseY,
          size: scale.sf(10),
          font: customFont,
          color: rgb(0.294, 0.333, 0.424),
        });
        diseaseY -= scale.sy(14);
      }
      
      if (diseases.length === 0) {
        firstPage.drawText('нет', {
          x: scale.sx(280),
          y: diseaseY,
          size: scale.sf(10),
          font: customFont,
          color: rgb(0.6, 0.6, 0.6),
        });
      }
      
      // Генерируем и вставляем QR код карты (большой - левая половина)
      const qrCodeBuffer = await QRCode.toBuffer(
        `https://carthelp.ru/card/${cardData.uniqueCode}`,
        { width: 1024, margin: 1, type: 'png' }
      );
      
      const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
      
      const qrWidth = scale.sx(150); // Большой QR код
      const qrHeight = scale.sy(150);
      const qrX = scale.sx(60);
      const qrY = scale.yFromTop(205);
      
      firstPage.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: qrWidth,
        height: qrHeight,
      });
      
      console.log('QR code inserted on back');
    }
    
    // Возвращаем PDF как буфер
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Сохраняет PDF в файл
 */
export async function saveCardPDF(cardData, outputPath, type = 'front') {
  const pdfBuffer = await generateCardPDF(cardData, type);
  fs.writeFileSync(outputPath, pdfBuffer);
  return outputPath;
}

export default { generateCardPDF, saveCardPDF, generateCardPDFBothSides };
