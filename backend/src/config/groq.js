'use strict';

const Groq = require('groq-sdk');

/**
 * Free-tier models used:
 *   - Primary:  llama-3.3-70b-versatile   (higher quality, slower, lower rate limits)
 *   - Fallback: llama-3.1-8b-instant      (faster, higher rate limits, used if primary fails)
 */

const PRIMARY_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'llama-3.1-8b-instant';

let groqClient = null;
let aiEnabled = Boolean(process.env.GROQ_API_KEY);

if (!aiEnabled) {
  console.warn(
    '[AI] GROQ_API_KEY not set. AI features (auto-classification, KB recommendations) will be disabled.'
  );
} else {
  try {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
      maxRetries: 2,
      timeout: 20000, 
    });
    console.log('[AI] Groq client initialized.');
  } catch (err) {
    console.error('[AI] Failed to initialize Groq client:', err.message);
    aiEnabled = false;
  }
}

/**
 * Returns the initialized Groq client instance, or null if AI is disabled.
 */
const getGroqClient = () => groqClient;

/**
 * Returns whether AI features are currently enabled/configured.
 */
const isAIEnabled = () => aiEnabled && groqClient !== null;

module.exports = {
  getGroqClient,
  isAIEnabled,
  PRIMARY_MODEL,
  FALLBACK_MODEL,
};