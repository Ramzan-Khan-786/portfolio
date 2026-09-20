import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
const Lease = mongoose.model('CmsMutationLease', new mongoose.Schema({
  _id: String, owner: String, expiresAt: Date,
}));
// Serializes CMS mutations across API processes, including content references and deletion.
export const cmsMutationLock = asyncHandler(async (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const owner = randomUUID();
  try {
    await Lease.findOneAndUpdate(
      { _id: 'cms', expiresAt: { $lte: new Date() } },
      { owner, expiresAt: new Date(Date.now() + 180000) },
      { upsert: true, new: true },
    );
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, 'Another CMS change is in progress. Please retry shortly.');
    throw error;
  }
  let released = false;
  const heartbeat = setInterval(() => {
    Lease.updateOne({ _id: 'cms', owner }, { expiresAt: new Date(Date.now() + 180000) })
      .catch(() => { /* Keep the original lease until expiry if MongoDB is unavailable. */ });
  }, 30000);
  heartbeat.unref();
  const release = () => {
    if (released) return;
    released = true;
    clearInterval(heartbeat);
    Lease.deleteOne({ _id: 'cms', owner }).catch(() => {});
  };
  // Keep renewing while a live request works; a slow upload must never lose its lock.
  // end() also runs when a controller completes after the browser disconnected.
  const end = res.end;
  res.end = function (...args) { release(); return end.apply(this, args); };
  res.once('finish', release);
  // An incomplete, aborted body cannot reach the mutation controller. Completed
  // requests keep their lease until their provider/database operation finishes.
  req.once('aborted', () => { if (!req.complete) release(); });
  next();
});
