import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../utils/upload.js';
import { generateCardSVG, generateCardPNG, generateCardPNGBothSides } from '../utils/cardSvgGenerator.js';
import { generateCardPDF, generateCardPDFBothSides } from '../utils/cardPdfGenerator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const DEFAULT_ADDITIONAL_INFO = {
  medicalNotes: '',
  doctorsInfo: '',
  insuranceInfo: '',
  additionalContacts: '',
  specialInstructions: '',
  snils: '',
  omsPolicyNumber: '',
  dmsInsurance: '',
  disabilityGroup: '',
  procedureContraindications: '',
  organDonationConsent: false,
  dnrRefusal: false,
  additionalWishes: '',
  vaccinationHistory: '',
  currentMedications: '',
  fullAllergiesList: '',
  surgeriesHistory: '',
  attendingPhysician: '',
  additionalMedicalNotes: ''
};

let additionalInfoTableReadyPromise = null;

function asString(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function asBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
  }
  return false;
}

function normalizeAdditionalInfo(rawAdditionalInfo) {
  let source = rawAdditionalInfo;

  if (typeof source === 'string') {
    try {
      source = JSON.parse(source);
    } catch {
      source = {};
    }
  }

  if (!source || Array.isArray(source) || typeof source !== 'object') {
    source = {};
  }

  return {
    medicalNotes: asString(source.medicalNotes ?? source.medical_notes),
    doctorsInfo: asString(source.doctorsInfo ?? source.doctors_info),
    insuranceInfo: asString(source.insuranceInfo ?? source.insurance_info),
    additionalContacts: asString(source.additionalContacts ?? source.additional_contacts),
    specialInstructions: asString(source.specialInstructions ?? source.special_instructions),
    snils: asString(source.snils),
    omsPolicyNumber: asString(source.omsPolicyNumber ?? source.oms_policy_number),
    dmsInsurance: asString(source.dmsInsurance ?? source.dms_insurance),
    disabilityGroup: asString(source.disabilityGroup ?? source.disability_group),
    procedureContraindications: asString(source.procedureContraindications ?? source.procedure_contraindications),
    organDonationConsent: asBoolean(source.organDonationConsent ?? source.organ_donation_consent),
    dnrRefusal: asBoolean(source.dnrRefusal ?? source.dnr_refusal),
    additionalWishes: asString(source.additionalWishes ?? source.additional_wishes),
    vaccinationHistory: asString(source.vaccinationHistory ?? source.vaccination_history),
    currentMedications: asString(source.currentMedications ?? source.current_medications),
    fullAllergiesList: asString(source.fullAllergiesList ?? source.full_allergies_list),
    surgeriesHistory: asString(source.surgeriesHistory ?? source.surgeries_history),
    attendingPhysician: asString(source.attendingPhysician ?? source.attending_physician),
    additionalMedicalNotes: asString(source.additionalMedicalNotes ?? source.additional_medical_notes)
  };
}

function mapCardWithAdditionalInfo(card) {
  const additionalInfo = normalizeAdditionalInfo(card?.additional_info);

  return {
    ...card,
    additional_info: additionalInfo,
    medical_notes: additionalInfo.medicalNotes,
    doctors_info: additionalInfo.doctorsInfo,
    insurance_info: additionalInfo.insuranceInfo,
    additional_contacts: additionalInfo.additionalContacts,
    special_instructions: additionalInfo.specialInstructions,
    snils: additionalInfo.snils,
    oms_policy_number: additionalInfo.omsPolicyNumber,
    dms_insurance: additionalInfo.dmsInsurance,
    disability_group: additionalInfo.disabilityGroup,
    procedure_contraindications: additionalInfo.procedureContraindications,
    organ_donation_consent: additionalInfo.organDonationConsent,
    dnr_refusal: additionalInfo.dnrRefusal,
    additional_wishes: additionalInfo.additionalWishes,
    vaccination_history: additionalInfo.vaccinationHistory,
    current_medications: additionalInfo.currentMedications,
    full_allergies_list: additionalInfo.fullAllergiesList,
    surgeries_history: additionalInfo.surgeriesHistory,
    attending_physician: additionalInfo.attendingPhysician,
    additional_medical_notes: additionalInfo.additionalMedicalNotes
  };
}

async function ensureAdditionalInfoTable() {
  if (!additionalInfoTableReadyPromise) {
    additionalInfoTableReadyPromise = pool.query(
      `CREATE TABLE IF NOT EXISTS card_additional_info (
        profile_id INTEGER PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    ).catch((error) => {
      additionalInfoTableReadyPromise = null;
      throw error;
    });
  }

  await additionalInfoTableReadyPromise;
}

async function upsertAdditionalInfo(client, profileId, rawAdditionalInfo) {
  const normalized = {
    ...DEFAULT_ADDITIONAL_INFO,
    ...normalizeAdditionalInfo(rawAdditionalInfo)
  };

  await client.query(
    `INSERT INTO card_additional_info (profile_id, data, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (profile_id)
     DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [profileId, JSON.stringify(normalized)]
  );
}

// Создание новой карты
router.post('/create', authenticateToken, upload.single('photo'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await ensureAdditionalInfoTable();
    await client.query('BEGIN');
    
    const userId = req.user.id;
    const {
      lastName,
      firstName,
      middleName,
      birthDate,
      bloodType,
      rhFactor,
      allergies,
      chronicDiseases,
      medications,
      isPublic,
      contacts,
      additionalInfo
    } = req.body;

    console.log('=== CARD CREATION DEBUG ===');
    console.log('User ID:', userId);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('=========================');

    // Генерируем уникальный код для карты
    const uniqueCode = `CARD-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Путь к фото (если загружено)
    const photoPath = req.file ? req.file.filename : null;
    console.log('Photo will be saved as:', photoPath);

    // 1. Создаем профиль
    // Формируем полное имя
    const fullName = `${lastName} ${firstName} ${middleName}`.trim();
    
    const profileResult = await client.query(
      `INSERT INTO profiles (user_id, name, last_name, first_name, middle_name, birth_date, photo, unique_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [userId, fullName, lastName, firstName, middleName, birthDate || null, photoPath, uniqueCode]
    );
    
    const profileId = profileResult.rows[0].id;
    console.log('Profile created with ID:', profileId, 'Photo:', photoPath);

    // 2. Создаем медицинский профиль
    const parsedAllergies = typeof allergies === 'string' ? JSON.parse(allergies) : allergies;
    const parsedDiseases = typeof chronicDiseases === 'string' ? JSON.parse(chronicDiseases) : chronicDiseases;

    await client.query(
      `INSERT INTO medical_profiles (
        user_id, profile_id, blood_type, rh_factor, allergies, chronic_diseases, 
        medications, is_public
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        profileId,
        bloodType || null,
        rhFactor || null,
        parsedAllergies.filter(Boolean).join(', ') || null,
        parsedDiseases.filter(Boolean).join(', ') || null,
        medications || null,
        isPublic === 'true' || isPublic === true
      ]
    );

    // 3. Создаем экстренные контакты
    const parsedContacts = typeof contacts === 'string' ? JSON.parse(contacts) : contacts;
    
    for (let i = 0; i < parsedContacts.length; i++) {
      const contact = parsedContacts[i];
      if (contact.name && contact.phone) {
        await client.query(
          `INSERT INTO emergency_contacts (user_id, profile_id, name, phone, relationship, priority)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, profileId, contact.name, contact.phone, contact.relationship || null, i + 1]
        );
      }
    }

    // 4. Создаем запись карты помощи
    await client.query(
      `INSERT INTO help_cards (user_id, profile_id, card_number, status)
       VALUES ($1, $2, $3, $4)`,
      [userId, profileId, uniqueCode, 'pending']
    );

    // 5. Сохраняем расширенную дополнительную информацию
    await upsertAdditionalInfo(client, profileId, additionalInfo);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Карта успешно создана',
      data: {
        profileId,
        uniqueCode,
        qrUrl: `https://carthelp.ru/card/${uniqueCode}`
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating card:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании карты',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Превью SVG лицевой стороны из текущих данных формы (до сохранения)
router.post('/svg/preview/front', authenticateToken, async (req, res) => {
  try {
    const {
      lastName = '',
      firstName = '',
      middleName = '',
      contacts = [],
      photoDataUrl = ''
    } = req.body || {};

    const parsedContacts = Array.isArray(contacts) ? contacts : [];

    const cardData = {
      lastName,
      firstName,
      middleName,
      contacts: parsedContacts.slice(0, 2).map((c) => ({
        name: c?.name || '',
        phone: c?.phone || '',
        relationship: c?.relationship || ''
      })),
      photoDataUrl: typeof photoDataUrl === 'string' ? photoDataUrl : ''
    };

    const svgContent = await generateCardSVG(cardData, 'front');

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svgContent);
  } catch (error) {
    console.error('Error generating preview SVG:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при генерации SVG превью',
      error: error.message
    });
  }
});

// Превью SVG обратной стороны из текущих данных формы (до сохранения)
router.post('/svg/preview/back', authenticateToken, async (req, res) => {
  try {
    const {
      bloodType = '',
      rhFactor = '',
      allergies = [],
      chronicDiseases = [],
      uniqueCode = 'preview'
    } = req.body || {};

    const normalizeList = (value) => {
      if (Array.isArray(value)) {
        return value.filter(Boolean).join(', ');
      }
      if (typeof value === 'string') {
        return value;
      }
      return '';
    };

    const cardData = {
      bloodType: typeof bloodType === 'string' ? bloodType : '',
      rhFactor: typeof rhFactor === 'string' ? rhFactor : '',
      allergies: normalizeList(allergies),
      chronicDiseases: normalizeList(chronicDiseases),
      uniqueCode: typeof uniqueCode === 'string' && uniqueCode ? uniqueCode : 'preview'
    };

    const svgContent = await generateCardSVG(cardData, 'back');

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svgContent);
  } catch (error) {
    console.error('Error generating preview back SVG:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при генерации SVG превью обратной стороны',
      error: error.message
    });
  }
});

// Получение всех карт пользователя
router.get('/my-cards', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching cards for user:', userId);
    
    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.birth_date,
        p.photo,
        p.unique_code,
        hc.card_number,
        hc.status,
        hc.created_at,
        mp.blood_type,
        mp.rh_factor,
        mp.allergies,
        mp.chronic_diseases,
        mp.medications,
        mp.is_public
      FROM profiles p
      LEFT JOIN help_cards hc ON p.id = hc.profile_id
      LEFT JOIN medical_profiles mp ON p.id = mp.profile_id
      WHERE p.user_id = $1
      ORDER BY hc.created_at DESC`,
      [userId]
    );

    // Для каждой карты получаем контакты
    const cardsWithContacts = await Promise.all(
      result.rows.map(async (card) => {
        const contacts = await pool.query(
          `SELECT name, phone, relationship, priority
           FROM emergency_contacts
           WHERE profile_id = $1
           ORDER BY priority ASC`,
          [card.id]
        );
        
        return {
          ...card,
          contacts: contacts.rows
        };
      })
    );

    console.log('Found cards:', cardsWithContacts.length);
    if (cardsWithContacts.length > 0) {
      console.log('Sample card data:', JSON.stringify(cardsWithContacts[0], null, 2));
    }

    res.json({
      success: true,
      cards: cardsWithContacts
    });

  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении карт',
      error: error.message
    });
  }
});

// Получение одной карты пользователя для редактирования
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    await ensureAdditionalInfoTable();
    const userId = req.user.id;
    const profileId = parseInt(req.params.id);
    
    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.birth_date,
        p.photo,
        p.unique_code,
        mp.blood_type,
        mp.rh_factor,
        mp.allergies,
        mp.chronic_diseases,
        mp.medications,
        mp.is_public,
        cai.data AS additional_info
      FROM profiles p
      LEFT JOIN medical_profiles mp ON p.id = mp.profile_id
      LEFT JOIN card_additional_info cai ON p.id = cai.profile_id
      WHERE p.id = $1 AND p.user_id = $2`,
      [profileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Карта не найдена'
      });
    }

    const card = result.rows[0];

    // Получаем контакты
    const contacts = await pool.query(
      `SELECT name, phone, relationship, priority
       FROM emergency_contacts
       WHERE profile_id = $1
       ORDER BY priority ASC`,
      [card.id]
    );

    res.json({
      success: true,
      card: {
        ...mapCardWithAdditionalInfo(card),
        contacts: contacts.rows
      }
    });

  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении карты',
      error: error.message
    });
  }
});

// Обновление карты
router.put('/:id', authenticateToken, upload.single('photo'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await ensureAdditionalInfoTable();
    await client.query('BEGIN');
    
    const userId = req.user.id;
    const profileId = parseInt(req.params.id);
    const {
      lastName,
      firstName,
      middleName,
      birthDate,
      bloodType,
      rhFactor,
      allergies,
      chronicDiseases,
      medications,
      isPublic,
      contacts,
      additionalInfo
    } = req.body;

    // Проверяем, что карта принадлежит пользователю
    const checkResult = await client.query(
      'SELECT id, photo FROM profiles WHERE id = $1 AND user_id = $2',
      [profileId, userId]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Карта не найдена'
      });
    }

    const oldPhoto = checkResult.rows[0].photo;
    const photoPath = req.file ? req.file.filename : oldPhoto;

    // Формируем полное имя
    const fullName = `${lastName} ${firstName} ${middleName}`.trim();

    // 1. Обновляем профиль
    await client.query(
      `UPDATE profiles 
       SET name = $1, last_name = $2, first_name = $3, middle_name = $4, 
           birth_date = $5, photo = $6
       WHERE id = $7`,
      [fullName, lastName, firstName, middleName, birthDate || null, photoPath, profileId]
    );

    // 2. Обновляем медицинский профиль
    const parsedAllergies = typeof allergies === 'string' ? JSON.parse(allergies) : allergies;
    const parsedDiseases = typeof chronicDiseases === 'string' ? JSON.parse(chronicDiseases) : chronicDiseases;

    await client.query(
      `UPDATE medical_profiles 
       SET blood_type = $1, rh_factor = $2, allergies = $3, chronic_diseases = $4,
           medications = $5, is_public = $6
       WHERE profile_id = $7`,
      [
        bloodType || null,
        rhFactor || null,
        parsedAllergies.filter(Boolean).join(', ') || null,
        parsedDiseases.filter(Boolean).join(', ') || null,
        medications || null,
        isPublic === 'true' || isPublic === true,
        profileId
      ]
    );

    // 3. Удаляем старые контакты и создаем новые
    await client.query('DELETE FROM emergency_contacts WHERE profile_id = $1', [profileId]);
    
    const parsedContacts = typeof contacts === 'string' ? JSON.parse(contacts) : contacts;
    
    for (let i = 0; i < parsedContacts.length; i++) {
      const contact = parsedContacts[i];
      if (contact.name && contact.phone) {
        await client.query(
          `INSERT INTO emergency_contacts (user_id, profile_id, name, phone, relationship, priority)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, profileId, contact.name, contact.phone, contact.relationship || null, i + 1]
        );
      }
    }

    // 4. Обновляем расширенную дополнительную информацию
    await upsertAdditionalInfo(client, profileId, additionalInfo);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Карта успешно обновлена'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating card:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении карты',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Удаление карты
router.delete('/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const userId = req.user.id;
    const profileId = parseInt(req.params.id);

    // Проверяем, что карта принадлежит пользователю
    const checkResult = await client.query(
      'SELECT id FROM profiles WHERE id = $1 AND user_id = $2',
      [profileId, userId]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Карта не найдена'
      });
    }

    // Удаляем связанные данные (каскадное удаление должно работать, но на всякий случай)
    await client.query('DELETE FROM emergency_contacts WHERE profile_id = $1', [profileId]);
    await client.query('DELETE FROM medical_profiles WHERE profile_id = $1', [profileId]);
    await client.query('DELETE FROM help_cards WHERE profile_id = $1', [profileId]);
    await client.query('DELETE FROM profiles WHERE id = $1', [profileId]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Карта успешно удалена'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting card:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении карты',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Получение публичной карты по коду
router.get('/public/:code', async (req, res) => {
  try {
    await ensureAdditionalInfoTable();
    const code = req.params.code;
    console.log('Fetching public card:', code);
    
    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.birth_date,
        p.photo,
        p.unique_code,
        mp.blood_type,
        mp.rh_factor,
        mp.allergies,
        mp.chronic_diseases,
        mp.medications,
        mp.is_public,
        cai.data AS additional_info
      FROM profiles p
      LEFT JOIN medical_profiles mp ON p.id = mp.profile_id
      LEFT JOIN card_additional_info cai ON p.id = cai.profile_id
      WHERE p.unique_code = $1`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Карта не найдена'
      });
    }

    const card = result.rows[0];

    // Получаем контакты
    const contacts = await pool.query(
      `SELECT name, phone, relationship, priority
       FROM emergency_contacts
       WHERE profile_id = $1
       ORDER BY priority ASC`,
      [card.id]
    );

    res.json({
      success: true,
      card: {
        ...mapCardWithAdditionalInfo(card),
        contacts: contacts.rows
      }
    });

  } catch (error) {
    console.error('Error fetching public card:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении карты',
      error: error.message
    });
  }
});

// Генерация PDF карты (обе стороны)
router.get('/:id/pdf/both', authenticateToken, async (req, res) => {
  console.log('=== PDF BOTH SIDES REQUEST ===');
  console.log('User ID:', req.user?.id);
  console.log('Profile ID:', req.params.id);
  
  try {
    const userId = req.user.id;
    const profileId = parseInt(req.params.id);
    
    // Получаем данные карты
    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.birth_date,
        p.photo,
        p.unique_code,
        mp.blood_type,
        mp.rh_factor,
        mp.allergies,
        mp.chronic_diseases,
        mp.medications,
        mp.is_public
      FROM profiles p
      LEFT JOIN medical_profiles mp ON p.id = mp.profile_id
      WHERE p.id = $1 AND p.user_id = $2`,
      [profileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Карта не найдена'
      });
    }

    const card = result.rows[0];

    // Получаем контакты
    const contacts = await pool.query(
      `SELECT name, phone, relationship, priority
       FROM emergency_contacts
       WHERE profile_id = $1
       ORDER BY priority ASC`,
      [card.id]
    );

    // Подготавливаем данные для PDF
    const cardData = {
      lastName: card.last_name || '',
      firstName: card.first_name || '',
      middleName: card.middle_name || '',
      photo: card.photo || null,
      uniqueCode: card.unique_code || '',
      contacts: contacts.rows || [],
      bloodType: card.blood_type || '',
      rhFactor: card.rh_factor || '',
      allergies: card.allergies || '',
      chronicDiseases: card.chronic_diseases || ''
    };

    console.log('Generating PDF with both sides...');
    // Генерируем PDF с обеими сторонами
    const pdfBuffer = await generateCardPDFBothSides(cardData);
    console.log('PDF generated, size:', pdfBuffer.length);

    // Отправляем PDF
    const fileName = `card-${card.last_name || 'help'}.pdf`;
    const encodedFileName = encodeURIComponent(fileName);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
    res.send(pdfBuffer);
    console.log('PDF sent successfully');

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при генерации PDF',
      error: error.message
    });
  }
});

// Генерация PDF карты (лицевая сторона)
router.get('/:id/pdf/front', authenticateToken, async (req, res) => {
  console.log('=== PDF FRONT REQUEST ===');
  console.log('User ID:', req.user?.id);
  console.log('Profile ID:', req.params.id);
  
  try {
    const userId = req.user.id;
    const profileId = parseInt(req.params.id);
    
    // Получаем данные карты
    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.birth_date,
        p.photo,
        p.unique_code,
        mp.blood_type,
        mp.rh_factor,
        mp.allergies,
        mp.chronic_diseases,
        mp.medications,
        mp.is_public
      FROM profiles p
      LEFT JOIN medical_profiles mp ON p.id = mp.profile_id
      WHERE p.id = $1 AND p.user_id = $2`,
      [profileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Карта не найдена'
      });
    }

    const card = result.rows[0];

    // Получаем контакты
    const contacts = await pool.query(
      `SELECT name, phone, relationship, priority
       FROM emergency_contacts
       WHERE profile_id = $1
       ORDER BY priority ASC`,
      [card.id]
    );

    // Подготавливаем данные для PDF
    const cardData = {
      lastName: card.last_name || '',
      firstName: card.first_name || '',
      middleName: card.middle_name || '',
      photo: card.photo || null,
      uniqueCode: card.unique_code || '',
      contacts: contacts.rows || []
    };

    console.log('Generating PDF...');
    // Генерируем PDF
    const pdfBuffer = await generateCardPDF(cardData, 'front');
    console.log('PDF generated, size:', pdfBuffer.length);

    // Отправляем PDF
    const fileName = `card-front-${card.last_name || 'help'}.pdf`;
    const encodedFileName = encodeURIComponent(fileName);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
    res.send(pdfBuffer);
    console.log('PDF sent successfully');

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при генерации PDF',
      error: error.message
    });
  }
});

// Генерация PDF карты (обратная сторона)
router.get('/:id/pdf/back', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profileId = parseInt(req.params.id);
    
    // Получаем данные карты
    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.unique_code,
        mp.blood_type,
        mp.rh_factor,
        mp.allergies,
        mp.chronic_diseases
      FROM profiles p
      LEFT JOIN medical_profiles mp ON p.id = mp.profile_id
      WHERE p.id = $1 AND p.user_id = $2`,
      [profileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Карта не найдена'
      });
    }

    const card = result.rows[0];

    // Подготавливаем данные для PDF
    const cardData = {
      bloodType: card.blood_type || '',
      rhFactor: card.rh_factor || '',
      allergies: card.allergies || '',
      chronicDiseases: card.chronic_diseases || '',
      uniqueCode: card.unique_code || ''
    };

    // Генерируем PDF
    const pdfBuffer = await generateCardPDF(cardData, 'back');

    // Отправляем PDF
    const fileName = `card-back-${card.last_name || 'help'}.pdf`;
    const encodedFileName = encodeURIComponent(fileName);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при генерации PDF',
      error: error.message
    });
  }
});

// Генерация SVG карты (лицевая сторона)
router.get('/:id/svg/front', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profileId = parseInt(req.params.id);
    
    // Получаем данные карты
    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.birth_date,
        p.photo,
        p.unique_code,
        mp.blood_type,
        mp.rh_factor,
        mp.allergies,
        mp.chronic_diseases,
        mp.medications,
        mp.is_public
      FROM profiles p
      LEFT JOIN medical_profiles mp ON p.id = mp.profile_id
      WHERE p.id = $1 AND p.user_id = $2`,
      [profileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Карта не найдена'
      });
    }
    const card = result.rows[0];

    // Получаем контакты
    const contacts = await pool.query(
      `SELECT name, phone, relationship, priority
       FROM emergency_contacts
       WHERE profile_id = $1
       ORDER BY priority ASC`,
      [card.id]
    );
    // Подготавливаем данные для SVG
    const cardData = {
      lastName: card.last_name || '',
      firstName: card.first_name || '',
      middleName: card.middle_name || '',
      photo: card.photo || null,
      uniqueCode: card.unique_code || '',
      contacts: contacts.rows || []
    };

    // Генерируем SVG
    const svgContent = await generateCardSVG(cardData, 'front');

    // Отправляем SVG
    const fileName = `card-front-${card.last_name || 'help'}.svg`;
    const encodedFileName = encodeURIComponent(fileName);
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
    res.send(svgContent);

  } catch (error) {
    console.error('Error generating SVG:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при генерации SVG',
      error: error.message
    });
  }
});

// Генерация SVG карты (обратная сторона)
router.get('/:id/svg/back', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profileId = parseInt(req.params.id);
    
    // Получаем данные карты
    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.unique_code,
        mp.blood_type,
        mp.rh_factor,
        mp.allergies,
        mp.chronic_diseases
      FROM profiles p
      LEFT JOIN medical_profiles mp ON p.id = mp.profile_id
      WHERE p.id = $1 AND p.user_id = $2`,
      [profileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Карта не найдена'
      });
    }

    const card = result.rows[0];

    // Подготавливаем данные для SVG
    const cardData = {
      bloodType: card.blood_type || '',
      rhFactor: card.rh_factor || '',
      allergies: card.allergies || '',
      chronicDiseases: card.chronic_diseases || '',
      uniqueCode: card.unique_code || ''
    };

    // Генерируем SVG
    const svgContent = await generateCardSVG(cardData, 'back');

    // Отправляем SVG
    const fileName = `card-back-${card.last_name || 'help'}.svg`;
    const encodedFileName = encodeURIComponent(fileName);
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
    res.send(svgContent);

  } catch (error) {
    console.error('Error generating SVG:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при генерации SVG',
      error: error.message
    });
  }
});

// Генерация PNG карты (лицевая сторона) из единого SVG-шаблона
router.get('/:id/png/front', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profileId = parseInt(req.params.id);

    const result = await pool.query(
      `SELECT 
        p.id,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.photo,
        p.unique_code
      FROM profiles p
      WHERE p.id = $1 AND p.user_id = $2`,
      [profileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Карта не найдена'
      });
    }

    const card = result.rows[0];

    const contacts = await pool.query(
      `SELECT name, phone, relationship, priority
       FROM emergency_contacts
       WHERE profile_id = $1
       ORDER BY priority ASC`,
      [card.id]
    );

    const cardData = {
      lastName: card.last_name || '',
      firstName: card.first_name || '',
      middleName: card.middle_name || '',
      photo: card.photo || null,
      uniqueCode: card.unique_code || '',
      contacts: contacts.rows || []
    };

    const pngBuffer = await generateCardPNG(cardData, 'front');
    const fileName = `card-front-${card.last_name || 'help'}.png`;
    const encodedFileName = encodeURIComponent(fileName);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
    res.send(pngBuffer);
  } catch (error) {
    console.error('Error generating front PNG:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при генерации PNG',
      error: error.message
    });
  }
});

// Генерация PNG карты (обратная сторона) из единого SVG-шаблона
router.get('/:id/png/back', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profileId = parseInt(req.params.id);

    const result = await pool.query(
      `SELECT 
        p.id,
        p.last_name,
        p.unique_code,
        mp.blood_type,
        mp.rh_factor,
        mp.allergies,
        mp.chronic_diseases
      FROM profiles p
      LEFT JOIN medical_profiles mp ON p.id = mp.profile_id
      WHERE p.id = $1 AND p.user_id = $2`,
      [profileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Карта не найдена'
      });
    }

    const card = result.rows[0];

    const cardData = {
      bloodType: card.blood_type || '',
      rhFactor: card.rh_factor || '',
      allergies: card.allergies || '',
      chronicDiseases: card.chronic_diseases || '',
      uniqueCode: card.unique_code || 'preview'
    };

    const pngBuffer = await generateCardPNG(cardData, 'back');
    const fileName = `card-back-${card.last_name || 'help'}.png`;
    const encodedFileName = encodeURIComponent(fileName);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
    res.send(pngBuffer);
  } catch (error) {
    console.error('Error generating back PNG:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при генерации PNG',
      error: error.message
    });
  }
});

// Генерация PNG с обеими сторонами карты
router.get('/:id/png/both', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profileId = parseInt(req.params.id);

    const result = await pool.query(
      `SELECT 
        p.id,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.photo,
        p.unique_code,
        mp.blood_type,
        mp.rh_factor,
        mp.allergies,
        mp.chronic_diseases
      FROM profiles p
      LEFT JOIN medical_profiles mp ON p.id = mp.profile_id
      WHERE p.id = $1 AND p.user_id = $2`,
      [profileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Карта не найдена'
      });
    }

    const card = result.rows[0];

    const contacts = await pool.query(
      `SELECT name, phone, relationship, priority
       FROM emergency_contacts
       WHERE profile_id = $1
       ORDER BY priority ASC`,
      [card.id]
    );

    const cardData = {
      lastName: card.last_name || '',
      firstName: card.first_name || '',
      middleName: card.middle_name || '',
      photo: card.photo || null,
      uniqueCode: card.unique_code || '',
      contacts: contacts.rows || [],
      bloodType: card.blood_type || '',
      rhFactor: card.rh_factor || '',
      allergies: card.allergies || '',
      chronicDiseases: card.chronic_diseases || ''
    };

    const pngBuffer = await generateCardPNGBothSides(cardData);
    const fileName = `card-both-${card.last_name || 'help'}.png`;
    const encodedFileName = encodeURIComponent(fileName);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
    res.send(pngBuffer);
  } catch (error) {
    console.error('Error generating both sides PNG:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при генерации PNG',
      error: error.message
    });
  }
});

export default router;
