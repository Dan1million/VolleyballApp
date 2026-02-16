const express = require('express');
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { sanitizeText } = require('../middleware/sanitize');

const router = express.Router();

// GET /api/users/me - get current user account info
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, email, first_name, last_name, date_of_birth, created_at
       FROM users WHERE id = ?`,
      [req.session.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      dateOfBirth: user.date_of_birth,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/users/me - update current user account info
router.put('/me', requireAuth, async (req, res) => {
  try {
    const firstName = sanitizeText(req.body.firstName, 100);
    const lastName = sanitizeText(req.body.lastName, 100);
    const { dateOfBirth } = req.body;

    await pool.query(
      `UPDATE users SET first_name = COALESCE(?, first_name),
                        last_name = COALESCE(?, last_name),
                        date_of_birth = COALESCE(?, date_of_birth)
       WHERE id = ?`,
      [firstName, lastName, dateOfBirth, req.session.userId]
    );

    const [rows] = await pool.query(
      `SELECT id, email, first_name, last_name, date_of_birth, created_at
       FROM users WHERE id = ?`,
      [req.session.userId]
    );

    const user = rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      dateOfBirth: user.date_of_birth,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
