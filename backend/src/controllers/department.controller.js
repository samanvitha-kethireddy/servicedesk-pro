'use strict';

const Department = require('../models/Department');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const auditService = require('../services/audit.service');
const { AUDIT_ACTION, AUDIT_ENTITY } = require('../config/constants');

// GET /departments (public-ish — needed for registration dropdown)
const getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).select('name code description').sort({ name: 1 });
  res.status(200).json(new ApiResponse(200, 'Departments fetched', departments));
});

// GET /departments/:id
const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) throw ApiError.notFound('Department not found');
  res.status(200).json(new ApiResponse(200, 'Department fetched', { department }));
});

// POST /departments
const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, departmentHead } = req.body;

  const existing = await Department.findOne({ $or: [{ name }, { code: code?.toUpperCase() }] });
  if (existing) throw ApiError.conflict('A department with this name or code already exists');

  const department = await Department.create({
    name, code, description, departmentHead, createdBy: req.user._id,
  });

  await auditService.logAction({
    action: AUDIT_ACTION.CREATE,
    entityType: AUDIT_ENTITY.DEPARTMENT,
    entityId: department._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} created department ${department.name}`,
  });

  res.status(201).json(new ApiResponse(201, 'Department created', { department }));
});

// PATCH /departments/:id
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) throw ApiError.notFound('Department not found');

  const allowedFields = ['name', 'code', 'description', 'departmentHead', 'isActive'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) department[field] = req.body[field];
  });
  await department.save();

  await auditService.logAction({
    action: AUDIT_ACTION.UPDATE,
    entityType: AUDIT_ENTITY.DEPARTMENT,
    entityId: department._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} updated department ${department.name}`,
  });

  res.status(200).json(new ApiResponse(200, 'Department updated', { department }));
});

// DELETE /departments/:id
const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) throw ApiError.notFound('Department not found');

  department.isActive = false;
  await department.save();

  res.status(200).json(new ApiResponse(200, 'Department deactivated'));
});

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};