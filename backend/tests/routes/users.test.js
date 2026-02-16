const request = require('supertest');
const { createTestApp } = require('../helpers');

// ── Mock the database pool ──
const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({
  query: mockQuery,
}));

const userRoutes = require('../../src/routes/users');

const app = createTestApp((a) => {
  a.use('/api/users', userRoutes);
});

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────── GET /api/users/me ────────────
  describe('GET /api/users/me', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });

    it('should return the current user profile', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        date_of_birth: '1990-05-15',
        created_at: '2025-01-01',
      }]]);

      const res = await request(app)
        .get('/api/users/me')
        .set('X-Test-User-Id', '1');

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.firstName).toBe('Test');
      expect(res.body.lastName).toBe('User');
      expect(res.body.dateOfBirth).toBe('1990-05-15');
    });

    it('should return 404 if user not found', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .get('/api/users/me')
        .set('X-Test-User-Id', '999');

      expect(res.status).toBe(404);
    });
  });

  // ──────────── PUT /api/users/me ────────────
  describe('PUT /api/users/me', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .send({ firstName: 'Updated' });

      expect(res.status).toBe(401);
    });

    it('should update user profile and return updated data', async () => {
      // UPDATE query
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // SELECT query after update
      mockQuery.mockResolvedValueOnce([[{
        id: 1,
        email: 'test@example.com',
        first_name: 'Updated',
        last_name: 'Name',
        date_of_birth: '1990-05-15',
        created_at: '2025-01-01',
      }]]);

      const res = await request(app)
        .put('/api/users/me')
        .set('X-Test-User-Id', '1')
        .send({ firstName: 'Updated', lastName: 'Name' });

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe('Updated');
      expect(res.body.lastName).toBe('Name');
    });

    it('should sanitize HTML from name fields', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
      mockQuery.mockResolvedValueOnce([[{
        id: 1,
        email: 'test@example.com',
        first_name: 'Clean',
        last_name: 'Name',
        date_of_birth: null,
        created_at: '2025-01-01',
      }]]);

      const res = await request(app)
        .put('/api/users/me')
        .set('X-Test-User-Id', '1')
        .send({ firstName: '<b>Clean</b>', lastName: '<i>Name</i>' });

      expect(res.status).toBe(200);
      // Verify the UPDATE query received sanitized values
      const updateCall = mockQuery.mock.calls[0];
      expect(updateCall[1][0]).toBe('Clean'); // firstName
      expect(updateCall[1][1]).toBe('Name');  // lastName
    });
  });
});
