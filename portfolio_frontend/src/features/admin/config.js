const field = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra });
const order = field('order', 'Display order', 'number', { min: 0, max: 100000 });
const visible = field('enabled', 'Enabled', 'checkbox');
export const sections = [
  ['dashboard', 'Dashboard'],
  ['hero', 'Hero'],
  ['identity', 'Identity'],
  ['profile', 'Profile details'],
  ['about', 'About'],
  ['skills', 'Skills'],
  ['projects', 'Projects'],
  ['showroom', 'Showroom'],
  ['resume', 'Resume'],
  ['media', 'Media library'],
  ['contact', 'Contact'],
  ['navigation', 'Navigation'],
  ['pages', 'Pages'],
  ['socials', 'Social links'],
  ['footer', 'Footer'],
  ['appearance', 'Themes'],
  ['settings', 'Site settings'],
  ['account', 'Account'],
  ['users', 'Users'],
  ['system', 'Operations'],
];
export const profileFields = [
  field('name', 'Name', 'text', { required: true, maxLength: 80 }),
  field('initials', 'Avatar initials', 'text', { required: true, maxLength: 4 }),
  field('headline', 'Headline', 'textarea', { required: true, minLength: 4, maxLength: 180 }),
  field('shortIntro', 'Short introduction', 'textarea', {
    required: true,
    minLength: 10,
    maxLength: 360,
  }),
  field('bio', 'About / biography', 'textarea', { required: true, minLength: 10, maxLength: 4000 }),
  field('location', 'Location'),
  field('availability', 'Availability'),
  field('profileMedia', 'Profile photo', 'media', { category: 'profile' }),
  field('profileImage', 'Legacy profile image URL', 'url'),
  field('resumeUrl', 'Resume URL', 'url'),
  field('focusAreas', 'Focus areas', 'array', { help: 'Separate entries with commas.' }),
  field('primaryCtaLabel', 'Primary action label'),
  field('primaryCtaUrl', 'Primary action destination'),
  field('secondaryCtaLabel', 'Secondary action label'),
  field('secondaryCtaUrl', 'Secondary action destination'),
];
export const resources = {
  skills: {
    title: 'Skills',
    singular: 'skill',
    description: 'Organize the technologies and engineering practices you use.',
    columns: ['name', 'category', 'order', 'visible'],
    defaults: { order: 0, visible: true },
    fields: [
      field('name', 'Skill name', 'text', { required: true }),
      field('category', 'Category', 'text', { required: true }),
      field('iconMedia', 'Skill icon', 'media', { category: 'skills' }),
      field('iconUrl', 'Legacy icon URL', 'url'),
      field('featured', 'Featured skill', 'checkbox'),
      field('description', 'Description', 'textarea', { maxLength: 280 }),
      order,
      field('visible', 'Visible on portfolio', 'checkbox'),
    ],
  },
  projects: {
    title: 'Projects',
    singular: 'project',
    description: 'Manage your catalogue. Publish projects when their content is ready.',
    columns: ['title', 'status', 'order', 'published'],
    defaults: { status: 'in-progress', year: new Date().getFullYear(), order: 0 },
    fields: [
      field('title', 'Title', 'text', { required: true, maxLength: 140 }),
      field('slug', 'URL slug', 'text', {
        help: 'Optional on creation. Lowercase words separated by hyphens.',
      }),
      field('summary', 'Short description', 'textarea', {
        required: true,
        minLength: 5,
        maxLength: 360,
      }),
      field('description', 'Full description', 'textarea', { maxLength: 5000 }),
      field('category', 'Category'),
      field('thumbnailMedia', 'Project thumbnail', 'media', { category: 'projects' }),
      field('coverMedia', 'Project cover', 'media', { category: 'projects' }),
      field('gallery', 'Project gallery', 'gallery', { category: 'projects', max: 8 }),
      field('imageUrl', 'Legacy cover URL', 'url'),
      field('screenshots', 'Screenshot URLs', 'lines', {
        help: 'One HTTP(S) image URL per line, up to eight.',
      }),
      field('technologies', 'Technologies', 'array', {
        help: 'Separate technologies with commas.',
      }),
      field('githubUrl', 'GitHub URL', 'url'),
      field('liveUrl', 'Live project URL', 'url'),
      field('status', 'Status', 'select', {
        options: ['active', 'maintained', 'in-progress', 'archived'],
      }),
      field('year', 'Project year', 'number', { min: 2000, max: 2100 }),
      order,
      field('featured', 'Featured', 'checkbox'),
      field('published', 'Published', 'checkbox'),
      field('archived', 'Archived / hidden', 'checkbox'),
    ],
  },
  showroom: {
    title: 'Showroom',
    singular: 'showroom item',
    description:
      'Connect an independent experience or create a Coming Soon entry. The enabled default opens first.',
    columns: ['label', 'presentationType', 'order', 'isDefault'],
    defaults: {
      project: '',
      status: 'coming-soon',
      presentationType: 'coming-soon',
      enabled: true,
      order: 0,
    },
    fields: [
      field('label', 'Label', 'text', { required: true, maxLength: 80 }),
      field('project', 'Associated project', 'project'),
      field('description', 'Description', 'textarea', { maxLength: 600 }),
      field('presentationType', 'Presentation', 'select', { options: ['iframe', 'coming-soon'] }),
      field('previewMedia', 'Preview image', 'media', { category: 'showroom' }),
      field('iconMedia', 'Project icon', 'media', { category: 'showroom' }),
      field('fallbackMedia', 'Unavailable screenshot', 'media', { category: 'showroom' }),
      field('embedUrl', 'Integration URL', 'url', {
        help: 'Independent app URL that allows embedding. Leave blank while deployment is in preparation.',
      }),
      field('externalUrl', 'Full project URL', 'url'),
      field('githubUrl', 'GitHub URL override', 'url'),
      field('technologies', 'Technology overrides', 'array'),
      field('fallbackMessage', 'Unavailable message', 'textarea', { maxLength: 500 }),
      field('status', 'Availability', 'select', { options: ['live', 'coming-soon'] }),
      order,
      visible,
      field('isDefault', 'Open by default', 'checkbox'),
    ],
  },
  navigation: {
    title: 'Navigation',
    singular: 'navigation item',
    description:
      'Choose a route, homepage section, or external destination. Add a page under Pages before linking to a new local route.',
    columns: ['label', 'destination', 'order', 'enabled'],
    defaults: {
      type: 'route',
      order: 0,
      enabled: true,
      visibleOnDesktop: true,
      visibleOnMobile: true,
    },
    fields: [
      field('label', 'Label', 'text', { required: true, maxLength: 48 }),
      field('type', 'Destination type', 'select', {
        options: ['route', 'anchor', 'external', 'action'],
      }),
      field('destination', 'Destination', 'text', {
        required: true,
        help: 'Examples: /work, /showroom, #contact, https://example.com. Future actions must remain disabled.',
      }),
      order,
      visible,
      field('visibleOnDesktop', 'Visible on desktop', 'checkbox'),
      field('visibleOnMobile', 'Visible on mobile', 'checkbox'),
    ],
  },
  pages: {
    title: 'Pages',
    singular: 'page',
    description:
      'Simple text pages for content such as Experience. Publish, then add the route to Navigation.',
    columns: ['title', 'slug', 'published'],
    defaults: { order: 0 },
    fields: [
      field('title', 'Title', 'text', { required: true, maxLength: 120 }),
      field('slug', 'Route slug', 'text', {
        required: true,
        help: 'For example: experience → /experience',
      }),
      field('description', 'Page summary', 'textarea', { maxLength: 300 }),
      field('body', 'Page content', 'textarea', {
        required: true,
        maxLength: 20000,
        help: 'Plain text. Paragraphs are preserved; HTML is displayed as text.',
      }),
      order,
      field('published', 'Published', 'checkbox'),
    ],
  },
  socials: {
    title: 'Social links',
    singular: 'social link',
    description: 'These links are shared by Contact and the footer.',
    columns: ['label', 'url', 'order', 'enabled'],
    defaults: { enabled: true, order: 0 },
    fields: [
      field('label', 'Label', 'text', { required: true }),
      field('kind', 'Platform', 'text', {
        required: true,
        help: 'For example: github, linkedin, email, x.',
      }),
      field('url', 'Destination', 'text', {
        required: true,
        help: 'Use an HTTP(S) URL or mailto:you@example.com.',
      }),
      order,
      visible,
    ],
  },
  settings: {
    title: 'Site settings',
    singular: 'setting',
    description:
      'Public keys: siteName, siteDescription, footerLine, contactEmail, siteUrl. Never store credentials here.',
    columns: ['key', 'value'],
    defaults: {},
    fields: [
      field('key', 'Setting key', 'text', { required: true }),
      field('value', 'Value', 'textarea', { maxLength: 2000 }),
    ],
  },
};
export function toForm(record, fields) {
  return Object.fromEntries(
    fields.map(({ name, type }) => {
      const value = record?.[name];
      return [
        name,
        type === 'media' ? value || null : type === 'gallery' ? value || [] : type === 'repeater' || type === 'choices'
          ? value || []
          : type === 'checkbox'
            ? Boolean(value)
            : type === 'array' || type === 'lines'
              ? (value || []).join(type === 'lines' ? '\n' : ', ')
              : type === 'project'
                ? value?._id || value || ''
                : (value ?? ''),
      ];
    }),
  );
}
export function toPayload(values, fields) {
  return Object.fromEntries(
    fields.map(({ name, type }) => {
      let value = values[name];
      if (type === 'array' || type === 'lines')
        value = String(value || '')
          .split(type === 'lines' ? /\n/ : /,/)
          .map((entry) => entry.trim())
          .filter(Boolean);
      const reference = (item) => item?.mediaId ? { mediaId: item.mediaId, altText: item.altText || '', caption: item.caption || '' } : null;
      if (type === 'media') value = reference(value);
      if (type === 'gallery') value = (value || []).map(reference).filter(Boolean);
      if (type === 'project') value = value || null;
      if (type === 'number') value = value === '' ? undefined : Number(value);
      return [name, value];
    }),
  );
}
