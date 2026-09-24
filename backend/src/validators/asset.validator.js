'use strict';

const validator = require('validator');
const {
  ASSET_CATEGORY_LIST,
  ASSET_STATUS_LIST,
  ASSET_CONDITION_LIST,
} = require('../config/constants');

const validateCreateAsset = (body) => {
  const errors = [];
  const value = {};

  if (!body.name || body.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Asset name must be at least 2 characters' });
  } else {
    value.name = body.name.trim();
  }

  if (!body.category || !ASSET_CATEGORY_LIST.includes(body.category)) {
    errors.push({ field: 'category', message: `Category must be one of: ${ASSET_CATEGORY_LIST.join(', ')}` });
  } else {
    value.category = body.category;
  }

  if (body.condition && !ASSET_CONDITION_LIST.includes(body.condition)) {
    errors.push({ field: 'condition', message: `Condition must be one of: ${ASSET_CONDITION_LIST.join(', ')}` });
  } else {
    value.condition = body.condition || undefined;
  }

  if (body.purchaseCost !== undefined && body.purchaseCost !== null) {
    if (isNaN(Number(body.purchaseCost)) || Number(body.purchaseCost) < 0) {
      errors.push({ field: 'purchaseCost', message: 'Purchase cost must be a non-negative number' });
    } else {
      value.purchaseCost = Number(body.purchaseCost);
    }
  }

  if (body.department && !validator.isMongoId(String(body.department))) {
    errors.push({ field: 'department', message: 'Invalid department reference' });
  } else {
    value.department = body.department || null;
  }

  value.manufacturer = body.manufacturer ? String(body.manufacturer).trim() : '';
  value.modelNumber = body.modelNumber ? String(body.modelNumber).trim() : '';
  value.serialNumber = body.serialNumber ? String(body.serialNumber).trim() : undefined;
  value.vendor = body.vendor ? String(body.vendor).trim() : '';
  value.location = body.location ? String(body.location).trim() : '';
  value.notes = body.notes ? String(body.notes).trim() : '';
  value.purchaseDate = body.purchaseDate || null;
  value.warrantyExpiresAt = body.warrantyExpiresAt || null;
  value.specifications = body.specifications && typeof body.specifications === 'object' ? body.specifications : {};

  return { error: errors.length ? errors : null, value };
};

const validateUpdateAsset = (body) => {
  const errors = [];
  const value = {};

  if (body.name !== undefined) {
    if (body.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Asset name must be at least 2 characters' });
    } else {
      value.name = body.name.trim();
    }
  }

  if (body.category !== undefined) {
    if (!ASSET_CATEGORY_LIST.includes(body.category)) {
      errors.push({ field: 'category', message: `Category must be one of: ${ASSET_CATEGORY_LIST.join(', ')}` });
    } else {
      value.category = body.category;
    }
  }

  if (body.status !== undefined) {
    if (!ASSET_STATUS_LIST.includes(body.status)) {
      errors.push({ field: 'status', message: `Status must be one of: ${ASSET_STATUS_LIST.join(', ')}` });
    } else {
      value.status = body.status;
    }
  }

  if (body.condition !== undefined) {
    if (!ASSET_CONDITION_LIST.includes(body.condition)) {
      errors.push({ field: 'condition', message: `Condition must be one of: ${ASSET_CONDITION_LIST.join(', ')}` });
    } else {
      value.condition = body.condition;
    }
  }

  if (body.purchaseCost !== undefined) {
    if (body.purchaseCost !== null && (isNaN(Number(body.purchaseCost)) || Number(body.purchaseCost) < 0)) {
      errors.push({ field: 'purchaseCost', message: 'Purchase cost must be a non-negative number' });
    } else {
      value.purchaseCost = body.purchaseCost === null ? null : Number(body.purchaseCost);
    }
  }

  if (body.department !== undefined) {
    if (body.department !== null && !validator.isMongoId(String(body.department))) {
      errors.push({ field: 'department', message: 'Invalid department reference' });
    } else {
      value.department = body.department;
    }
  }

  const passthroughFields = [
    'manufacturer', 'modelNumber', 'serialNumber', 'vendor',
    'location', 'notes', 'purchaseDate', 'warrantyExpiresAt', 'specifications',
  ];
  passthroughFields.forEach((field) => {
    if (body[field] !== undefined) value[field] = body[field];
  });

  return { error: errors.length ? errors : null, value };
};

const validateAssignAsset = (body) => {
  const errors = [];
  const value = {};

  if (!body.assignedTo || !validator.isMongoId(String(body.assignedTo))) {
    errors.push({ field: 'assignedTo', message: 'A valid user reference is required' });
  } else {
    value.assignedTo = body.assignedTo;
  }

  value.expectedReturnAt = body.expectedReturnAt || null;
  value.conditionAtAssignment = body.conditionAtAssignment || undefined;
  value.assignmentNotes = body.assignmentNotes ? String(body.assignmentNotes).trim() : '';

  return { error: errors.length ? errors : null, value };
};

const validateReturnAsset = (body) => {
  const errors = [];
  const value = {};

  if (body.conditionAtReturn && !ASSET_CONDITION_LIST.includes(body.conditionAtReturn)) {
    errors.push({ field: 'conditionAtReturn', message: `Condition must be one of: ${ASSET_CONDITION_LIST.join(', ')}` });
  } else {
    value.conditionAtReturn = body.conditionAtReturn || undefined;
  }

  value.returnNotes = body.returnNotes ? String(body.returnNotes).trim() : '';

  return { error: errors.length ? errors : null, value };
};

module.exports = {
  validateCreateAsset,
  validateUpdateAsset,
  validateAssignAsset,
  validateReturnAsset,
};