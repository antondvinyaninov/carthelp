import { generateCardSVG } from './utils/cardSvgGenerator.js';
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
    }
  ]
};

console.log('Generating test SVG...');
const svg = await generateCardSVG(testCard, 'front');
console.log('SVG length:', svg.length);
console.log('Contains photo image tag:', svg.includes('<image x="24" y="60"'));
console.log('Contains QR image tag:', svg.includes('<image x="24" y="282"'));
console.log('Contains photoPlaceholder rect:', svg.includes('id="photoPlaceholder"'));
console.log('Contains qrPlaceholder rect:', svg.includes('id="qrPlaceholder"'));

fs.writeFileSync('./temp/test-output.svg', svg, 'utf-8');
console.log('Saved to temp/test-output.svg');
