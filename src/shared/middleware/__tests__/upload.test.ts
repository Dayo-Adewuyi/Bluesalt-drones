import fs from 'node:fs';
import { uploadFileFilter, uploadStorage } from '../upload';
import { UPLOAD_DIR } from '../../utils/constants';
import { ValidationError } from '../../errors/AppError';

describe('upload middleware', () => {
  it('accepts allowed mime types', (done) => {
    uploadFileFilter({} as any, { mimetype: 'image/png' } as any, (err) => {
      expect(err).toBeNull();
      done();
    });
  });

  it('rejects disallowed mime types', (done) => {
    uploadFileFilter({} as any, { mimetype: 'application/pdf' } as any, (err) => {
      expect(err).toBeInstanceOf(ValidationError);
      done();
    });
  });

  it('creates upload dir and generates filename', (done) => {
    const storage: any = uploadStorage;
    const req: any = {};
    const file: any = { originalname: 'test.png' };

    if (fs.existsSync(UPLOAD_DIR)) {
      fs.rmSync(UPLOAD_DIR, { recursive: true, force: true });
    }

    storage.getDestination(req, file, (err: Error | null, destination: string) => {
      expect(err).toBeNull();
      expect(destination).toBe(UPLOAD_DIR);
      expect(fs.existsSync(destination)).toBe(true);

      storage.getFilename(req, file, (err2: Error | null, filename: string) => {
        expect(err2).toBeNull();
        expect(filename.endsWith('.png')).toBe(true);
        done();
      });
    });
  });
});
