import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadAvatar } from '../utils/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Загрузка аватара
router.post('/avatar', authenticateToken, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const oldAvatar = await pool.query(
      'SELECT avatar FROM users WHERE id = $1',
      [req.userId]
    );

    await pool.query(
      'UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2',
      [avatarPath, req.userId]
    );

    if (oldAvatar.rows[0]?.avatar) {
      const oldFilePath = path.join(__dirname, '..', oldAvatar.rows[0].avatar);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    res.json({
      message: 'Аватар успешно загружен',
      avatar: avatarPath
    });
  } catch (err) {
    console.error('Upload avatar error:', err);
    res.status(500).json({ error: 'Ошибка загрузки аватара' });
  }
});

// Удаление аватара
router.delete('/avatar', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT avatar FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows[0]?.avatar) {
      const filePath = path.join(__dirname, '..', result.rows[0].avatar);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query(
      'UPDATE users SET avatar = NULL, updated_at = NOW() WHERE id = $1',
      [req.userId]
    );

    res.json({ message: 'Аватар удален' });
  } catch (err) {
    console.error('Delete avatar error:', err);
    res.status(500).json({ error: 'Ошибка удаления аватара' });
  }
});

// Обновление профиля
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    await pool.query(
      'UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3',
      [name, email, req.userId]
    );

    const result = await pool.query(
      'SELECT id, name, email, role, avatar FROM users WHERE id = $1',
      [req.userId]
    );

    res.json({
      message: 'Профиль обновлен',
      user: { ...result.rows[0], roles: result.rows[0].role }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
});

export default router;
