import { z } from 'zod';
import { categories } from '../services/cloudinary/constants.js';
export const mediaReferenceValue = z.object({
  mediaId: z.string().regex(/^[a-f\d]{24}$/i),
  altText: z.string().trim().max(300).default(''),
  caption: z.string().trim().max(600).default(''),
});
export const mediaReference = mediaReferenceValue.nullable().optional().default(null);
export const mediaMetadataSchema = z.object({
  displayName: z.string().trim().min(1).max(160),
  altText: z.string().trim().max(300).default(''),
  caption: z.string().trim().max(600).default(''),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
}).strict();
export const mediaUploadSchema = z.object({
  category: z.enum(categories),
  projectSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160).optional(),
}).strict();
