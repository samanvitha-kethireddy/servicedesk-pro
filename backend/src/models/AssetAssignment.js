'use strict';

const mongoose = require('mongoose');
const { ASSET_CONDITION, ASSET_CONDITION_LIST } = require('../config/constants');

const { Schema } = mongoose;

const assetAssignmentSchema = new Schema(
  {
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Assignment must reference an asset'],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assignment must reference an assignee'],
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assignment must record who performed the assignment'],
    },
    assignedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expectedReturnAt: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
      index: true,
    },
    returnedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    conditionAtAssignment: {
      type: String,
      enum: ASSET_CONDITION_LIST,
      default: ASSET_CONDITION.GOOD,
    },
    conditionAtReturn: {
      type: String,
      enum: ASSET_CONDITION_LIST,
      default: null,
    },
    assignmentNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    returnNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    isActive: {
      // True while the asset is currently checked out under this record.
      // Set false whrn returnedAt is populated.
      type: Boolean,
      default: true,
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
assetAssignmentSchema.index(
  { asset: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);
assetAssignmentSchema.index({ assignedTo: 1, isActive: 1 });

// INSTANCE METHODS
assetAssignmentSchema.methods.closeAssignment = function closeAssignment(
  returnedToUserId,
  conditionAtReturn = null,
  returnNotes = ''
) {
  this.returnedAt = new Date();
  this.returnedTo = returnedToUserId;
  this.conditionAtReturn = conditionAtReturn;
  this.returnNotes = returnNotes;
  this.isActive = false;
};

module.exports = mongoose.model('AssetAssignment', assetAssignmentSchema);