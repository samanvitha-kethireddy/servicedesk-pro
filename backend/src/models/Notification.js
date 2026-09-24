'use strict';

const mongoose = require('mongoose');
const { NOTIFICATION_TYPE_LIST, AUDIT_ENTITY_LIST } = require('../config/constants');

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must have a recipient'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPE_LIST,
        message: '{VALUE} is not a valid notification type',
      },
      required: [true, 'Notification type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    relatedEntityType: {
      type: String,
      enum: {
        values: [...AUDIT_ENTITY_LIST, null],
        message: '{VALUE} is not a valid entity type',
      },
      default: null,
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    link:{
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
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
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// STATICS
notificationSchema.statics.markAsRead = async function markAsRead(notificationId, recipientId) {
  return this.findOneAndUpdate(
    { _id: notificationId, recipient: recipientId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

notificationSchema.statics.markAllAsRead = async function markAllAsRead(recipientId) {
  return this.updateMany(
    { recipient: recipientId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);