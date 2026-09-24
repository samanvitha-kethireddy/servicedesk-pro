'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const routes = require('./routes/index');
const { mongoSanitize, guardPayloadShape } = require('./middleware/sanitize.middleware');
const { attachAuditLogger } = require('./middleware/audit.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

app.set('trust proxy', 1);

// Security headers
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// req sanitization 
app.use(mongoSanitize);
app.use(guardPayloadShape);

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

//rate limiting (general API protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Attach req.audit() helper to all requests
app.use(attachAuditLogger);

// API routes
app.use('/api/v1', routes);

app.get('/', (_req, res) => {
  res.status(200).json({ success: true, message: 'ServiceDesk Pro API', version: '1.0.0' });
});


app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;