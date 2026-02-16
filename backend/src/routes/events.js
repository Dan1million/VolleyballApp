const express = require('express');
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/events - search events with filters
router.get('/', async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radiusMiles,
      startDate,
      endDate,
      sortBy,
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];

    let distanceSelect = '';
    let distanceJoin = '';
    let distanceWhere = '';
    let orderBy = 'e.created_at DESC';

    // Base query
    let query = `
      SELECT e.id, e.title, e.description, e.event_date, e.max_players,
             e.skill_level, e.created_at,
             e.creator_id,
             u.first_name as creator_first_name, u.last_name as creator_last_name,
             c.id as court_id, c.name as court_name, c.court_type, c.is_indoor, c.surface_type,
             l.id as location_id, l.name as location_name, l.address as location_address,
             l.city as location_city, l.state as location_state,
             l.latitude, l.longitude,
             (SELECT COUNT(*) FROM event_signups es WHERE es.event_id = e.id) as signup_count
    `;

    // If proximity search, add distance calculation using Haversine formula
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      distanceSelect = `,
        (3959 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(l.latitude)) *
          COS(RADIANS(l.longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(l.latitude))
        )) AS distance_miles`;
      params.push(lat, lng, lat);

      query += distanceSelect;

      if (radiusMiles) {
        distanceWhere = ` AND (3959 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(l.latitude)) *
          COS(RADIANS(l.longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(l.latitude))
        )) <= ?`;
      }
    }

    query += `
      FROM events e
      JOIN users u ON e.creator_id = u.id
      JOIN courts c ON e.court_id = c.id
      JOIN locations l ON c.location_id = l.id
      WHERE 1=1
    `;

    // Date filters
    if (startDate) {
      query += ' AND e.event_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND e.event_date <= ?';
      params.push(endDate);
    }

    // Only show future events by default
    query += ' AND e.event_date >= NOW()';

    // Proximity filter
    if (distanceWhere) {
      query += distanceWhere;
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      params.push(lat, lng, lat, parseFloat(radiusMiles));
    }

    // Sorting
    if (sortBy === 'date') {
      orderBy = 'e.event_date ASC';
    } else if (sortBy === 'created') {
      orderBy = 'e.created_at DESC';
    } else if (sortBy === 'distance' && latitude && longitude) {
      orderBy = 'distance_miles ASC';
    }

    query += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM events e
      JOIN courts c ON e.court_id = c.id
      JOIN locations l ON c.location_id = l.id
      WHERE 1=1 AND e.event_date >= NOW()
    `;
    const countParams = [];

    if (startDate) {
      countQuery += ' AND e.event_date >= ?';
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ' AND e.event_date <= ?';
      countParams.push(endDate);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      events: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/events/:id - get single event with details
router.get('/:id', async (req, res) => {
  try {
    const [events] = await pool.query(
      `SELECT e.id, e.title, e.description, e.event_date, e.max_players,
              e.skill_level, e.created_at,
              e.creator_id,
              u.first_name as creator_first_name, u.last_name as creator_last_name,
              c.id as court_id, c.name as court_name, c.court_type, c.is_indoor, c.surface_type,
              l.id as location_id, l.name as location_name, l.address as location_address,
              l.city as location_city, l.state as location_state,
              l.latitude, l.longitude
       FROM events e
       JOIN users u ON e.creator_id = u.id
       JOIN courts c ON e.court_id = c.id
       JOIN locations l ON c.location_id = l.id
       WHERE e.id = ?`,
      [req.params.id]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Get signups
    const [signups] = await pool.query(
      `SELECT es.id, es.created_at as signed_up_at,
              u.id as user_id, u.first_name, u.last_name
       FROM event_signups es
       JOIN users u ON es.user_id = u.id
       WHERE es.event_id = ?
       ORDER BY es.created_at`,
      [req.params.id]
    );

    res.json({
      ...events[0],
      signups,
      signupCount: signups.length,
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/events - create a new event
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, courtId, eventDate, maxPlayers, skillLevel } = req.body;

    if (!title || !courtId || !eventDate) {
      return res.status(400).json({ error: 'Title, court, and event date are required.' });
    }

    // Verify court exists
    const [courts] = await pool.query('SELECT id FROM courts WHERE id = ?', [courtId]);
    if (courts.length === 0) {
      return res.status(404).json({ error: 'Court not found.' });
    }

    // Convert ISO 8601 datetime to MySQL DATETIME format
    const mysqlDate = new Date(eventDate)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const [result] = await pool.query(
      `INSERT INTO events (creator_id, court_id, title, description, event_date, max_players, skill_level)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.session.userId,
        courtId,
        title,
        description || null,
        mysqlDate,
        maxPlayers || 12,
        skillLevel || 'all',
      ]
    );

    // Auto-signup the creator
    await pool.query(
      'INSERT INTO event_signups (event_id, user_id) VALUES (?, ?)',
      [result.insertId, req.session.userId]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      courtId,
      eventDate,
      maxPlayers: maxPlayers || 12,
      skillLevel: skillLevel || 'all',
      creatorId: req.session.userId,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/events/:id/signup - sign up for an event
router.post('/:id/signup', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.session.userId;

    // Check event exists
    const [events] = await pool.query(
      'SELECT id, max_players, event_date FROM events WHERE id = ?',
      [eventId]
    );
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Check if event is in the past
    if (new Date(events[0].event_date) < new Date()) {
      return res.status(400).json({ error: 'Cannot sign up for past events.' });
    }

    // Check if already signed up
    const [existing] = await pool.query(
      'SELECT id FROM event_signups WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'You are already signed up for this event.' });
    }

    // Check max players
    const [signupCount] = await pool.query(
      'SELECT COUNT(*) as count FROM event_signups WHERE event_id = ?',
      [eventId]
    );
    if (signupCount[0].count >= events[0].max_players) {
      return res.status(400).json({ error: 'This event is full.' });
    }

    await pool.query(
      'INSERT INTO event_signups (event_id, user_id) VALUES (?, ?)',
      [eventId, userId]
    );

    res.status(201).json({ message: 'Successfully signed up for the event.' });
  } catch (error) {
    console.error('Event signup error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/events/:id/signup - cancel signup for an event
router.delete('/:id/signup', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.session.userId;

    const [result] = await pool.query(
      'DELETE FROM event_signups WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'You are not signed up for this event.' });
    }

    res.json({ message: 'Successfully cancelled signup.' });
  } catch (error) {
    console.error('Cancel signup error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
