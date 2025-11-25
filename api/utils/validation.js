/**
 * Shared validation utilities for API endpoints
 */

const MAX_TEXT_LENGTH = 5000;

/**
 * Validate analyze request payload
 * @param {Object} body - Request body containing text and models
 * @returns {{ valid: boolean, error?: { status: number, message: string, code: string } }}
 */
function validateAnalyzeRequest(body) {
  const { text, models } = body || {};

  if (!text || typeof text !== 'string') {
    return {
      valid: false,
      error: {
        status: 400,
        message: 'Text is required and must be a string',
        code: 'INVALID_INPUT'
      }
    };
  }

  if (text.trim().length === 0) {
    return {
      valid: false,
      error: {
        status: 400,
        message: 'Text cannot be empty',
        code: 'EMPTY_TEXT'
      }
    };
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return {
      valid: false,
      error: {
        status: 400,
        message: `Text exceeds maximum length (${MAX_TEXT_LENGTH} characters)`,
        code: 'TEXT_TOO_LONG'
      }
    };
  }

  if (models && !Array.isArray(models)) {
    return {
      valid: false,
      error: {
        status: 400,
        message: 'Models must be an array',
        code: 'INVALID_MODELS'
      }
    };
  }

  return { valid: true };
}

/**
 * Handle common API errors and return appropriate response
 * @param {Error} error - The error object
 * @returns {{ status: number, message: string, code: string }}
 */
function handleApiError(error) {
  if (error.status === 429) {
    return {
      status: 429,
      message: 'Too many requests. Please try again in a moment.',
      code: 'RATE_LIMIT'
    };
  }

  return {
    status: 503,
    message: 'Service temporarily unavailable. Please try again.',
    code: 'SERVICE_ERROR'
  };
}

module.exports = {
  validateAnalyzeRequest,
  handleApiError,
  MAX_TEXT_LENGTH
};
