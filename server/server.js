require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const analyzeRoute = require('./routes/analyze');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173'
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', analyzeRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: 'Internal server error',
    code: 'SERVER_ERROR'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
