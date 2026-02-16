const express = require('express');
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/courts - list courts, optionally filter by location
router.get('/', async (req, res) => {
  try {
    const { locationId } = req.query;
    let query = `
      SELECT c.id, c.name, c.court_type, c.is_indoor, c.surface_type,
             c.location_id, l.name as location_name, l.address as location_address
      FROM courts c
      JOIN locations l ON c.location_id = l.id
    `;
    const params = [];

    if (locationId) {
      query += ' WHERE c.location_id = ?';
      params.push(locationId);
    }

    query += ' ORDER BY l.name, c.name';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get courts error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/courts - create a court at a location
router.post('/', requireAuth, async (req, res) => {
  try {
    const { locationId, name, courtType, isIndoor, surfaceType } = req.body;

    if (!locationId || !name) {
      return res.status(400).json({ error: 'Location ID and name are required.' });
    }

    // Verify location exists
    const [locations] = await pool.query('SELECT id FROM locations WHERE id = ?', [locationId]);
    if (locations.length === 0) {
      return res.status(404).json({ error: 'Location not found.' });
    }

    const [result] = await pool.query(
      `INSERT INTO courts (location_id, name, court_type, is_indoor, surface_type)
       VALUES (?, ?, ?, ?, ?)`,
      [locationId, name, courtType || 'outdoor', isIndoor ? 1 : 0, surfaceType || 'sand']
    );

    res.status(201).json({
      id: result.insertId,
      locationId,
      name,
      courtType: courtType || 'outdoor',
      isIndoor: isIndoor || false,
      surfaceType: surfaceType || 'sand',
    });
  } catch (error) {
    console.error('Create court error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
