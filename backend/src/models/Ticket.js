'use strict';

const mongoose = require('mongoose');
const {
  TICKET_STATUS,
  TICKET_STATUS_LIST,
  TICKET_STATUS_TRANSITIONS,
  TICKET_PRIORITY_LIST,
  TICKET_CATEGORY_LIST,
  TICKET_SOURCE_LIST,
  TICKET_SOURCE,
  SLA_STATUS,
  SLA_STATUS_LIST,
} = require('../config/constants');

const { Schema } = mongoose;

const statusHistorySchema = new Schema(
  {
    fromStatus: { type: String, enum: TICKET_STATUS_LIST, default: null },
    toStatus: { type: String, enum: TICKET_STATUS_LIST, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, trim: true, default: '' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const escalationHistorySchema = new Schema(
  {
    level: { type: Number, required: true },
    escalatedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    escalatedRole: { type: String, default: null },
    reason: { type: String, trim: true, default: 'SLA breach threshold reached' },
    escalatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const aiClassificationSchema = new Schema(
  {
    suggestedCategory: { type: String, enum: TICKET_CATEGORY_LIST, default: null },
    suggestedPriority: { type: String, enum: TICKET_PRIORITY_LIST, default: null },
    confidenceScore: { type: Number, min: 0, max: 1, default: null },
    suggestedKbArticleIds: [{ type: Schema.Types.ObjectId, ref: 'KnowledgeBaseArticle' }],
    rawModelResponse: { type: String, default: null },
    modelUsed: { type: String, default: null },
    classifiedAt: { type: Date, default: null },
    wasAccepted: { type: Boolean, default: null }, // null = pending decision, true/false = agent decision
  },
  { _id: false }
);

const ticketSchema = new Schema(
  {
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      immutable: true,
    },
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
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
    priority: {
      type: String,
      enum: {
        values: TICKET_PRIORITY_LIST,
        message: '{VALUE} is not a valid priority',
      },
      required: [true, 'Priority is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: TICKET_STATUS_LIST,
        message: '{VALUE} is not a valid status',
      },
      default: TICKET_STATUS.OPEN,
      index: true,
    },
    source: {
      type: String,
      enum: TICKET_SOURCE_LIST,
      default: TICKET_SOURCE.WEB_PORTAL,
    },

    // RELATIONSHIPS
    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ticket must have a requester'],
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    relatedAsset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      default: null,
    },
    watchers: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // SLA TRACKING
    slaResponseTargetAt: { type: Date, default: null },
    slaResolutionTargetAt: { type: Date, default: null },
    firstResponseAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    reopenedAt: { type: Date, default: null },

    slaResponseStatus: {
      type: String,
      enum: SLA_STATUS_LIST,
      default: SLA_STATUS.WITHIN_SLA,
      index: true,
    },
    slaResolutionStatus: {
      type: String,
      enum: SLA_STATUS_LIST,
      default: SLA_STATUS.WITHIN_SLA,
      index: true,
    },
    slaPausedAt: { type: Date, default: null }, 
    slaPausedDurationMinutes: { type: Number, default: 0 }, 

    escalationLevel: { type: Number, default: 0 },
    escalationHistory: [escalationHistorySchema],

    // AI
    aiClassification: { type: aiClassificationSchema, default: () => ({}) },

    // AUDIT  HISTORY
    statusHistory: [statusHistorySchema],

    attachments: [
      {
        fileName: { type: String, trim: true },
        fileUrl: { type: String, trim: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    tags: [{ type: String, trim: true, lowercase: true }],

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// INDEXES
ticketSchema.index({ title: 'text', description: 'text', ticketCode: 'text' });
ticketSchema.index({ status: 1, priority: 1, department: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ slaResolutionTargetAt: 1, status: 1 }); 

// VIRTUALS
ticketSchema.virtual('comments', {
  ref: 'TicketComment',
  localField: '_id',
  foreignField: 'ticket',
  justOne: false,
});

ticketSchema.virtual('isOverdue').get(function () {
  if (!this.slaResolutionTargetAt) return false;
  const activeStatuses = [
    TICKET_STATUS.OPEN,
    TICKET_STATUS.IN_PROGRESS,
    TICKET_STATUS.REOPENED,
  ];
  return activeStatuses.includes(this.status) && new Date() > this.slaResolutionTargetAt;
});

// INSTANCE METHODS
ticketSchema.methods.canTransitionTo = function canTransitionTo(targetStatus) {
  const allowedTransitions = TICKET_STATUS_TRANSITIONS[this.status] || [];
  return allowedTransitions.includes(targetStatus);
};

ticketSchema.methods.recordStatusChange = function recordStatusChange(toStatus, changedByUserId, note = '') {
  this.statusHistory.push({
    fromStatus: this.status,
    toStatus,
    changedBy: changedByUserId,
    note,
    changedAt: new Date(),
  });
  this.status = toStatus;
};

module.exports = mongoose.model('Ticket', ticketSchema);