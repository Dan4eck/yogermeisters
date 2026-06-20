const discoveredImages = import.meta.glob<string>(
  '../../../attached_assets/**/*.{png,jpg,jpeg,JPG,JPEG,webp,WEBP,avif,AVIF}',
  {
    eager: true,
    import: 'default',
  },
);

const imageUrlByFileName = Object.fromEntries(
  Object.entries(discoveredImages).map(([path, url]) => [path.split('/').pop() ?? path, url]),
);

const publicRetreatImageByFileName: Record<string, string> = {
  'thumb-cirali-retreat.jpeg': '/assets/landing-v2/retreats/thumb-cirali-retreat.jpeg',
  'thumb-nepal-retreat.jpg': '/assets/landing-v2/retreats/thumb-nepal-retreat.jpg',
  'thumb-prague-retreat.png': '/assets/landing-v2/retreats/thumb-prague-retreat.png',
};

export function getRetreatImageUrl(image: string): string {
  return imageUrlByFileName[image] ?? publicRetreatImageByFileName[image] ?? '';
}
