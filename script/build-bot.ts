import { build as esbuild } from 'esbuild';
import { mkdir } from 'fs/promises';

async function buildBot(): Promise<void> {
  await mkdir('dist', { recursive: true });
  await esbuild({
    entryPoints: ['telegram-bot/index.ts'],
    platform: 'node',
    bundle: true,
    format: 'cjs',
    outfile: 'dist/telegram-bot.cjs',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    external: ['pg-native'],
    minify: true,
    logLevel: 'info',
  });
}

buildBot().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
