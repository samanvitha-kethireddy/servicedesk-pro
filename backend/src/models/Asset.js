'use strict';

const mongoose = require('mongoose');
const {
  ASSET_STATUS,
  ASSET_STATUS_LIST,
  ASSET_CATEGORY_LIST,
  ASSET_CONDITION,
  ASSET_CONDITION_LIST,
} = require('../config/constants');

const { Schema } = mongoose;

const assetSchema = new Schema(
  {
    assetCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      immutable: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
      minlength: [2, 'Asset name must be at least 2 characters'],
      maxlength: [150, 'Asset name cannot exceed 150 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ASSET_CATEGORY_LIST,
        message: '{VALUE} is not a valid asset category',
      },
      required: [true, 'Asset category is required'],
      index: true,
    },
    manufacturer: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Manufacturer cannot exceed 100 characters'],
    },
    modelNumber: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Model number cannot exceed 100 characters'],
    },
    serialNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    specifications: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
    status: {
      type: String,
      enum: {
        values: ASSET_STATUS_LIST,
        message: '{VALUE} is not a valid asset status',
      },
      default: ASSET_STATUS.IN_STOCK,
      index: true,
    },
    condition: {
      type: String,
      enum: {
        values: ASSET_CONDITION_LIST,
        message: '{VALUE} is not a valid condition',
      },
      default: ASSET_CONDITION.NEW,
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    purchaseCost: {
      type: Number,
      min: [0, 'Purchase cost cannot be negative'],
      default: null,
    },
    vendor: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Vendor name cannot exceed 150 characters'],
    },
    warrantyExpiresAt: {
      type: Date,
      default: null,
    },
    depreciationRatePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    currentAssignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    currentAssignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'AssetAssignment',
      default: null,
    },
    lastMaintenanceAt: {
      type: Date,
      default: null,
    },
    nextMaintenanceDueAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
assetSchema.index({ name: 'text', assetCode: 'text', serialNumber: 'text', manufacturer: 'text' });
assetSchema.index({ status: 1, category: 1 });
assetSchema.index({ warrantyExpiresAt: 1 });

// VIRTUALS
assetSchema.virtual('assignmentHistory', {
  ref: 'AssetAssignment',
  localField: '_id',
  foreignField: 'asset',
  justOne: false,
});

assetSchema.virtual('isUnderWarranty').get(function () {
  if (!this.warrantyExpiresAt) return false;
  return new Date() < this.warrantyExpiresAt;
});

module.exports = mongoose.model('Asset', assetSchema);