import { describe, expect, it } from 'vitest';

import { readRuntimeConfig } from './config';

describe('runtime configuration', () => {
  it('reads a sufficiently long admin API key', () => {
    const adminApiKey = 'test-admin-api-key-with-at-least-32-characters';
    expect(readRuntimeConfig({ ADMIN_API_KEY: adminApiKey }).adminApiKey).toBe(adminApiKey);
  });

  it('rejects a short admin API key', () => {
    expect(() => readRuntimeConfig({ ADMIN_API_KEY: 'too-short' })).toThrow(
      'ADMIN_API_KEY must contain at least 32 characters',
    );
  });
});
