const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router.post('/register', authController.register);
router.post('/login', authController.login); // Ruta për t'u loguar
router.get('/users', authController.getUsers); // Ruta për të marrë listën e përdoruesve
router.get('/users/:id', authController.getUserById); // Ruta për të marrë një përdorues fiks

module.exports = router;