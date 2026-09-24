'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Department name must be at least 2 characters'],
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      trim: true,
      uppercase: true,
      unique: true,
      minlength: [2, 'Department code must be at least 2 characters'],
      maxlength: [10, 'Department code cannot exceed 10 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    departmentHead: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
departmentSchema.index({ name: 'text', code: 'text' });

// VIRTUALS
departmentSchema.virtual('members', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  justOne: false,
});

module.exports = mongoose.model('Department', departmentSchema);