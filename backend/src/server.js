'use strict';

require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = require('./app');
const { connectDB } = require('./config/db');
const { startSLAEscalationJob } = require('./jobs/slaEscalation.job');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('[Server] Database connected successfully.');

    startSLAEscalationJob();

    const server = app.listen(PORT, () => {
      console.log(`[Server] ServiceDesk Pro API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    process.on('unhandledRejection', (err) => {
      console.error('[Server] Unhandled Promise Rejection:', err.message);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      console.error('[Server] Uncaught Exception:', err.message);
      process.exit(1);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
};

startServer();