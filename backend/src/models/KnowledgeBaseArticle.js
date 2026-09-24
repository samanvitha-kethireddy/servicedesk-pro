'use strict';

const mongoose = require('mongoose');
const { KB_STATUS, KB_STATUS_LIST, TICKET_CATEGORY_LIST } = require('../config/constants');
const { Schema } = mongoose;

const knowledgeBaseArticleSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Summary cannot exceed 300 characters'],
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
      minlength: [20, 'Content must be at least 20 characters'],
    },
    category: {
      type: String,
      enum: {
        values: TICKET_CATEGORY_LIST,
        message: '{VALUE} is not a valid category',
      },
      required: [true, 'Category is required'],
      index: true,
    },
    tags: [{ type: String, trim: true, lowercase: true, index: true }],
    status: {
      type: String,
      enum: {
        values: KB_STATUS_LIST,
        message: '{VALUE} is not a valid KB status',
      },
      default: KB_STATUS.DRAFT,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Article must have an author'],
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    notHelpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    linkedTicketsResolvedCount: {
      // incremented whenever a ticket cites this article as the accepted AI-suggested solution and is subsequently marked Resolved.
      type: Number,
      default: 0,
      min: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// INDEXES
knowledgeBaseArticleSchema.index({
  title: 'text',
  summary: 'text',
  content: 'text',
  tags: 'text',
});
knowledgeBaseArticleSchema.index({ category: 1, status: 1 });

// HOOKS
knowledgeBaseArticleSchema.pre('validate', async function generateSlug(next) {
  if (this.slug || !this.title) return next();

  const baseSlug = this.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  let candidateSlug = baseSlug;
  let suffix = 0;

  while (true) {
    const existing = await this.constructor.findOne({ slug: candidateSlug });
    if (!existing || existing._id.equals(this._id)) break;
    suffix += 1;
    candidateSlug = `${baseSlug}-${suffix}`;
  }

  this.slug = candidateSlug;
  next();
});

knowledgeBaseArticleSchema.pre('save', function stampPublishedAt(next) {
  if (this.isModified('status') && this.status === KB_STATUS.PUBLISHED && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('KnowledgeBaseArticle', knowledgeBaseArticleSchema);