// // 'use strict';

// // const express = require('express');
// // const departmentController = require('../controllers/department.controller');
// // const { protect } = require('../middleware/auth.middleware');
// // const { authorize } = require('../middleware/role.middleware');
// // const { ROLES } = require('../config/constants');

// // const router = express.Router();

// // // Public - needed for the registration page dropdown
// // router.get('/', departmentController.getAllDepartments);

// // router.use(protect);

// // router.get('/:id', departmentController.getDepartmentById);
// // router.post('/', authorize(ROLES.SYSTEM_ADMIN), departmentController.createDepartment);
// // router.patch('/:id', authorize(ROLES.SYSTEM_ADMIN), departmentController.updateDepartment);
// // router.delete('/:id', authorize(ROLES.SYSTEM_ADMIN), departmentController.deleteDepartment);

// // module.exports = router;



// 'use strict';

// const express = require('express');
// const departmentController = require('../controllers/department.controller');
// const { protect } = require('../middleware/auth.middleware');
// const { authorize } = require('../middleware/role.middleware');
// const { ROLES } = require('../config/constants');

// const router = express.Router();

// // 1. PUBLIC ROUTE (Unprotected for registration dropdown)
// router.get('/', departmentController.getAllDepartments);

// // 2. PROTECTED ROUTES (Pass 'protect' explicitly on individual routes)
// router.get('/:id', protect, departmentController.getDepartmentById);
// router.post('/', protect, authorize(ROLES.SYSTEM_ADMIN), departmentController.createDepartment);
// router.patch('/:id', protect, authorize(ROLES.SYSTEM_ADMIN), departmentController.updateDepartment);
// router.delete('/:id', protect, authorize(ROLES.SYSTEM_ADMIN), departmentController.deleteDepartment);

// module.exports = router;



'use strict';

const express = require('express');
const departmentController = require('../controllers/department.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

// ⚠️ Ye GET route protect() se PEHLE hona chahiye — public rehna hai
router.get('/', departmentController.getAllDepartments);

// Isske baad hi protect lagega — sirf niche wale routes ke liye
router.use(protect);

router.get('/:id', departmentController.getDepartmentById);
router.post('/', authorize(ROLES.SYSTEM_ADMIN), departmentController.createDepartment);
router.patch('/:id', authorize(ROLES.SYSTEM_ADMIN), departmentController.updateDepartment);
router.delete('/:id', authorize(ROLES.SYSTEM_ADMIN), departmentController.deleteDepartment);

module.exports = router;