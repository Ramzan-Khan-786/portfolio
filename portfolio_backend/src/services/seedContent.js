import Profile from '../models/Profile.js';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import NavigationItem from '../models/NavigationItem.js';
import ShowroomItem from '../models/ShowroomItem.js';
import Setting from '../models/Setting.js';
const insert = (Model, filter, content) =>
  Model.findOneAndUpdate(
    filter,
    { $setOnInsert: content },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

// Seed only absent records. CMS edits always take precedence.
export async function seedContent({ typewriterUrl = '' } = {}) {
  await insert(
    Profile,
    {},
    {
      name: 'Ramzan Khan',
      initials: 'RK',
      headline: 'Building useful software. Thinking through the systems behind it.',
      shortIntro:
        'A developer focused on backend engineering, thoughtful interfaces, and the details that make a product reliable.',
      bio: 'I enjoy working across the full stack: shaping an idea, modelling its data, building an API, and connecting it to an interface people can use. This space brings together my projects and engineering interests.',
      location: 'India',
      availability: 'Open to engineering conversations',
      focusAreas: ['Backend systems', 'Full-stack development', 'Developer experience'],
    },
  );
  for (const [index, [name, category]] of [
    ['JavaScript', 'Languages'],
    ['Node.js', 'Backend'],
    ['Express', 'Backend'],
    ['MongoDB', 'Databases'],
    ['React', 'Frontend'],
    ['Git', 'Tools'],
  ].entries()) {
    await insert(Skill, { name }, { name, category, order: index, visible: true });
  }
  const project = await insert(
    Project,
    { slug: 'typewriter' },
    {
      title: 'TypeWriter / Developers Keystroke',
      slug: 'typewriter',
      summary: 'An independent typing experience, presented here through the Engineering Showroom.',
      description:
        'TypeWriter is developed and deployed independently. Its live experience can be opened inside the showroom when an integration URL is configured.',
      technologies: ['MongoDB', 'Express', 'React', 'Node.js'],
      status: 'in-progress',
      published: true,
      featured: true,
      order: 0,
      liveUrl: typewriterUrl,
    },
  );
  // Upgrade only the exact legacy default navigation; customized rows are not rewritten.
  const legacy = [
    ['Profile', '/'],
    ['Skills', '/skills'],
    ['Work', '/work'],
    ['Showroom', '/showroom'],
    ['About', '/about'],
    ['Contact', '/contact'],
  ];
  const existingNav = await NavigationItem.find().sort({ order: 1 }).lean();
  if (
    existingNav.length === legacy.length &&
    existingNav.every(
      (row, index) =>
        row.label === legacy[index][0] &&
        row.destination === legacy[index][1] &&
        row.order === index &&
        row.enabled,
    )
  ) {
    await NavigationItem.updateOne(
      { _id: existingNav[0]._id },
      { destination: '/profile', order: 1 },
    );
    for (let index = 1; index < existingNav.length; index++)
      await NavigationItem.updateOne(
        { _id: existingNav[index]._id },
        { order: index + (index >= 4 ? 2 : 1) },
      );
  }
  for (const [order, [label, destination]] of [
    ['Home', '/'],
    ['Profile', '/profile'],
    ['Skills', '/skills'],
    ['Work', '/work'],
    ['Showroom', '/showroom'],
    ['Resume', '/resume'],
    ['About', '/about'],
    ['Contact', '/contact'],
  ].entries()) {
    await insert(
      NavigationItem,
      { label },
      { label, destination, type: 'route', order, enabled: true },
    );
  }
  await insert(
    ShowroomItem,
    { label: 'TypeWriter' },
    {
      label: 'TypeWriter',
      project: project._id,
      description: 'The independent TypeWriter experience.',
      presentationType: 'iframe',
      embedUrl: typewriterUrl,
      externalUrl: typewriterUrl,
      status: 'live',
      enabled: true,
      isDefault: true,
      order: 0,
    },
  );
  await insert(
    ShowroomItem,
    { label: 'Next experiment' },
    {
      label: 'Next experiment',
      description:
        'Another engineering project is taking shape. Its interactive experience will appear here when it is ready.',
      presentationType: 'coming-soon',
      status: 'coming-soon',
      enabled: true,
      order: 1,
    },
  );
  for (const [key, value] of [
    ['siteName', 'Ramzan Khan — Engineering Portfolio'],
    [
      'siteDescription',
      'Projects, engineering interests, and interactive software by Ramzan Khan.',
    ],
    ['footerLine', 'Thoughtful software, from interface to infrastructure.'],
  ]) {
    await insert(Setting, { key }, { key, value });
  }
}
