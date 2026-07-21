export interface RuntimeConfig {
  readonly appUrl: string;
  readonly databaseUrl?: string;
  readonly sessionSecret?: string;
  readonly googleClientId?: string;
  readonly googleClientSecret?: string;
  readonly googleCallbackUrl: string;
  readonly developmentAuthEmail?: string;
  readonly s3Endpoint?: string;
  readonly s3Region?: string;
  readonly s3Bucket?: string;
  readonly s3AccessKeyId?: string;
  readonly s3SecretAccessKey?: string;
  readonly s3SignedUrlTtlSeconds: number;
}

export function readRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const appUrl = stripTrailingSlash(env.APP_URL || 'http://localhost:3001');

  return {
    appUrl,
    databaseUrl: emptyToUndefined(env.DATABASE_URL),
    sessionSecret: emptyToUndefined(env.SESSION_SECRET),
    googleClientId: emptyToUndefined(env.GOOGLE_CLIENT_ID),
    googleClientSecret: emptyToUndefined(env.GOOGLE_CLIENT_SECRET),
    googleCallbackUrl: env.GOOGLE_CALLBACK_URL || `${appUrl}/auth/google/callback`,
    developmentAuthEmail: emptyToUndefined(env.DEV_AUTH_EMAIL),
    s3Endpoint: emptyToUndefined(env.S3_ENDPOINT),
    s3Region: emptyToUndefined(env.S3_REGION),
    s3Bucket: emptyToUndefined(env.S3_BUCKET),
    s3AccessKeyId: emptyToUndefined(env.S3_ACCESS_KEY_ID),
    s3SecretAccessKey: emptyToUndefined(env.S3_SECRET_ACCESS_KEY),
    s3SignedUrlTtlSeconds: readPositiveInteger(env.S3_SIGNED_URL_TTL_SECONDS, 5400),
  };
}

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function readPositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
