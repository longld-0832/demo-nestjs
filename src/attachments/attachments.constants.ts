import { join } from 'path';

/** Folder served as static files; anything inside is publicly reachable. */
export const PUBLIC_DIR = join(process.cwd(), 'public');
export const PUBLIC_URL_PREFIX = '/public';

export const AVATAR_FOLDER = 'avatars';
export const AVATAR_MAX_SIZE_MB = 2;
export const AVATAR_MAX_SIZE = AVATAR_MAX_SIZE_MB * 1024 * 1024;

/**
 * Hard cap enforced by multer so huge uploads are rejected before reaching
 * memory; the per-feature limit (e.g. AVATAR_MAX_SIZE) is checked in the
 * service so its error message can be translated.
 */
export const UPLOAD_HARD_LIMIT = 10 * 1024 * 1024;
