const dotenv = require('dotenv');
const path = require('path');

// Load environment variables before any other imports
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}\n${err.stack}`);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

let server;

// Connect to DB then start server
connectDB().then(() => {
  server = app.listen(PORT, () => {
    logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});

// Catch unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle Sigterm for graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('💥 Process terminated!');
    });
  }
});
