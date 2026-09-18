import { Router } from 'express';
import {
  bootstrap,
  getProfile,
  list,
  projectDetail,
  pageDetail,
} from '../controllers/contentController.js';

const router = Router();
router.get('/bootstrap', bootstrap);
router.get('/projects/:slug', projectDetail);
router.get('/pages/:slug', pageDetail);
router.get('/profile', getProfile);
router.get('/projects', list('projects', { publicOnly: true }));
router.get('/skills', list('skills', { publicOnly: true }));
router.get('/showroom', list('showroom', { publicOnly: true }));
router.get('/navigation', list('navigation', { publicOnly: true }));
router.get('/socials', list('socials', { publicOnly: true }));
export default router;
