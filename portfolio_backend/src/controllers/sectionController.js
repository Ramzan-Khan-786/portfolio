import ContentSection from '../models/ContentSection.js';
import { sectionSchemas } from '../validation/sections.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
export async function publicSections() {
  const rows = await ContentSection.find().lean();
  return Object.fromEntries(rows.filter((r) => sectionSchemas[r.key]).map((r) => [r.key, r.data]));
}
function schemaFor(key) {
  const schema = sectionSchemas[key];
  if (!Object.hasOwn(sectionSchemas, key) || !schema)
    throw new ApiError(404, 'Content section not found.');
  return schema;
}
export const getSection = asyncHandler(async (req, res) => {
  const schema = schemaFor(req.params.key);
  const row = await ContentSection.findOne({ key: req.params.key }).lean();
  res.json({ ok: true, data: row?.data || schema.parse({}) });
});
export const putSection = asyncHandler(async (req, res) => {
  const result = schemaFor(req.params.key).safeParse(req.body);
  if (!result.success)
    throw new ApiError(422, 'Please check the highlighted fields.', result.error.flatten());
  await ContentSection.findOneAndUpdate(
    { key: req.params.key },
    { data: result.data },
    { upsert: true, runValidators: true },
  );
  res.json({ ok: true, data: result.data });
});
