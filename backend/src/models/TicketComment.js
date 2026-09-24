'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const ticketCommentSchema = new Schema(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Comment must belong to a ticket'],
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment must have an author'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Comment message cannot be empty'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [3000, 'Comment cannot exceed 3000 characters'],
    },
    isInternal: {
      // if true, only visible to Technician/IT Manager/System Admin/Asset Manager.
      // ticket requesters never see internal notes.
      type: Boolean,
      default: false,
      index: true,
    },
    attachments: [
      {
        fileName: { type: String, trim: true },
        fileUrl: { type: String, trim: true },
      },
    ],
    editedAt: {
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
ticketCommentSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model('TicketComment', ticketCommentSchema);