const providerManager = require('./services/providerManager');
const { validateAnalyzeRequest, handleApiError } = require('./utils/validation');

module.exports = async (req, res) => {
  // Handle preflight (CORS headers are set in vercel.json)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: true,
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

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
};
