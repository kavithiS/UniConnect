import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validateRegister, validateLogin, handleValidationErrors } from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

export default router;
