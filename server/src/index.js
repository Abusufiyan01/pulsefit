/**
 * PulseFit Server Entry Point
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');
const { errorResponse, successResponse } = require('./utils/apiResponse');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (skip if running in test environment and managed by tests)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || origin === allowedOrigin || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed for this origin.'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection & XSS
app.use(mongoSanitize());
app.use(xss());

// Static file serving for uploads (progress photos, avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/v1/health', (_req, res) => {
  return successResponse(
    res,
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    },
    'PulseFit API is fully operational'
  );
});

// API Root Router
app.use('/api/v1', apiRoutes);

// Catch 404 for unhandled routes
app.use('*', (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found on this server`, 404);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Server startup
let server = null;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`[PulseFit Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[PulseFit Server] Base API URL: http://localhost:${PORT}/api/v1`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
  });
}

module.exports = app;
