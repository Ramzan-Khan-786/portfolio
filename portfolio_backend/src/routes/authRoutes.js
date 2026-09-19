import { Router } from 'express';
import { login, logout, me, changePassword, signup } from '../controllers/authController.js';
import {
  googleChallenge,
  googleAuthenticate,
  completeGoogle,
} from '../controllers/googleController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  loginSchema,
  passwordSchema,
  signupSchema,
  googleSchema,
  googlePasswordSchema,
} from '../validation/schemas.js';
const router = Router();
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/admin/login', validate(loginSchema), login);
router.post('/google/challenge', googleChallenge);
router.post('/google', validate(googleSchema), googleAuthenticate);
router.post('/google/complete', validate(googlePasswordSchema), completeGoogle);
router.post('/logout', requireAuth, logout);
router.put('/password', requireAuth, validate(passwordSchema), changePassword);
router.get('/me', requireAuth, me);
export default router;
