import { Router } from 'express';
import {
  create,
  dashboard,
  getProfile,
  list,
  remove,
  update,
  updateProfile,
} from '../controllers/contentController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  navigationSchema,
  profileSchema,
  projectSchema,
  settingSchema,
  showroomSchema,
  skillSchema,
  socialSchema,
  pageSchema,
} from '../validation/schemas.js';

const router = Router();
router.use(requireAdmin);
router.get('/dashboard', dashboard);
router.get('/profile', getProfile);
router.put('/profile', validate(profileSchema), updateProfile);

const resources = [
  ['pages', pageSchema],
  ['skills', skillSchema],
  ['projects', projectSchema],
  ['showroom', showroomSchema],
  ['navigation', navigationSchema],
  ['socials', socialSchema],
  ['settings', settingSchema],
];
for (const [resource, schema] of resources) {
  router.get(`/${resource}`, list(resource));
  router.post(`/${resource}`, validate(schema), create(resource));
  router.put(`/${resource}/:id`, validate(schema), update(resource));
  router.delete(`/${resource}/:id`, remove(resource));
}
export default router;
