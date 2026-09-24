'use strict';

const Notification = require('../models/Notification');

const notifyUser = async ({ recipient, type, title, message, relatedEntityType = null, relatedEntityId = null, link = null }) => {
  if (!recipient) return null;

  try {
    return await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedEntityType,
      relatedEntityId,
      link,
    });
  } catch (err) {
    console.error('[Notification] Failed to create notification:', err.message);
    return null;
  }
};

const notifyMany = async (recipients, payload) => {
  const uniqueRecipients = [...new Set(recipients.filter(Boolean).map(String))];
  if (uniqueRecipients.length === 0) return [];

  try {
    const docs = uniqueRecipients.map((recipient) => ({
      recipient,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      relatedEntityType: payload.relatedEntityType || null,
      relatedEntityId: payload.relatedEntityId || null,
      link: payload.link || null,
    }));
    return await Notification.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error('[Notification] Bulk notify failed:', err.message);
    return [];
  }
};

const buildTicketLink = (ticketId) => `/tickets/${ticketId}`;

module.exports = {
  notifyUser,
  notifyMany,
  buildTicketLink,
};