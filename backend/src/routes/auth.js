const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { sanitizeText, sanitizeEmail } = require('../middleware/sanitize');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const { password, dateOfBirth } = req.body;
    const email = sanitizeEmail(rawEmail);
    const firstName = sanitizeText(req.body.firstName, 100);
    const lastName = sanitizeText(req.body.lastName, 100);

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required.' });
    }

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, firstName, lastName, dateOfBirth || null]
    );

    // Set session
    req.session.userId = result.insertId;

    res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || null,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Set session
    req.session.userId = user.id;

    res.json({
      message: 'Login successful.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        dateOfBirth: user.date_of_birth,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to log out.' });
    }
    res.clearCookie('volleyball_sid');
    res.json({ message: 'Logged out successfully.' });
  });
});

// GET /api/auth/me - check current session
router.get('/me', async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, date_of_birth, created_at FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        dateOfBirth: user.date_of_birth,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
