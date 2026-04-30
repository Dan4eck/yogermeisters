import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'client/public/assets/brand/yogermeisters-logo-black-transparent.png',
  'client/public/assets/brand/yogermeisters-logo-white-transparent.png',
  'client/public/assets/brand/yogermeisters-logo-white-256.png',
  'client/public/assets/brand/yogermeisters-logo-white-512.png',
  'client/public/favicon.png',
  'client/public/apple-touch-icon.png',
  'client/public/site.webmanifest',
];

const failures = [];

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing required brand asset: ${relativePath}`);
  }
}

const navbar = fs.readFileSync(path.join(root, 'client/src/components/Navbar.tsx'), 'utf8');
const footer = fs.readFileSync(path.join(root, 'client/src/components/Footer.tsx'), 'utf8');
const hero = fs.readFileSync(path.join(root, 'client/src/components/Hero.tsx'), 'utf8');
const logoMark = fs.readFileSync(path.join(root, 'client/src/components/LogoMark.tsx'), 'utf8');
const index = fs.readFileSync(path.join(root, 'client/index.html'), 'utf8');

if (/bg-white\s+rounded-full/.test(navbar) || /bg-white\s+rounded-full/.test(footer)) {
  failures.push('Navbar/Footer still contain the old white-circle logo placeholder.');
}

if (!logoMark.includes('/assets/brand/yogermeisters-logo-white-transparent.png')) {
  failures.push('LogoMark does not reference the transparent white logo mark.');
}

if (!logoMark.includes('/assets/brand/yogermeisters-logo-black-transparent.png')) {
  failures.push('LogoMark does not reference the transparent black logo mark.');
}

if (!navbar.includes('<LogoMark') || !footer.includes('<LogoMark') || !hero.includes('<LogoMark')) {
  failures.push('Navbar, Footer, and Hero must render LogoMark.');
}

if (!index.includes('/favicon.png') || !index.includes('/apple-touch-icon.png') || !index.includes('/site.webmanifest')) {
  failures.push('Index head does not link the generated favicon, Apple touch icon, and web manifest.');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Brand assets and logo references are valid.');
