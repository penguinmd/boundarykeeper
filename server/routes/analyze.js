const express = require('express');
const providerManager = require('../services/providerManager');
const { validateAnalyzeRequest, handleApiError } = require('../utils/validation');

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    // Validate request
    const validation = validateAnalyzeRequest(req.body);
    if (!validation.valid) {
      return res.status(validation.error.status).json({
        error: true,
        message: validation.error.message,
        code: validation.error.code
      });
    }

    const { text, models } = req.body;

    // Analyze with multiple models
    const results = await providerManager.analyzeWithMultipleModels(models, text);

    // Return results with original text
    res.json({
      original: text,
      results
    });

  } catch (error) {
    console.error('Error in /api/analyze:', error);
    const errorResponse = handleApiError(error);
    res.status(errorResponse.status).json({
      error: true,
      message: errorResponse.message,
      code: errorResponse.code
    });
  }
});

module.exports = router;
