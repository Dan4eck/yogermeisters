import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { RuntimeConfig } from '../config';

export interface MediaSigner {
  createDownloadUrl(objectKey: string): Promise<{ readonly url: string; readonly expiresIn: number }>;
}

export class StorageConfigurationError extends Error {
  constructor() {
    super('Private media storage is not configured');
    this.name = 'StorageConfigurationError';
  }
}

export function createSelectelMediaSigner(config: RuntimeConfig): MediaSigner {
  const { s3Endpoint, s3Region, s3Bucket, s3AccessKeyId, s3SecretAccessKey, s3SignedUrlTtlSeconds } = config;

  if (!s3Endpoint || !s3Region || !s3Bucket || !s3AccessKeyId || !s3SecretAccessKey) {
    throw new StorageConfigurationError();
  }

  const client = new S3Client({
    endpoint: s3Endpoint,
    region: s3Region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: s3AccessKeyId,
      secretAccessKey: s3SecretAccessKey,
    },
  });

  return {
    async createDownloadUrl(objectKey: string) {
      const url = await getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: s3Bucket, Key: objectKey }),
        { expiresIn: s3SignedUrlTtlSeconds },
      );

      return { url, expiresIn: s3SignedUrlTtlSeconds };
    },
  };
}
