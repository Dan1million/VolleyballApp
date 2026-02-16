/**
 * Shared test helpers for backend API tests.
 *
 * Creates a stripped-down Express app for supertest that mocks the session
 * middleware so we can simulate logged-in / logged-out users without needing
 * a real MySQL session store.
 */
const express = require('express');

/**
 * Build a minimal Express app with session mocking and JSON parsing.
 * @param {Function} routeSetup - receives the app so the caller can mount routes
 * @returns {express.Express}
 */
function createTestApp(routeSetup) {
  const app = express();
  app.use(express.json());

  // Simple mock session middleware – stores session on req
  app.use((req, _res, next) => {
    if (!req.session) {
      req.session = {};
    }
    // Allow tests to set userId via a header for convenience
    const mockUserId = req.headers['x-test-user-id'];
    if (mockUserId) {
      req.session.userId = parseInt(mockUserId);
    }
    // Add a destroy method so logout works
    req.session.destroy = (cb) => {
      req.session = {};
      cb(null);
    };
    next();
  });

  routeSetup(app);
  return app;
}

module.exports = { createTestApp };
