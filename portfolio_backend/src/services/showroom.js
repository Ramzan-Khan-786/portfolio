import Setting from '../models/Setting.js';
import Project from '../models/Project.js';
import ShowroomItem from '../models/ShowroomItem.js';
import { ApiError } from '../utils/ApiError.js';
export async function checkProject(input) {
  if (input.project && !(await Project.exists({ _id: input.project })))
    throw new ApiError(422, 'Choose an existing project.', {
      fieldErrors: { project: ['Project no longer exists.'] },
    });
}
export async function setDefault(document, requested) {
  if (requested && document.enabled) {
    await Setting.findOneAndUpdate(
      { key: 'defaultShowroomId' },
      { value: document.id },
      { upsert: true },
    );
  } else {
    await Setting.updateOne({ key: 'defaultShowroomId', value: document.id }, { value: '' });
  }
  // The single settings document is authoritative, so concurrent requests cannot create two defaults.
}
export async function showroomRecords(publicOnly = false) {
  const [records, setting] = await Promise.all([
    ShowroomItem.find(publicOnly ? { enabled: true } : {})
      .sort({ order: 1, _id: 1 })
      .populate(
        publicOnly
          ? {
              path: 'project',
              match: { published: true, archived: false },
              select: 'title slug summary technologies liveUrl githubUrl',
            }
          : { path: 'project', select: 'title' },
      )
      .lean(),
    Setting.findOne({ key: 'defaultShowroomId' }).lean(),
  ]);
  const preferred = setting
    ? records.find((item) => String(item._id) === setting.value && item.enabled)
    : records.find((item) => item.isDefault && item.enabled);
  const selected = preferred || records.find((item) => item.enabled);
  return records.map((item) => ({
    ...item,
    isDefault: String(item._id) === String(selected?._id),
    presentationType: item.presentationType === 'sandbox' ? 'iframe' : item.presentationType,
  }));
}
