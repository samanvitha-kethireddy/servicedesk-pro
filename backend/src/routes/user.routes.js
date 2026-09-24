'use strict';

const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES, USER_MANAGEMENT_ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router.get('/technicians', userController.getAssignableTechnicians);

router.get('/', authorize(...USER_MANAGEMENT_ROLES, ROLES.IT_MANAGER), userController.getAllUsers);
router.post('/', authorize(...USER_MANAGEMENT_ROLES), userController.createUser);
router.get('/:id', authorize(...USER_MANAGEMENT_ROLES, ROLES.IT_MANAGER), userController.getUserById);
router.patch('/:id', authorize(...USER_MANAGEMENT_ROLES), userController.updateUser);
router.patch('/:id/deactivate', authorize(...USER_MANAGEMENT_ROLES), userController.deactivateUser);
router.patch('/:id/reactivate', authorize(...USER_MANAGEMENT_ROLES), userController.reactivateUser);
router.delete('/:id', authorize(...USER_MANAGEMENT_ROLES), userController.deleteUser);

module.exports = router;