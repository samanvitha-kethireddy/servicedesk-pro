'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const aiService = require('../services/ai.service');
const { isAIEnabled } = require('../config/groq');

const classifyPreview = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw ApiError.badRequest('Title and description are required');
  }

  if (!isAIEnabled()) {
    return res.status(200).json(
      new ApiResponse(200, 'AI classification unavailable — using manual defaults', {
        aiEnabled: false,
        suggestion: null,
      })
    );
  }

  const classification = await aiService.classifyTicket(title, description);

  res.status(200).json(new ApiResponse(200, 'Classification generated', {
    aiEnabled: true,
    suggestion: classification,
  }));
});


const recommendKBPreview = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !description) {
    throw ApiError.badRequest('Title and description are required');
  }

  const recommendations = await aiService.recommendKBArticles(title, description, category || null);

  res.status(200).json(new ApiResponse(200, 'KB recommendations generated', { recommendations }));
});

// GET /ai/status
const getAIStatus = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, 'AI status fetched', { enabled: isAIEnabled() }));
});

module.exports = {
  classifyPreview,
  recommendKBPreview,
  getAIStatus,
};