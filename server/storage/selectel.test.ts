import { describe, expect, it } from 'vitest';

import { readRuntimeConfig } from '../config';
import { createSelectelMediaSigner, StorageConfigurationError } from './selectel';

describe('Selectel media signer', () => {
  it('uses a ninety-minute default URL lifetime for long lessons', () => {
    expect(readRuntimeConfig({}).s3SignedUrlTtlSeconds).toBe(5400);
  });

  it('rejects incomplete storage configuration', () => {
    expect(() => createSelectelMediaSigner(readRuntimeConfig({}))).toThrow(StorageConfigurationError);
  });

  it('creates a time-limited S3-compatible GET URL without a network request', async () => {
    const signer = createSelectelMediaSigner(readRuntimeConfig({
      S3_ENDPOINT: 'https://s3.storage.selcloud.ru',
      S3_REGION: 'ru-1',
      S3_BUCKET: 'private-course-media',
      S3_ACCESS_KEY_ID: 'placeholder-access-key',
      S3_SECRET_ACCESS_KEY: 'placeholder-secret-key',
      S3_SIGNED_URL_TTL_SECONDS: '600',
    }));

    const result = await signer.createDownloadUrl('courses/the-yoga-method/lesson-1.mp4');
    expect(result.expiresIn).toBe(600);
    expect(result.url).toContain('X-Amz-Signature=');
    expect(result.url).toContain('lesson-1.mp4');
  });
});
