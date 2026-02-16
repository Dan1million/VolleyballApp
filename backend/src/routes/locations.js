const express = require('express');
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { sanitizeText } = require('../middleware/sanitize');

const router = express.Router();

// GET /api/locations - list all locations
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, address, city, state, zip_code, latitude, longitude, created_at FROM locations ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/locations/:id - get location with its courts
router.get('/:id', async (req, res) => {
  try {
    const [locations] = await pool.query(
      'SELECT id, name, address, city, state, zip_code, latitude, longitude, created_at FROM locations WHERE id = ?',
      [req.params.id]
    );

    if (locations.length === 0) {
      return res.status(404).json({ error: 'Location not found.' });
    }

    const [courts] = await pool.query(
      'SELECT id, name, court_type, is_indoor, surface_type FROM courts WHERE location_id = ? ORDER BY name',
      [req.params.id]
    );

    res.json({ ...locations[0], courts });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/locations - create a new location
router.post('/', requireAuth, async (req, res) => {
  try {
    const name = sanitizeText(req.body.name, 255);
    const address = sanitizeText(req.body.address, 500);
    const city = sanitizeText(req.body.city, 100);
    const state = sanitizeText(req.body.state, 50);
    const { zipCode, latitude, longitude } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO locations (name, address, city, state, zip_code, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, address, city || null, state || null, zipCode || null, latitude || null, longitude || null]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
