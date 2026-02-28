import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

let sharpLoader = null;

async function loadSharp() {
  if (!sharpLoader) {
    sharpLoader = (async () => {
      try {
        const mod = await import('sharp');
        return mod.default || mod;
      } catch {
        const fallbackPath = path.join(projectRoot, 'frontend', 'node_modules', 'sharp', 'lib', 'index.js');
        const mod = await import(fallbackPath);
        return mod.default || mod;
      }
    })();
  }

  return sharpLoader;
}

/**
 * Генерирует SVG карты на основе шаблонов
 */
export async function generateCardSVG(cardData, type = 'front') {
  try {
    const templatePath = path.join(__dirname, '../templates', `card-${type}.svg`);
    let svgContent = fs.readFileSync(templatePath, 'utf-8');

    if (type === 'front') {
      // Заменяем текстовые плейсхолдеры
      svgContent = svgContent
        .replace('{{lastName}}', cardData.lastName || '')
        .replace('{{firstName}}', cardData.firstName || '')
        .replace('{{middleName}}', cardData.middleName || '');

      // Контакты
      const contact1 = cardData.contacts?.[0] || {};
      const contact2 = cardData.contacts?.[1] || {};

      svgContent = svgContent
        .replace('{{contact1Relationship}}', contact1.relationship || 'Контакт')
        .replace('{{contact1Name}}', contact1.name || '')
        .replace('{{contact1Phone}}', contact1.phone || '')
        .replace('{{contact2Relationship}}', contact2.relationship || 'Контакт')
        .replace('{{contact2Name}}', contact2.name || '')
        .replace('{{contact2Phone}}', contact2.phone || '');

      // Добавляем фото (из data URL превью или из файла сохраненной карты)
      let photoDataUrl = '';
      if (typeof cardData.photoDataUrl === 'string' && cardData.photoDataUrl.startsWith('data:image/')) {
        photoDataUrl = cardData.photoDataUrl;
      } else if (cardData.photo) {
        const photoPath = path.join(__dirname, '../uploads/avatars', cardData.photo);
        if (fs.existsSync(photoPath)) {
          const photoBase64 = fs.readFileSync(photoPath, 'base64');
          const photoExt = path.extname(cardData.photo).toLowerCase();
          const mimeType = photoExt === '.png' ? 'image/png' : 'image/jpeg';
          photoDataUrl = `data:${mimeType};base64,${photoBase64}`;
        }
      }

      if (photoDataUrl) {
        // Добавляем clip-path
        svgContent = svgContent.replace(
          '</defs>',
          '<clipPath id="photoClip"><rect x="24" y="60" width="100" height="100" rx="8"/></clipPath></defs>'
        );
        
        // Удаляем placeholder элементы и вставляем фото
        svgContent = svgContent.replace(
          /<!-- PHOTO_PLACEHOLDER -->\s*<rect id="photoPlaceholder"[^>]*\/>\s*<text[^>]*>[\s\S]*?<\/text>/,
          `<image x="24" y="60" width="100" height="100" href="${photoDataUrl}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>`
        );
      }

      // Генерируем QR код для страницы карты
      const qrCodeUrl = cardData.uniqueCode 
        ? `https://carthelp.ru/card/${cardData.uniqueCode}`
        : 'https://carthelp.ru';
      
      const qrCodeSite = await QRCode.toDataURL(qrCodeUrl, {
        width: 128,
        margin: 0
      });
      
      // Удаляем placeholder элементы и вставляем QR
      // Удаляем rect placeholder, path и текст "QR"
      svgContent = svgContent.replace(
        /<!-- QR_PLACEHOLDER -->\s*<rect id="qrPlaceholder"[^>]*\/>\s*<path[^>]*><\/path>\s*<text[^>]*>[\s\S]*?<\/text>/,
        `<image x="24" y="282" width="32" height="32" href="${qrCodeSite}"/>`
      );

    } else if (type === 'back') {
      // Заменяем данные на обратной стороне
      const bloodType = cardData.bloodType && cardData.rhFactor
        ? `${cardData.bloodType} ${cardData.rhFactor}`
        : '—';
      
      svgContent = svgContent.replace('{{bloodType}}', bloodType);

      // Аллергии
      const allergies = cardData.allergies 
        ? cardData.allergies.split(', ').filter(Boolean).slice(0, 3)
        : [];
      
      svgContent = svgContent
        .replace('{{allergy1}}', allergies[0] ? `• ${allergies[0]}` : '')
        .replace('{{allergy2}}', allergies[1] ? `• ${allergies[1]}` : '')
        .replace('{{allergy3}}', allergies[2] ? `• ${allergies[2]}` : '');

      // Хронические заболевания
      const diseases = cardData.chronicDiseases
        ? cardData.chronicDiseases.split(', ').filter(Boolean).slice(0, 3)
        : [];
      
      svgContent = svgContent
        .replace('{{disease1}}', diseases[0] ? `• ${diseases[0]}` : '')
        .replace('{{disease2}}', diseases[1] ? `• ${diseases[1]}` : '')
        .replace('{{disease3}}', diseases[2] ? `• ${diseases[2]}` : '');

      // Генерируем QR код карты
      const qrCodeCard = await QRCode.toDataURL(
        `https://carthelp.ru/card/${cardData.uniqueCode}`,
        { width: 384, margin: 1 }
      );

      // Вставляем QR для двух вариантов шаблона:
      // 1) старый шаблон с rect 96x96
      // 2) новый шаблон с отдельным текстом "QR CODE" без rect-плейсхолдера
      const oldQrRectPattern = /<rect x="32" y="32" width="96" height="96"[^>]*\/>/;
      if (oldQrRectPattern.test(svgContent)) {
        svgContent = svgContent.replace(
          oldQrRectPattern,
          `<image x="32" y="32" width="96" height="96" href="${qrCodeCard}"/>`
        );
      } else {
        const qrTextPattern = /<text[^>]*>\s*<tspan[^>]*>\s*QR CODE\s*<\/tspan>\s*<\/text>/;
        if (qrTextPattern.test(svgContent)) {
          svgContent = svgContent.replace(
            qrTextPattern,
            `<image x="37.6665" y="44.35" width="224" height="224" href="${qrCodeCard}" preserveAspectRatio="xMidYMid meet"/>`
          );
        }
      }

      // На всякий случай удаляем оставшийся текст "QR CODE"
      svgContent = svgContent.replace(/<text[^>]*>[\s\S]*?QR CODE[\s\S]*?<\/text>/, '');
    }

    return svgContent;

  } catch (error) {
    console.error('Error generating SVG:', error);
    throw error;
  }
}

/**
 * Сохраняет SVG в файл
 */
export async function saveCardSVG(cardData, outputPath, type = 'front') {
  const svgContent = await generateCardSVG(cardData, type);
  fs.writeFileSync(outputPath, svgContent, 'utf-8');
  return outputPath;
}

/**
 * Генерирует PNG карты из SVG-шаблона (единый источник истины)
 */
export async function generateCardPNG(cardData, type = 'front') {
  const svgContent = await generateCardSVG(cardData, type);
  const sharp = await loadSharp();

  return await sharp(Buffer.from(svgContent, 'utf-8'))
    .resize(600, 378, { fit: 'fill' })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      quality: 100
    })
    .toBuffer();
}

/**
 * Генерирует PNG с обеими сторонами карты (лицевая и обратная)
 */
export async function generateCardPNGBothSides(cardData) {
  const sharp = await loadSharp();

  // Генерируем обе стороны
  const frontSvg = await generateCardSVG(cardData, 'front');
  const backSvg = await generateCardSVG(cardData, 'back');

  // Конвертируем SVG в PNG буферы
  const frontPng = await sharp(Buffer.from(frontSvg, 'utf-8'))
    .resize(600, 378, { fit: 'fill' })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  const backPng = await sharp(Buffer.from(backSvg, 'utf-8'))
    .resize(600, 378, { fit: 'fill' })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  // Объединяем обе стороны вертикально с небольшим отступом
  const gap = 20; // отступ между картами
  const combinedHeight = 378 * 2 + gap;

  const combinedPng = await sharp({
    create: {
      width: 600,
      height: combinedHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([
    { input: frontPng, top: 0, left: 0 },
    { input: backPng, top: 378 + gap, left: 0 }
  ])
  .png({ quality: 100, compressionLevel: 9 })
  .toBuffer();

  return combinedPng;
}

export default { generateCardSVG, saveCardSVG, generateCardPNG, generateCardPNGBothSides };
