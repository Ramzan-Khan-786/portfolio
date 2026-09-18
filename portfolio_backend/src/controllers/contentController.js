import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import ShowroomItem from '../models/ShowroomItem.js';
import Skill from '../models/Skill.js';
import NavigationItem from '../models/NavigationItem.js';
import SocialLink from '../models/SocialLink.js';
import Setting from '../models/Setting.js';
import Page from '../models/Page.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { slugify } from '../utils/slugify.js';
import { checkProject, setDefault, showroomRecords } from '../services/showroom.js';
const models = {
  skills: Skill,
  projects: Project,
  showroom: ShowroomItem,
  navigation: NavigationItem,
  socials: SocialLink,
  settings: Setting,
  pages: Page,
};
const publicSettingKeys = ['siteName', 'siteDescription', 'footerLine', 'contactEmail', 'siteUrl'];
const publicFilter = (resource) =>
  resource === 'projects'
    ? { published: true, archived: false }
    : resource === 'pages'
      ? { published: true }
      : resource === 'skills'
        ? { visible: true }
        : { enabled: true };
export const getProfile = asyncHandler(async (_req, res) =>
  res.json({ ok: true, data: await Profile.findOne() }),
);
export const updateProfile = asyncHandler(async (req, res) => {
  const current = await Profile.findOne();
  const data = current
    ? await Profile.findByIdAndUpdate(current.id, req.validatedBody, {
        new: true,
        runValidators: true,
      })
    : await Profile.create(req.validatedBody);
  res.json({ ok: true, data });
});
export const list = (resource, { publicOnly = false } = {}) =>
  asyncHandler(async (_req, res) => {
    const data =
      resource === 'showroom'
        ? await showroomRecords(publicOnly)
        : await models[resource]
            .find(
              publicOnly
                ? publicFilter(resource)
                : resource === 'settings'
                  ? { key: { $ne: 'defaultShowroomId' } }
                  : {},
            )
            .sort({ order: 1, _id: 1 })
            .lean();
    res.json({ ok: true, data });
  });
function cleanInput(resource, body) {
  const input = { ...body };
  if (resource === 'projects') {
    input.slug = slugify(input.slug || input.title);
    if (!input.slug)
      throw new ApiError(422, 'Provide a slug containing letters or numbers.', {
        fieldErrors: { slug: ['A URL slug is required for this title.'] },
      });
  }
  return input;
}
export const create = (resource) =>
  asyncHandler(async (req, res) => {
    const input = cleanInput(resource, req.validatedBody);
    if (resource === 'showroom') await checkProject(input);
    const document = await models[resource].create(input);
    if (resource === 'showroom') await setDefault(document, input.isDefault);
    res.status(201).json({ ok: true, data: document });
  });
export const update = (resource) =>
  asyncHandler(async (req, res) => {
    const input = cleanInput(resource, req.validatedBody);
    if (resource === 'showroom') await checkProject(input);
    const existing = await models[resource].findById(req.params.id);
    if (!existing) throw new ApiError(404, 'Record not found.');
    if (resource === 'settings' && existing.key === 'defaultShowroomId')
      throw new ApiError(403, 'Manage the default through Showroom.');
    const document = await models[resource].findByIdAndUpdate(req.params.id, input, {
      new: true,
      runValidators: true,
    });
    if (resource === 'showroom') await setDefault(document, input.isDefault);
    res.json({ ok: true, data: document });
  });
export const remove = (resource) =>
  asyncHandler(async (req, res) => {
    const existing = await models[resource].findById(req.params.id);
    if (!existing) throw new ApiError(404, 'Record not found.');
    if (resource === 'settings' && existing.key === 'defaultShowroomId')
      throw new ApiError(403, 'Manage the default through Showroom.');
    await existing.deleteOne();
    if (resource === 'projects')
      await ShowroomItem.updateMany({ project: req.params.id }, { project: null });
    if (resource === 'showroom') await setDefault(existing, false);
    res.status(204).end();
  });
export const dashboard = asyncHandler(async (_req, res) => {
  const [projects, liveProjects, skills, showroom, navigation, recent] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ published: true, archived: false }),
    Skill.countDocuments({ visible: true }),
    ShowroomItem.countDocuments({ enabled: true }),
    NavigationItem.countDocuments({ enabled: true }),
    Project.find().sort({ updatedAt: -1 }).limit(5).select('title published updatedAt').lean(),
  ]);
  res.json({ ok: true, data: { projects, liveProjects, skills, showroom, navigation, recent } });
});
export const bootstrap = asyncHandler(async (_req, res) => {
  const [profile, skills, projects, showroom, navigation, socials, settings] = await Promise.all([
    Profile.findOne(),
    Skill.find({ visible: true }).sort({ order: 1, _id: 1 }).lean(),
    Project.find({ published: true, archived: false })
      .sort({ order: 1, _id: 1 })
      .select('-description -screenshots')
      .lean(),
    showroomRecords(true),
    NavigationItem.find({ enabled: true, type: { $ne: 'action' } })
      .sort({ order: 1, _id: 1 })
      .lean(),
    SocialLink.find({ enabled: true }).sort({ order: 1, _id: 1 }).lean(),
    Setting.find({ key: { $in: publicSettingKeys } }).lean(),
  ]);
  res.json({
    ok: true,
    data: { profile, skills, projects, showroom, navigation, socials, settings },
  });
});
export const projectDetail = asyncHandler(async (req, res) => {
  const data = await Project.findOne({
    slug: req.params.slug,
    published: true,
    archived: false,
  }).lean();
  if (!data) throw new ApiError(404, 'Project not found.');
  res.json({ ok: true, data });
});
export const pageDetail = asyncHandler(async (req, res) => {
  const data = await Page.findOne({ slug: req.params.slug, published: true }).lean();
  if (!data) throw new ApiError(404, 'Page not found.');
  res.json({ ok: true, data });
});
