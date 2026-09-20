import mongoose from 'mongoose';
import { mediaField } from './mediaFields.js';

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    initials: { type: String, default: 'RK', trim: true, maxlength: 4 },
    headline: { type: String, required: true, trim: true },
    shortIntro: { type: String, required: true, trim: true },
    bio: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    availability: { type: String, trim: true },
    profileMedia: mediaField(),
    profileImage: { type: String, trim: true },
    resumeUrl: { type: String, trim: true },
    focusAreas: [{ type: String, trim: true }],
    primaryCtaLabel: { type: String, default: 'View work' },
    primaryCtaUrl: { type: String, default: '/work' },
    secondaryCtaLabel: { type: String, default: 'Enter showroom' },
    secondaryCtaUrl: { type: String, default: '/showroom' },
  },
  { timestamps: true },
);

export default mongoose.model('Profile', profileSchema);
