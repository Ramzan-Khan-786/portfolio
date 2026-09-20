const f = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra });
const visibility = f('visible', 'Visible on portfolio', 'checkbox');
const title = f('title', 'Page title');
const subtitle = f('subtitle', 'Page introduction', 'textarea');
const timeline = [
  f('title', 'Title', 'text', { required: true }),
  f('organization', 'Organization'),
  f('period', 'Period'),
  f('description', 'Description', 'textarea'),
];
const links = [
  f('label', 'Label', 'text', { required: true }),
  f('url', 'Destination', 'text', { required: true }),
];
export const contentModules = {
  hero: {
    title: 'Hero',
    description:
      'Home-page introduction and actions. The developer name and default image are shared with Identity.',
    fields: [
      visibility,
      f('eyebrow', 'Technical label'),
      f('greeting', 'Greeting'),
      f('name', 'Developer name override'),
      f('headline', 'Headline', 'textarea'),
      f('introduction', 'Introduction', 'textarea'),
      f('imageMedia', 'Hero image', 'media', { category: 'hero' }),
      f('imagePosition', 'Image position', 'select', { options: ['center', 'top', 'bottom', 'left', 'right'] }),
      f('imageVisible', 'Show hero image', 'checkbox'),
      f('imageUrl', 'Legacy hero image URL', 'url'),
      f('actions', 'Actions', 'repeater', {
        fields: links,
        max: 3,
        help: 'Leave empty to use the shared identity actions. Reorder with the arrow buttons.',
      }),
    ],
  },
  profile: {
    title: 'Profile details',
    description:
      'Structured background shared by Profile and Resume. Leave optional fields empty to omit them.',
    fields: [
      visibility,
      title,
      f('introduction', 'Introduction', 'textarea'),
      f('currentFocus', 'Current focus', 'textarea'),
      f('education', 'Education', 'repeater', { fields: timeline, max: 30 }),
      f('highlights', 'Highlights', 'lines'),
      f('interests', 'Interests', 'lines'),
      f('achievements', 'Achievements', 'lines'),
    ],
  },
  about: {
    title: 'About',
    description:
      'Your longer narrative and professional background. Only add experience you can substantiate.',
    fields: [
      visibility,
      title,
      subtitle,
      f('heading', 'Narrative heading'),
      f('body', 'Biography', 'textarea', { maxLength: 8000 }),
      f('imageMedia', 'About image', 'media', { category: 'about' }),
      f('principles', 'Working principles', 'lines'),
      f('experience', 'Experience', 'repeater', { fields: timeline, max: 30 }),
    ],
  },
  contact: {
    title: 'Contact',
    description:
      'Manage contact copy and method visibility. Social profiles are managed in Social links.',
    fields: [
      visibility,
      title,
      subtitle,
      f('heading', 'Contact heading'),
      f('description', 'Description', 'textarea'),
      f('email', 'Email override', 'email'),
      f('showEmail', 'Show email', 'checkbox'),
      f('showSocials', 'Show social profiles', 'checkbox'),
      f('ctaLabel', 'Additional action label'),
      f('ctaUrl', 'Additional action destination'),
      f('note', 'Contact note', 'textarea'),
    ],
  },
  footer: {
    title: 'Footer',
    description:
      'Persistent footer content. Page controls stay available even when optional content is hidden.',
    fields: [
      f('copyright', 'Copyright override'),
      f('showCopyright', 'Show copyright', 'checkbox'),
      f('showSocials', 'Show social links', 'checkbox'),
      f('links', 'Useful links', 'repeater', { fields: links, max: 4 }),
    ],
  },
};
export const resumeFields = [
  title,
  f('description', 'Description', 'textarea'),
  visibility,
  f('downloadEnabled', 'Show download action', 'checkbox'),
  f('lastUpdated', 'Last updated', 'date'),
  f('externalUrl', 'External PDF URL', 'url', {
    help: 'Used when no version is published. Archiving the current PDF may reactivate this fallback.',
  }),
  f('links', 'Resume / coding profile links', 'repeater', { fields: links, max: 12 }),
];
