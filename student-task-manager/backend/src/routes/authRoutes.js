const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/users', verifyToken, authController.getUsers);
router.get('/users/:id', verifyToken, authController.getUserById);
router.put('/users/:id', verifyToken, authController.updateProfile);
router.put('/users/:id/role', verifyToken, authController.updateUserRole);
router.delete('/users/:id', verifyToken, authController.deleteUser);

module.exports = router;