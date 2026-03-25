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

export function getRetreatImageUrl(image: string): string {
  return imageUrlByFileName[image] ?? '';
}
