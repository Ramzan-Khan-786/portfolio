import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
const client = new OAuth2Client();
export async function verifyGoogleIdentity(credential, nonce) {
  if (!env.googleClientId) throw new ApiError(503, 'Google sign-in is not configured.');
  let claims;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
    claims = ticket.getPayload();
  } catch {
    throw new ApiError(401, 'Google identity could not be verified. Please try again.');
  }
  if (!claims?.sub || claims.email_verified !== true || !claims.email || claims.nonce !== nonce)
    throw new ApiError(401, 'Google identity or sign-in challenge is invalid.');
  return {
    googleId: claims.sub,
    email: claims.email.toLowerCase(),
    name: String(claims.name || 'Portfolio user').slice(0, 80),
  };
}
