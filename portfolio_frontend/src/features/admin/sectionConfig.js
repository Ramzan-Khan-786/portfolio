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
      f('headline', 'Headline', 'textarea'),
      f('introduction', 'Introduction', 'textarea'),
      f('imageUrl', 'Hero image override', 'url'),
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
  appearance: {
    title: 'Themes',
    description:
      'Enable the palettes available to visitors and choose the first-visit default. Returning visitors keep their choice.',
    fields: [
      f('defaultTheme', 'Default theme', 'select', {
        options: ['dark', 'light', 'midnight', 'graphite', 'terminal'],
      }),
      f('followSystem', 'Follow system preference on first visit', 'checkbox'),
      f('enabledThemes', 'Available themes', 'choices', {
        options: ['dark', 'light', 'midnight', 'graphite', 'terminal'],
        help: 'Terminal is displayed to visitors as Fieldwork. Keep the default theme enabled.',
      }),
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
    help: 'Used when no file has been uploaded. Uploaded files take precedence.',
  }),
  f('links', 'Resume / coding profile links', 'repeater', { fields: links, max: 12 }),
];
