'use strict';

const mongoose = require('mongoose');
const {
  TICKET_PRIORITY_LIST,
  TICKET_CATEGORY_LIST,
  SLA_TARGETS_MINUTES,
} = require('../config/constants');

const { Schema } = mongoose;

const slaPolicySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'SLA policy name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
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
    category: {
      type: String,
      enum: {
        values: TICKET_CATEGORY_LIST,
        message: '{VALUE} is not a valid category',
      },
      default: null,
    },
    responseTimeMinutes: {
      type: Number,
      required: [true, 'Response time target (minutes) is required'],
      min: [1, 'Response time must be at least 1 minute'],
    },
    resolutionTimeMinutes: {
      type: Number,
      required: [true, 'Resolution time target (minutes) is required'],
      min: [1, 'Resolution time must be at least 1 minute'],
      validate: {
        validator: function validateResolutionExceedsResponse(value) {
          return value >= this.responseTimeMinutes;
        },
        message: 'Resolution time must be greater than or equal to response time',
      },
    },
    businessHoursOnly: {
      // If true, exclude non-business hours
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
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
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// INDEXES
slaPolicySchema.index(
  { priority: 1, category: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

// STATICS
slaPolicySchema.statics.resolveEffectiveTargets = async function resolveEffectiveTargets(
  priority,
  category
) {
  const specificPolicy = await this.findOne({
    priority,
    category,
    isActive: true,
  }).lean();

  if (specificPolicy) {
    return {
      responseTimeMinutes: specificPolicy.responseTimeMinutes,
      resolutionTimeMinutes: specificPolicy.resolutionTimeMinutes,
      businessHoursOnly: specificPolicy.businessHoursOnly,
      source: 'category-specific-policy',
    };
  }

  const generalPolicy = await this.findOne({
    priority,
    category: null,
    isActive: true,
  }).lean();

  if (generalPolicy) {
    return {
      responseTimeMinutes: generalPolicy.responseTimeMinutes,
      resolutionTimeMinutes: generalPolicy.resolutionTimeMinutes,
      businessHoursOnly: generalPolicy.businessHoursOnly,
      source: 'priority-general-policy',
    };
  }

  const fallback = SLA_TARGETS_MINUTES[priority];
  return {
    responseTimeMinutes: fallback.response,
    resolutionTimeMinutes: fallback.resolution,
    businessHoursOnly: false,
    source: 'hardcoded-default',
  };
};

module.exports = mongoose.model('SLAPolicy', slaPolicySchema);