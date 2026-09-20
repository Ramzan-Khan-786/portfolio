import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { cmsMutationLock } from '../middleware/cmsMutationLock.js';
import { mediaConfig, listMedia, getMedia, createMedia, updateMedia, removeMedia, removeBackground, uploadMedia, previewMediaDocument } from '../controllers/mediaController.js';
import { getThemes, putThemes } from '../controllers/themeController.js';
import { listResumes, editResume, publishResume, archiveResume, deleteResume, previewResume, markPreviewed, importResume, resumeFromLibrary } from '../controllers/resumeController.js';
import { getSection, putSection } from '../controllers/sectionController.js';
import {
  getResume,
  putResume,
  storeResume,
  uploadPdf,
  detachResume,
} from '../controllers/resumeController.js';
import { resumeSchema } from '../validation/sections.js';
import { users, setUserStatus, operations } from '../controllers/systemController.js';
import { userStatusSchema } from '../validation/schemas.js';
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
const mediaLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 80, standardHeaders: true, legacyHeaders: false, keyGenerator: (req) => req.user.id, message: { ok: false, error: { message: 'Media operation limit reached. Please try again later.' } } });
router.use(['/media', '/resumes', '/resume/file'], (req, res, next) => req.method === 'POST' ? mediaLimit(req, res, next) : next());
router.use(cmsMutationLock);
router.get('/media/config', mediaConfig);
router.get('/media', listMedia);
router.post('/media', uploadMedia, createMedia);
router.get('/media/:id/file', previewMediaDocument);
router.get('/media/:id', getMedia);
router.put('/media/:id', updateMedia);
router.delete('/media/:id', removeMedia);
router.post('/media/:id/remove-background', removeBackground);
router.get('/themes', getThemes);
router.put('/themes', putThemes);
router.get('/resumes', listResumes);
router.post('/resumes', uploadPdf, storeResume);
router.post('/resumes/import-drive', importResume);
router.post('/resumes/from-library', resumeFromLibrary);
router.put('/resumes/:id', editResume);
router.get('/resumes/:id/file', previewResume);
router.post('/resumes/:id/previewed', markPreviewed);
router.post('/resumes/:id/publish', publishResume);
router.post('/resumes/:id/archive', archiveResume);
router.delete('/resumes/:id', deleteResume);
router.get('/users', users);
router.put('/users/:id', validate(userStatusSchema), setUserStatus);
router.get('/operations', operations);
router.get('/content/:key', getSection);
router.put('/content/:key', putSection);
router.get('/resume', getResume);
router.put('/resume', validate(resumeSchema), putResume);
router.post('/resume/file', uploadPdf, storeResume);
router.delete('/resume/file', detachResume);
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
