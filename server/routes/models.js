const express = require('express');
const providerManager = require('../services/providerManager');

const router = express.Router();

/**
 * GET /api/models
 * Returns list of available models
 */
router.get('/models', async (req, res) => {
  try {
    const models = providerManager.getAvailableModels();
    res.json({ models });
  } catch (error) {
    console.error('Error getting models:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve models',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
