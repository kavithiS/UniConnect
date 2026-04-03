const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * User Routes
 * POST   /users        - Create user
 * GET    /users        - Get all users
 * GET    /users/:id    - Get user by ID
 * PUT    /users/:id    - Update user
 * DELETE /users/:id    - Delete user
 */

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
