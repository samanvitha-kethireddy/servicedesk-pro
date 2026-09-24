'use strict';

const KnowledgeBaseArticle = require('../models/KnowledgeBaseArticle');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const auditService = require('../services/audit.service');
const {
  AUDIT_ACTION,
  AUDIT_ENTITY,
  KB_STATUS,
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} = require('../config/constants');

// POST /kb
const createArticle = asyncHandler(async (req, res) => {
  const { title, summary, content, category, tags, status } = req.body;

  const article = await KnowledgeBaseArticle.create({
    title,
    summary,
    content,
    category,
    tags: tags || [],
    status: status || KB_STATUS.DRAFT,
    author: req.user._id,
  });

  await auditService.logAction({
    action: AUDIT_ACTION.CREATE,
    entityType: AUDIT_ENTITY.KB_ARTICLE,
    entityId: article._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} created KB article "${article.title}"`,
  });

  res.status(201).json(new ApiResponse(201, 'Article created', { article }));
});

// GET /kb
const getAllArticles = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_PAGE_LIMIT, parseInt(req.query.limit, 10) || DEFAULT_PAGE_LIMIT);
  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };

  // Employees only see published articles; staff can filter by status
  if (req.user.role === 'Employee') {
    filter.status = KB_STATUS.PUBLISHED;
  } else if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const [articles, totalCount] = await Promise.all([
    KnowledgeBaseArticle.find(filter)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    KnowledgeBaseArticle.countDocuments(filter),
  ]);

  res.status(200).json(ApiResponse.paginated(200, 'Articles fetched', articles, totalCount, page, limit));
});

// GET /kb/:idOrSlug
const getArticle = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

  const article = await KnowledgeBaseArticle.findOne({
    [isObjectId ? '_id' : 'slug']: idOrSlug,
    isDeleted: false,
  }).populate('author', 'firstName lastName');

  if (!article) throw ApiError.notFound('Article not found');

  if (req.user.role === 'Employee' && article.status !== KB_STATUS.PUBLISHED) {
    throw ApiError.notFound('Article not found');
  }

  article.viewCount += 1;
  await article.save();

  res.status(200).json(new ApiResponse(200, 'Article fetched', { article }));
});

// PATCH /kb/:id
const updateArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeBaseArticle.findOne({ _id: req.params.id, isDeleted: false });
  if (!article) throw ApiError.notFound('Article not found');

  const allowedFields = ['title', 'summary', 'content', 'category', 'tags', 'status'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  Object.assign(article, updates);
  article.lastEditedBy = req.user._id;
  await article.save();

  await auditService.logAction({
    action: AUDIT_ACTION.UPDATE,
    entityType: AUDIT_ENTITY.KB_ARTICLE,
    entityId: article._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} updated KB article "${article.title}"`,
  });

  res.status(200).json(new ApiResponse(200, 'Article updated', { article }));
});

// POST /kb/:id/feedback
const submitFeedback = asyncHandler(async (req, res) => {
  const { isHelpful } = req.body;

  const article = await KnowledgeBaseArticle.findOne({ _id: req.params.id, isDeleted: false });
  if (!article) throw ApiError.notFound('Article not found');

  if (isHelpful) {
    article.helpfulCount += 1;
  } else {
    article.notHelpfulCount += 1;
  }
  await article.save();

  res.status(200).json(new ApiResponse(200, 'Feedback recorded', { article }));
});

// DELETE /kb/:id
const deleteArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeBaseArticle.findOne({ _id: req.params.id, isDeleted: false });
  if (!article) throw ApiError.notFound('Article not found');

  article.isDeleted = true;
  await article.save();

  await auditService.logAction({
    action: AUDIT_ACTION.DELETE,
    entityType: AUDIT_ENTITY.KB_ARTICLE,
    entityId: article._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} deleted KB article "${article.title}"`,
  });

  res.status(200).json(new ApiResponse(200, 'Article deleted'));
});

module.exports = {
  createArticle,
  getAllArticles,
  getArticle,
  updateArticle,
  submitFeedback,
  deleteArticle,
};