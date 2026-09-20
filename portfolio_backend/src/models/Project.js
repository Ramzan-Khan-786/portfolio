import mongoose from 'mongoose';
import { mediaField, mediaSchema } from './mediaFields.js';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    thumbnailMedia: mediaField(),
    coverMedia: mediaField(),
    gallery: { type: [mediaSchema], default: [] },
    imageUrl: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '' },
    screenshots: [{ type: String }],
    technologies: [{ type: String, trim: true }],
    githubUrl: { type: String, trim: true, default: '' },
    liveUrl: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['active', 'maintained', 'archived', 'in-progress'],
      default: 'active',
    },
    year: { type: Number },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

projectSchema.index({ published: 1, archived: 1, order: 1 });
export default mongoose.model('Project', projectSchema);
