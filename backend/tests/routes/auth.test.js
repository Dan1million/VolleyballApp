const request = require('supertest');
const { createTestApp } = require('../helpers');

// ── Mock the database pool ──
const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({
  query: mockQuery,
}));

// ── Mock bcryptjs ──
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));
const bcrypt = require('bcryptjs');

const authRoutes = require('../../src/routes/auth');

const app = createTestApp((a) => {
  a.use('/api/auth', authRoutes);
});

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────── POST /api/auth/register ────────────
  describe('POST /api/auth/register', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' }); // no password, no names

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(res.status).toBe(400);
    });

    it('should return 409 if email already exists', async () => {
      // First query (check existing) returns a result
      mockQuery.mockResolvedValueOnce([[{ id: 1 }]]);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'taken@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    it('should register a new user successfully', async () => {
      // First query (check existing) → no results
      mockQuery.mockResolvedValueOnce([[]]);
      // Second query (insert) → insertId
      mockQuery.mockResolvedValueOnce([{ insertId: 42 }]);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'new@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('new@example.com');
      expect(res.body.user.firstName).toBe('Test');
      expect(res.body.user.id).toBe(42);
    });

    it('should strip HTML from names', async () => {
      mockQuery.mockResolvedValueOnce([[]]);
      mockQuery.mockResolvedValueOnce([{ insertId: 10 }]);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'xss@example.com',
          password: 'password123',
          firstName: '<script>alert("xss")</script>John',
          lastName: '<b>Doe</b>',
        });

      expect(res.status).toBe(201);
      expect(res.body.user.firstName).toBe('alert("xss")John');
      expect(res.body.user.lastName).toBe('Doe');
    });
  });

  // ──────────── POST /api/auth/login ────────────
  describe('POST /api/auth/login', () => {
    it('should return 400 if email or password missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
    });

    it('should return 401 for non-existent user', async () => {
      mockQuery.mockResolvedValueOnce([[]]); // no user found

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid');
    });

    it('should return 401 for wrong password', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User',
        date_of_birth: null,
        created_at: '2025-01-01',
      }]]);
      bcrypt.compare.mockResolvedValueOnce(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(res.status).toBe(401);
    });

    it('should login successfully with correct credentials', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User',
        date_of_birth: null,
        created_at: '2025-01-01',
      }]]);
      bcrypt.compare.mockResolvedValueOnce(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.firstName).toBe('Test');
    });
  });

  // ──────────── POST /api/auth/logout ────────────
  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Logged out');
    });
  });

  // ──────────── GET /api/auth/me ────────────
  describe('GET /api/auth/me', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should return user when authenticated', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        date_of_birth: null,
        created_at: '2025-01-01',
      }]]);

      const res = await request(app)
        .get('/api/auth/me')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should return 404 if user not found in database', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .get('/api/auth/me')
        .set('X-Test-User-Id', '999');

      expect(res.status).toBe(404);
    });
  });
});
