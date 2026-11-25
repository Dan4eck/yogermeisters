import { getRetreatBySlug, getRetreatRecordBySlug, type RetreatRecord } from '@shared/retreats';

import type { AdminRepository } from './admin-repository';

export interface PageMeta {
  readonly title: string;
  readonly description: string;
  readonly imagePath: `/${string}`;
}

const DEFAULT_META: PageMeta = {
  title: 'Yogermeisters | Гималайская йога и ретриты',
  description:
    'Практикуй йогу и медитацию, изучай философию и погружайся в новый опыт на ретритах вместе с другими йогермейстерами!',
  imagePath: '/assets/og/home.jpg',
};

const COURSE_META: PageMeta = {
  title: 'the yoga method | Yogermeisters',
  description: 'Онлайн-курс по йоге для спины, осанки, гибкости и глубокого расслабления.',
  imagePath: '/assets/og/the-yoga-method.jpg',
};

const ROUTE_META: ReadonlyMap<string, PageMeta> = new Map<string, PageMeta>([
  ['/the-yoga-method', COURSE_META],
  ['/himalayan-yoga-course', COURSE_META],
]);

const RETREAT_IMAGES: ReadonlyMap<string, `/${string}`> = new Map<string, `/${string}`>([
  'sri-lanka-yoga-tour',
  'cirali-yoga-tour',
  'yoga-and-mountains-retreat',
  'nepal-buddhist-pilgrimage-tour',
].map((slug: string): [string, `/${string}`] => [slug, `/assets/og/${slug}.jpg`]));

async function loadRetreat(slug: string, repository: AdminRepository | undefined): Promise<RetreatRecord | null> {
  if (!repository) {
    return getRetreatBySlug(slug, 'ru');
  }
  try {
    return getRetreatRecordBySlug(await repository.listRetreats(), slug, 'ru');
  } catch {
    return getRetreatBySlug(slug, 'ru');
  }
}

export async function resolvePageMeta(requestPath: string, repository?: AdminRepository): Promise<PageMeta> {
  const pathname = requestPath.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  const routeMeta = ROUTE_META.get(pathname);
  if (routeMeta) {
    return routeMeta;
  }

  const slug = pathname.match(/^\/retreats\/([a-z0-9-]+)$/)?.[1];
  const retreat = slug ? await loadRetreat(slug, repository) : null;
  if (!retreat || retreat.status === 'draft') {
    return DEFAULT_META;
  }

  const details = [retreat.dateLabel, retreat.location].filter(Boolean).join(' · ');
  const summary = retreat.experience?.heroText
    ?? retreat.postBlocks.find((block): boolean => block.type === 'paragraph')?.text;
  return {
    title: `${retreat.title} | Yogermeisters`,
    description: [details, summary].filter(Boolean).join('. '),
    imagePath: RETREAT_IMAGES.get(retreat.slug) ?? DEFAULT_META.imagePath,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function injectPageMeta(html: string, meta: PageMeta, baseUrl: string, pathname: string): string {
  const image = `${baseUrl}${meta.imagePath}`;
  const values: readonly (readonly ['name' | 'property', string, string])[] = [
    ['name', 'description', meta.description],
    ['property', 'og:site_name', 'Yogermeisters'],
    ['property', 'og:title', meta.title],
    ['property', 'og:description', meta.description],
    ['property', 'og:url', `${baseUrl}${pathname}`],
    ['property', 'og:image', image],
    ['name', 'twitter:title', meta.title],
    ['name', 'twitter:description', meta.description],
    ['name', 'twitter:image', image],
  ];
  return values.reduce(
    (result: string, [attribute, key, value]): string => result.replace(
      new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*/>`),
      (): string => `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`,
    ),
    html.replace(/<title>.*?<\/title>/, (): string => `<title>${escapeHtml(meta.title)}</title>`),
  );
}
