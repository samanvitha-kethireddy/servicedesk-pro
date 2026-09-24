'use strict';

const User = require('../models/User');
const Department = require('../models/Department');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const auditService = require('../services/audit.service');
const {
  AUDIT_ACTION,
  AUDIT_ENTITY,
  ROLES_LIST,
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} = require('../config/constants');

const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_PAGE_LIMIT, parseInt(req.query.limit, 10) || DEFAULT_PAGE_LIMIT);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role && ROLES_LIST.includes(req.query.role)) filter.role = req.query.role;
  if (req.query.department) filter.department = req.query.department;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.search) {
    filter.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json(ApiResponse.paginated(200, 'Users fetched', users, totalCount, page, limit));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('department', 'name code');
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json(new ApiResponse(200, 'User fetched', { user }));
});

const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, department, phone, designation, employeeCode } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const dept = await Department.findById(department);
  if (!dept || !dept.isActive) throw ApiError.badRequest('Invalid or inactive department');

  const user = await User.create({
    firstName, lastName, email, password, role, department,
    phone, designation, employeeCode, createdBy: req.user._id,
  });

  await auditService.logAction({
    action: AUDIT_ACTION.CREATE,
    entityType: AUDIT_ENTITY.USER,
    entityId: user._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} created user ${user.email} (${user.role})`,
  });

  const safeUser = await User.findById(user._id).populate('department', 'name code');
  res.status(201).json(new ApiResponse(201, 'User created', { user: safeUser }));
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const allowedFields = ['firstName', 'lastName', 'role', 'department', 'phone', 'designation', 'employeeCode', 'isActive'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const changes = auditService.buildChangeDiff(user.toObject(), updates);
  Object.assign(user, updates);
  await user.save({ validateBeforeSave: false });

  await auditService.logAction({
    action: AUDIT_ACTION.UPDATE,
    entityType: AUDIT_ENTITY.USER,
    entityId: user._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} updated user ${user.email}`,
    changes,
  });

  const safeUser = await User.findById(user._id).populate('department', 'name code');
  res.status(200).json(new ApiResponse(200, 'User updated', { user: safeUser }));
});

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  if (String(user._id) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }

  user.isActive = false;
  user.invalidateTokens();
  await user.save({ validateBeforeSave: false });

  await auditService.logAction({
    action: AUDIT_ACTION.UPDATE,
    entityType: AUDIT_ENTITY.USER,
    entityId: user._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} deactivated user ${user.email}`,
  });

  res.status(200).json(new ApiResponse(200, 'User deactivated'));
});

const reactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.isActive = true;
  await user.save({ validateBeforeSave: false });

  await auditService.logAction({
    action: AUDIT_ACTION.UPDATE,
    entityType: AUDIT_ENTITY.USER,
    entityId: user._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} reactivated user ${user.email}`,
  });

  res.status(200).json(new ApiResponse(200, 'User reactivated'));
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  if (String(user._id) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  await user.deleteOne();

  await auditService.logAction({
    action: AUDIT_ACTION.DELETE,
    entityType: AUDIT_ENTITY.USER,
    entityId: user._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} deleted user ${user.email}`,
  });

  res.status(200).json(new ApiResponse(200, 'User deleted'));
});

const getAssignableTechnicians = asyncHandler(async (req, res) => {
  const { ASSIGNABLE_ROLES } = require('../config/constants');
  const filter = { role: { $in: ASSIGNABLE_ROLES }, isActive: true };
  if (req.query.department) filter.department = req.query.department;

  const technicians = await User.find(filter).select('firstName lastName email role department').populate('department', 'name code');
  res.status(200).json(new ApiResponse(200, 'Technicians fetched', { technicians }));
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  deleteUser,
  getAssignableTechnicians,
};