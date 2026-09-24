'use strict';

const { getGroqClient, isAIEnabled, PRIMARY_MODEL, FALLBACK_MODEL } = require('../config/groq');
const KnowledgeBaseArticle = require('../models/KnowledgeBaseArticle');
const {
  TICKET_CATEGORY_LIST,
  TICKET_PRIORITY_LIST,
  KB_STATUS,
} = require('../config/constants');

const CLASSIFICATION_SYSTEM_PROMPT = `You are an IT helpdesk ticket triage assistant. Given a ticket title and description, classify it.

Valid categories: ${TICKET_CATEGORY_LIST.join(', ')}
Valid priorities: ${TICKET_PRIORITY_LIST.join(', ')}

Priority guidance:
- Critical: total outage, security breach, data loss, multiple users blocked
- High: single user fully blocked from work, urgent access issue
- Medium: partial functionality issue, workaround exists
- Low: cosmetic issue, minor request, no urgency

Respond ONLY with strict JSON, no markdown, no preamble:
{"category": "<one of the valid categories>", "priority": "<one of the valid priorities>", "confidenceScore": <0 to 1 float>, "reasoning": "<one short sentence>"}`;

const callGroqWithFallback = async (client, messages, jsonMode = true) => {
  const attemptCall = async (model) => {
    return client.chat.completions.create({
      model,
      messages,
      temperature: 0.2,
      max_tokens: 500,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    });
  };

  try {
    const completion = await attemptCall(PRIMARY_MODEL);
    return { completion, modelUsed: PRIMARY_MODEL };
  } catch (primaryErr) {
    console.warn(`[AI] Primary model (${PRIMARY_MODEL}) failed: ${primaryErr.message}. Trying fallback.`);
    const completion = await attemptCall(FALLBACK_MODEL);
    return { completion, modelUsed: FALLBACK_MODEL };
  }
};

const safeParseJSON = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    return null;
  }
};


const classifyTicket = async (title, description) => {
  if (!isAIEnabled()) return null;

  const client = getGroqClient();
  const userMessage = `Ticket Title: ${title}\n\nTicket Description: ${description}`;

  try {
    const { completion, modelUsed } = await callGroqWithFallback(client, [
      { role: 'system', content: CLASSIFICATION_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ]);

    const rawText = completion.choices?.[0]?.message?.content || '';
    const parsed = safeParseJSON(rawText);

    if (!parsed || !TICKET_CATEGORY_LIST.includes(parsed.category) || !TICKET_PRIORITY_LIST.includes(parsed.priority)) {
      console.warn('[AI] Classification response failed schema validation:', rawText);
      return null;
    }

    return {
      suggestedCategory: parsed.category,
      suggestedPriority: parsed.priority,
      confidenceScore: typeof parsed.confidenceScore === 'number' ? Math.min(1, Math.max(0, parsed.confidenceScore)) : 0.5,
      rawModelResponse: rawText,
      modelUsed,
      classifiedAt: new Date(),
    };
  } catch (err) {
    console.error('[AI] Ticket classification failed:', err.message);
    return null;
  }
};

const recommendKBArticles = async (title, description, category, limit = 3) => {
  const candidateFilter = {
    status: KB_STATUS.PUBLISHED,
    isDeleted: false,
  };
  if (category) candidateFilter.category = category;

  const candidates = await KnowledgeBaseArticle.find(candidateFilter)
    .select('_id title summary category')
    .limit(20)
    .lean();

  if (candidates.length === 0) return [];

  if (!isAIEnabled()) {
    // Degrade gracefully: return top candidates by recency without AI ranking
    return candidates.slice(0, limit).map((c) => ({ id: c._id, title: c.title, reason: 'category match' }));
  }

  const client = getGroqClient();
  const candidateList = candidates
    .map((c, i) => `${i + 1}. [id:${c._id}] ${c.title} — ${c.summary || 'No summary'}`)
    .join('\n');

  const systemPrompt = `You are an IT helpdesk assistant matching a support ticket to relevant knowledge base articles.
Given the ticket details and a numbered list of candidate articles, select up to ${limit} MOST relevant article IDs.
Respond ONLY with strict JSON: {"recommendations": [{"id": "<article id>", "reason": "<short reason>"}]}
If none are relevant, return {"recommendations": []}.`;

  const userMessage = `Ticket Title: ${title}\nTicket Description: ${description}\n\nCandidate Articles:\n${candidateList}`;

  try {
    const { completion } = await callGroqWithFallback(client, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);

    const rawText = completion.choices?.[0]?.message?.content || '';
    const parsed = safeParseJSON(rawText);

    if (!parsed || !Array.isArray(parsed.recommendations)) {
      return candidates.slice(0, limit).map((c) => ({ id: c._id, title: c.title, reason: 'category match' }));
    }

    const candidateMap = new Map(candidates.map((c) => [String(c._id), c]));
    return parsed.recommendations
      .filter((r) => candidateMap.has(String(r.id)))
      .slice(0, limit)
      .map((r) => ({
        id: candidateMap.get(String(r.id))._id,
        title: candidateMap.get(String(r.id)).title,
        reason: r.reason || 'AI recommended',
      }));
  } catch (err) {
    console.error('[AI] KB recommendation failed:', err.message);
    return candidates.slice(0, limit).map((c) => ({ id: c._id, title: c.title, reason: 'category match' }));
  }
};

module.exports = {
  classifyTicket,
  recommendKBArticles,
};