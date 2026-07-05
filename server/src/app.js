const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');

const logger = require('./utils/logger');
const ApiError = require('./utils/ApiError');
const errorHandler = require('./middleware/errorHandler.middleware');

// Route imports
const routes = require('./routes/index');

const app = express();

// 1. Security HTTP headers
app.use(helmet());
// Allow images from Cloudinary, etc., adjust CSP as needed
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "res.cloudinary.com"],
  },
}));

// 2. CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
  credentials: true, // Allow cookies
}));

// 3. Request logger (Morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Use custom stream for winston
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// 4. Rate Limiting
const limiter = rateLimit({
  max: 1000, // 1000 requests per IP per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes',
});
app.use('/api', limiter);

// 5. Body parser (limit payload size)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 6. Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// 7. Data Sanitization against XSS
app.use(xss());

// 8. Prevent HTTP Parameter Pollution
app.use(hpp());

// 9. Compress responses
app.use(compression());

// Static files (temp uploads, etc)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Suncity ERP API is running' });
});

// ─── Unhandled Routes ───────────────────────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
