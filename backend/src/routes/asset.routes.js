'use strict';

const express = require('express');
const assetController = require('../controllers/asset.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const {
  validateCreateAsset,
  validateUpdateAsset,
  validateAssignAsset,
  validateReturnAsset,
} = require('../validators/asset.validator');
const { ASSET_MANAGEMENT_ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);

router.post('/', authorize(...ASSET_MANAGEMENT_ROLES), validate(validateCreateAsset), assetController.createAsset);
router.patch('/:id', authorize(...ASSET_MANAGEMENT_ROLES), validate(validateUpdateAsset), assetController.updateAsset);
router.post('/:id/assign', authorize(...ASSET_MANAGEMENT_ROLES), validate(validateAssignAsset), assetController.assignAsset);
router.post('/:id/return', authorize(...ASSET_MANAGEMENT_ROLES), validate(validateReturnAsset), assetController.returnAsset);
router.patch('/:id/retire', authorize(...ASSET_MANAGEMENT_ROLES), assetController.retireAsset);
router.delete('/:id', authorize(...ASSET_MANAGEMENT_ROLES), assetController.deleteAsset);

module.exports = router;