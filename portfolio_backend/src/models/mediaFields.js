import mongoose from 'mongoose';
export const mediaSchema = new mongoose.Schema({
  mediaId: { type: String, required: true },
  altText: { type: String, default: '', maxlength: 300 },
  caption: { type: String, default: '', maxlength: 600 },
}, { _id: false });
export const mediaField = () => ({ type: mediaSchema, default: null });
