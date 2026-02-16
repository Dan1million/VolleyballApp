const request = require('supertest');
const { createTestApp } = require('../helpers');

// ── Mock the database pool ──
const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({
  query: mockQuery,
}));

const eventRoutes = require('../../src/routes/events');

const app = createTestApp((a) => {
  a.use('/api/events', eventRoutes);
});

// Helper to build a mock event row
function mockEvent(overrides = {}) {
  return {
    id: 1,
    title: 'Beach Volleyball',
    description: 'Fun game',
    event_date: '2026-06-15 14:00:00',
    max_players: 12,
    skill_level: 'all',
    created_at: '2025-01-01',
    creator_id: 1,
    creator_first_name: 'Test',
    creator_last_name: 'User',
    court_id: 1,
    court_name: 'Court A',
    court_type: 'beach',
    is_indoor: 0,
    surface_type: 'sand',
    location_id: 1,
    location_name: 'Beach Park',
    location_address: '123 Beach Dr',
    location_city: 'Miami',
    location_state: 'FL',
    latitude: 25.76,
    longitude: -80.19,
    signup_count: 3,
    ...overrides,
  };
}

describe('Event Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────── GET /api/events ────────────
  describe('GET /api/events', () => {
    it('should return a list of events with pagination', async () => {
      mockQuery
        .mockResolvedValueOnce([[mockEvent(), mockEvent({ id: 2, title: 'Indoor Game' })]])
        .mockResolvedValueOnce([[{ total: 2 }]]);

      const res = await request(app).get('/api/events');

      expect(res.status).toBe(200);
      expect(res.body.events).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(2);
    });

    it('should return empty list when no events match', async () => {
      mockQuery
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[{ total: 0 }]]);

      const res = await request(app).get('/api/events');

      expect(res.status).toBe(200);
      expect(res.body.events).toHaveLength(0);
    });

    it('should reject invalid sortBy values (SQL injection prevention)', async () => {
      mockQuery
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[{ total: 0 }]]);

      const res = await request(app)
        .get('/api/events')
        .query({ sortBy: 'id; DROP TABLE events;--' });

      expect(res.status).toBe(200);
      // The malicious sortBy should have been ignored (defaulted to 'created')
      // and not caused an error
    });
  });

  // ──────────── GET /api/events/my ────────────
  describe('GET /api/events/my', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/events/my');
      expect(res.status).toBe(401);
    });

    it('should return the users events', async () => {
      mockQuery.mockResolvedValueOnce([[
        mockEvent({ is_organizer: 1 }),
        mockEvent({ id: 2, title: 'Signed up game', is_organizer: 0 }),
      ]]);

      const res = await request(app)
        .get('/api/events/my')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(200);
      expect(res.body.events).toHaveLength(2);
      expect(res.body.events[0].is_organizer).toBe(1);
      expect(res.body.events[1].is_organizer).toBe(0);
    });
  });

  // ──────────── GET /api/events/:id ────────────
  describe('GET /api/events/:id', () => {
    it('should return event details with signups', async () => {
      mockQuery
        .mockResolvedValueOnce([[mockEvent()]])
        .mockResolvedValueOnce([[
          { id: 1, signed_up_at: '2025-06-01', user_id: 1, first_name: 'Test', last_name: 'User' },
        ]]);

      const res = await request(app).get('/api/events/1');

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Beach Volleyball');
      expect(res.body.signups).toHaveLength(1);
      expect(res.body.signupCount).toBe(1);
    });

    it('should return 404 for non-existent event', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/events/999');

      expect(res.status).toBe(404);
    });
  });

  // ──────────── POST /api/events ────────────
  describe('POST /api/events', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({ title: 'Test', courtId: 1, eventDate: '2026-06-15T14:00:00Z' });

      expect(res.status).toBe(401);
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('X-Test-User-Id', '1')
        .send({ title: 'Test' }); // no courtId or eventDate

      expect(res.status).toBe(400);
    });

    it('should create an event successfully', async () => {
      // Court check
      mockQuery.mockResolvedValueOnce([[{ id: 1 }]]);
      // Insert event
      mockQuery.mockResolvedValueOnce([{ insertId: 10 }]);
      // Auto-signup
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/events')
        .set('X-Test-User-Id', '1')
        .send({
          title: 'Beach Bash',
          courtId: 1,
          eventDate: '2026-06-15T14:00:00Z',
          maxPlayers: 8,
          skillLevel: 'intermediate',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(10);
      expect(res.body.title).toBe('Beach Bash');
    });

    it('should sanitize event title and description', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1 }]]);
      mockQuery.mockResolvedValueOnce([{ insertId: 11 }]);
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/events')
        .set('X-Test-User-Id', '1')
        .send({
          title: '<script>alert("xss")</script>Game Day',
          description: '<b>Bold</b> description',
          courtId: 1,
          eventDate: '2026-06-15T14:00:00Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('alert("xss")Game Day');
      expect(res.body.description).toBe('Bold description');
    });

    it('should return 404 if court does not exist', async () => {
      mockQuery.mockResolvedValueOnce([[]]); // court not found

      const res = await request(app)
        .post('/api/events')
        .set('X-Test-User-Id', '1')
        .send({
          title: 'Test',
          courtId: 999,
          eventDate: '2026-06-15T14:00:00Z',
        });

      expect(res.status).toBe(404);
    });

    it('should clamp maxPlayers to valid range', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1 }]]);
      mockQuery.mockResolvedValueOnce([{ insertId: 12 }]);
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/events')
        .set('X-Test-User-Id', '1')
        .send({
          title: 'Clamped Game',
          courtId: 1,
          eventDate: '2026-06-15T14:00:00Z',
          maxPlayers: 500, // exceeds max of 100
        });

      expect(res.status).toBe(201);
      expect(res.body.maxPlayers).toBe(100);
    });

    it('should default invalid skillLevel to "all"', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1 }]]);
      mockQuery.mockResolvedValueOnce([{ insertId: 13 }]);
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/events')
        .set('X-Test-User-Id', '1')
        .send({
          title: 'Skill Test',
          courtId: 1,
          eventDate: '2026-06-15T14:00:00Z',
          skillLevel: 'godlike',
        });

      expect(res.status).toBe(201);
      expect(res.body.skillLevel).toBe('all');
    });
  });

  // ──────────── DELETE /api/events/:id ────────────
  describe('DELETE /api/events/:id', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).delete('/api/events/1');
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent event', async () => {
      mockQuery.mockResolvedValueOnce([[]]); // event not found

      const res = await request(app)
        .delete('/api/events/999')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(404);
    });

    it('should return 403 if user is not the event creator', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1, creator_id: 5 }]]); // different creator

      const res = await request(app)
        .delete('/api/events/1')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(403);
    });

    it('should delete event when user is the creator', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1, creator_id: 1 }]]);
      mockQuery.mockResolvedValueOnce([{ affectedRows: 3 }]); // delete signups
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]); // delete event

      const res = await request(app)
        .delete('/api/events/1')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('cancelled');
    });
  });

  // ──────────── POST /api/events/:id/signup ────────────
  describe('POST /api/events/:id/signup', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).post('/api/events/1/signup');
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent event', async () => {
      mockQuery.mockResolvedValueOnce([[]]); // event not found

      const res = await request(app)
        .post('/api/events/1/signup')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(404);
    });

    it('should return 400 for past events', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1,
        max_players: 12,
        event_date: '2020-01-01 10:00:00', // in the past
      }]]);

      const res = await request(app)
        .post('/api/events/1/signup')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('past');
    });

    it('should return 409 if already signed up', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1, max_players: 12, event_date: '2027-06-15 14:00:00',
      }]]);
      mockQuery.mockResolvedValueOnce([[{ id: 1 }]]); // already signed up

      const res = await request(app)
        .post('/api/events/1/signup')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(409);
    });

    it('should return 400 if event is full', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1, max_players: 2, event_date: '2027-06-15 14:00:00',
      }]]);
      mockQuery.mockResolvedValueOnce([[]]); // not signed up
      mockQuery.mockResolvedValueOnce([[{ count: 2 }]]); // full

      const res = await request(app)
        .post('/api/events/1/signup')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('full');
    });

    it('should sign up successfully', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1, max_players: 12, event_date: '2027-06-15 14:00:00',
      }]]);
      mockQuery.mockResolvedValueOnce([[]]); // not signed up
      mockQuery.mockResolvedValueOnce([[{ count: 5 }]]); // not full
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }]); // insert signup

      const res = await request(app)
        .post('/api/events/1/signup')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('signed up');
    });
  });

  // ──────────── DELETE /api/events/:id/signup ────────────
  describe('DELETE /api/events/:id/signup', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).delete('/api/events/1/signup');
      expect(res.status).toBe(401);
    });

    it('should return 404 if not signed up', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .delete('/api/events/1/signup')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(404);
    });

    it('should cancel signup successfully', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .delete('/api/events/1/signup')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('cancelled');
    });
  });
});
