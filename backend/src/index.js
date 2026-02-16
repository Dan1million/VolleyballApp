require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const locationRoutes = require('./routes/locations');
const courtRoutes = require('./routes/courts');

const app = express();
const PORT = process.env.PORT || 3000;

// ----- Middleware -----

// CORS - allow Angular dev server
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Session store in MySQL
const sessionStoreOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'volleyball_app',
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 min
  expiration: 86400000, // 24 hours
  createDatabaseTable: true,
};

const sessionStore = new MySQLStore(sessionStoreOptions);

app.use(session({
  key: 'volleyball_sid',
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000, // 24 hours
    httpOnly: true,
    secure: false, // set to true in production with HTTPS
    sameSite: 'lax',
  },
}));

// ----- Routes -----
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/courts', courtRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ----- Start Server -----
app.listen(PORT, () => {
  console.log(`Volleyball API server running on http://localhost:${PORT}`);
});

module.exports = app;
