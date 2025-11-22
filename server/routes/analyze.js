const express = require('express');
const { analyzeText } = require('../services/claude');

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: true,
        message: 'Text is required and must be a string',
        code: 'INVALID_INPUT'
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Text cannot be empty',
        code: 'EMPTY_TEXT'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        error: true,
        message: 'Text exceeds maximum length (5000 characters)',
        code: 'TEXT_TOO_LONG'
      });
    }

    // Call Claude API
    const result = await analyzeText(text);

    // Return result with original text
    res.json({
      original: text,
      ...result
    });

  } catch (error) {
    console.error('Error in /api/analyze:', error);

    if (error.status === 429) {
      return res.status(429).json({
        error: true,
        message: 'Too many requests. Please try again in a moment.',
        code: 'RATE_LIMIT'
      });
    }

    res.status(503).json({
      error: true,
      message: 'Service temporarily unavailable. Please try again.',
      code: 'SERVICE_ERROR'
    });
  }
});

module.exports = router;
