import { Router } from 'express';
import { login, logout, me, changePassword } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, passwordSchema } from '../validation/schemas.js';

const router = Router();
router.post('/login', validate(loginSchema), login);
router.post('/logout', requireAdmin, logout);
router.put('/password', requireAdmin, validate(passwordSchema), changePassword);
router.get('/me', requireAdmin, me);
export default router;
