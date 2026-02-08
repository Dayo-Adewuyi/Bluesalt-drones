import type { Express } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ALLOWED_UPLOAD_MIME_TYPES, MAX_FILE_SIZE, UPLOAD_DIR } from '../utils/constants';
import { ValidationError } from '../errors/AppError';

function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

export const uploadFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile?: boolean) => void,
): void => {
  if (!ALLOWED_UPLOAD_MIME_TYPES.includes(file.mimetype)) {
    return cb(new ValidationError('Unsupported file type'));
  }
  return cb(null, true);
};

export const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: uploadFileFilter,
});
