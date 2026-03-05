import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).trim().escape(),
  body('name').trim().escape(),
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').trim().escape(),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export default { validateRegister, validateLogin, handleValidationErrors };
