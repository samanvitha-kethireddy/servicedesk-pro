'use strict';

const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getMyNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(limit),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.status(200).json(new ApiResponse(200, 'Notifications fetched', { notifications, unreadCount }));
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.markAsRead(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Notification marked as read', { notification }));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.markAllAsRead(req.user._id);
  res.status(200).json(new ApiResponse(200, 'All notifications marked as read'));
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };