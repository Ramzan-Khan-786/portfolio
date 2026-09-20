import mongoose from 'mongoose';
import { themeNames, themeModes, themeDefaults } from '../../../shared/themes.js';
const schema = new mongoose.Schema({
  key: { type: String, default: 'primary', unique: true },
  mode: { type: String, enum: themeModes, default: themeDefaults.mode },
  universalTheme: { type: String, enum: themeNames, default: 'dark' },
  enabledThemes: { type: [String], default: themeNames },
  allowVisitorOverride: { type: Boolean, default: true },
  revision: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
export default mongoose.model('ThemeSettings', schema);
