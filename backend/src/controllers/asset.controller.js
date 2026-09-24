'use strict';

const Asset = require('../models/Asset');
const AssetAssignment = require('../models/AssetAssignment');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { generateAssetCode } = require('../utils/ticketCodeGenerator');
const auditService = require('../services/audit.service');
const notificationService = require('../services/notification.service');
const {
  AUDIT_ACTION,
  AUDIT_ENTITY,
  ASSET_STATUS,
  ASSET_CONDITION,
  NOTIFICATION_TYPE,
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} = require('../config/constants');

// POST /assets
const createAsset = asyncHandler(async (req, res) => {
  const assetCode = await generateAssetCode();

  const asset = await Asset.create({
    ...req.body,
    assetCode,
    createdBy: req.user._id,
  });

  await auditService.logAction({
    action: AUDIT_ACTION.CREATE,
    entityType: AUDIT_ENTITY.ASSET,
    entityId: asset._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} created asset ${assetCode} (${asset.name})`,
  });

  res.status(201).json(new ApiResponse(201, 'Asset created', { asset }));
});

// GET /assets
const getAllAssets = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_PAGE_LIMIT, parseInt(req.query.limit, 10) || DEFAULT_PAGE_LIMIT);
  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.department) filter.department = req.query.department;
  if (req.query.assignedTo) filter.currentAssignee = req.query.assignedTo;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { assetCode: { $regex: req.query.search, $options: 'i' } },
      { serialNumber: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [assets, totalCount] = await Promise.all([
    Asset.find(filter)
      .populate('department', 'name code')
      .populate('currentAssignee', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Asset.countDocuments(filter),
  ]);

  res.status(200).json(ApiResponse.paginated(200, 'Assets fetched', assets, totalCount, page, limit));
});

// GET /assets/:id
const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({ _id: req.params.id, isDeleted: false })
    .populate('department', 'name code')
    .populate('currentAssignee', 'firstName lastName email')
    .populate('assignmentHistory');

  if (!asset) throw ApiError.notFound('Asset not found');
  res.status(200).json(new ApiResponse(200, 'Asset fetched', { asset }));
});

// PATCH /assets/:id
const updateAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({ _id: req.params.id, isDeleted: false });
  if (!asset) throw ApiError.notFound('Asset not found');

  const changes = auditService.buildChangeDiff(asset.toObject(), req.body);
  Object.assign(asset, req.body);
  await asset.save();

  await auditService.logAction({
    action: AUDIT_ACTION.UPDATE,
    entityType: AUDIT_ENTITY.ASSET,
    entityId: asset._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} updated asset ${asset.assetCode}`,
    changes,
  });

  res.status(200).json(new ApiResponse(200, 'Asset updated', { asset }));
});

// POST /assets/:id/assign
const assignAsset = asyncHandler(async (req, res) => {
  const { assignedTo, expectedReturnAt, conditionAtAssignment, assignmentNotes } = req.body;

  const asset = await Asset.findOne({ _id: req.params.id, isDeleted: false });
  if (!asset) throw ApiError.notFound('Asset not found');

  if (asset.status === ASSET_STATUS.ASSIGNED) {
    throw ApiError.badRequest('Asset is already assigned. Return it before reassigning.');
  }
  if (![ASSET_STATUS.IN_STOCK, ASSET_STATUS.UNDER_MAINTENANCE].includes(asset.status)) {
    throw ApiError.badRequest(`Asset cannot be assigned while status is "${asset.status}"`);
  }

  const assignment = await AssetAssignment.create({
    asset: asset._id,
    assignedTo,
    assignedBy: req.user._id,
    expectedReturnAt: expectedReturnAt || null,
    conditionAtAssignment: conditionAtAssignment || asset.condition,
    assignmentNotes: assignmentNotes || '',
  });

  asset.status = ASSET_STATUS.ASSIGNED;
  asset.currentAssignee = assignedTo;
  asset.currentAssignmentId = assignment._id;
  await asset.save();

  await auditService.logAction({
    action: AUDIT_ACTION.ASSIGN,
    entityType: AUDIT_ENTITY.ASSET,
    entityId: asset._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} assigned asset ${asset.assetCode} to user ${assignedTo}`,
  });

  await notificationService.notifyUser({
    recipient: assignedTo,
    type: NOTIFICATION_TYPE.ASSET_ASSIGNED,
    title: `Asset assigned: ${asset.name}`,
    message: `${asset.assetCode} has been assigned to you`,
    relatedEntityType: 'Asset',
    relatedEntityId: asset._id,
  });

  res.status(200).json(new ApiResponse(200, 'Asset assigned', { asset, assignment }));
});

// POST /assets/:id/return
const returnAsset = asyncHandler(async (req, res) => {
  const { conditionAtReturn, returnNotes } = req.body;

  const asset = await Asset.findOne({ _id: req.params.id, isDeleted: false });
  if (!asset) throw ApiError.notFound('Asset not found');

  if (asset.status !== ASSET_STATUS.ASSIGNED || !asset.currentAssignmentId) {
    throw ApiError.badRequest('Asset is not currently assigned');
  }

  const assignment = await AssetAssignment.findById(asset.currentAssignmentId);
  if (!assignment) throw ApiError.notFound('Active assignment record not found');

  assignment.closeAssignment(req.user._id, conditionAtReturn, returnNotes);
  await assignment.save();

  const previousAssignee = asset.currentAssignee;
  asset.status = ASSET_STATUS.IN_STOCK;
  asset.currentAssignee = null;
  asset.currentAssignmentId = null;
  if (conditionAtReturn) asset.condition = conditionAtReturn;
  await asset.save();

  await auditService.logAction({
    action: AUDIT_ACTION.UPDATE,
    entityType: AUDIT_ENTITY.ASSET,
    entityId: asset._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} processed return of asset ${asset.assetCode}`,
  });

  await notificationService.notifyUser({
    recipient: previousAssignee,
    type: NOTIFICATION_TYPE.ASSET_RETURNED,
    title: `Asset returned: ${asset.name}`,
    message: `Your return of ${asset.assetCode} has been processed`,
    relatedEntityType: 'Asset',
    relatedEntityId: asset._id,
  });

  res.status(200).json(new ApiResponse(200, 'Asset returned', { asset, assignment }));
});

// PATCH /assets/:id/retire
const retireAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({ _id: req.params.id, isDeleted: false });
  if (!asset) throw ApiError.notFound('Asset not found');

  if (asset.status === ASSET_STATUS.ASSIGNED) {
    throw ApiError.badRequest('Cannot retire an asset that is currently assigned. Return it first.');
  }

  asset.status = req.body.status || ASSET_STATUS.RETIRED;
  await asset.save();

  await auditService.logAction({
    action: AUDIT_ACTION.STATUS_CHANGE,
    entityType: AUDIT_ENTITY.ASSET,
    entityId: asset._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} set asset ${asset.assetCode} status to ${asset.status}`,
  });

  res.status(200).json(new ApiResponse(200, 'Asset status updated', { asset }));
});

// DELETE /assets/:id
const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({ _id: req.params.id, isDeleted: false });
  if (!asset) throw ApiError.notFound('Asset not found');

  if (asset.status === ASSET_STATUS.ASSIGNED) {
    throw ApiError.badRequest('Cannot delete an asset that is currently assigned');
  }

  asset.isDeleted = true;
  await asset.save();

  await auditService.logAction({
    action: AUDIT_ACTION.DELETE,
    entityType: AUDIT_ENTITY.ASSET,
    entityId: asset._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} deleted asset ${asset.assetCode}`,
  });

  res.status(200).json(new ApiResponse(200, 'Asset deleted'));
});

module.exports = {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  assignAsset,
  returnAsset,
  retireAsset,
  deleteAsset,
};