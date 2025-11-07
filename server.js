require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');
const uploadRouter = require('./routes/upload');
const fileRouter = require('./routes/file');
const startCleanup = require('./utils/cleanup');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api', uploadRouter);
app.use('/', fileRouter);

// health
app.get('/health', (req, res) => res.json({ ok: true }));

// start
const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0';

const start = async () => {
  await connectDB();
  // start cron cleanup (will only run in main instance)
  startCleanup();
  app.listen(PORT, HOST, () =>
    console.log(`Server running on http://${HOST}:${PORT}`)
  );
};

start();
