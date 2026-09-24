'use strict';

const mongoose = require('mongoose');
const { AUDIT_ACTION_LIST, AUDIT_ENTITY_LIST } = require('../config/constants');

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    action: {
      type: String,
      enum: {
        values: AUDIT_ACTION_LIST,
        message: '{VALUE} is not a valid audit action',
      },
      required: [true, 'Audit action is required'],
      index: true,
    },
    entityType: {
      type: String,
      enum: {
        values: AUDIT_ENTITY_LIST,
        message: '{VALUE} is not a valid audit entity type',
      },
      required: [true, 'Entity type is required'],
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    performedByRole: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Audit description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    changes: {
      type: Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
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
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

// GUARDS: enforce append-only immutability at the model layer
auditLogSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function blockUpdates(next) {
  next(new Error('AuditLog records are immutable and cannot be updated.'));
});

auditLogSchema.pre(['findOneAndDelete', 'deleteOne', 'deleteMany'], function blockDeletes(next) {
  next(new Error('AuditLog records are immutable and cannot be deleted.'));
});

module.exports = mongoose.model('AuditLog', auditLogSchema);