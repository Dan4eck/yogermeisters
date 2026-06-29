import express, { type Express, type Request } from "express";
import fs from "fs";
import path from "path";

interface RouteMeta {
  readonly title: string;
  readonly description: string;
  readonly imagePath: `/${string}`;
}

const routeMeta: Record<string, RouteMeta> = {
  "/the-yoga-method": {
    title: "the yoga method | Yogermeisters",
    description:
      "Онлайн-курс по йоге для спины, осанки, гибкости и глубокого расслабления. Предпродажа курса от €49.",
    imagePath: "/assets/landing-v2/cutouts/himalayan-bg.png",
  },
  "/himalayan-yoga-course": {
    title: "the yoga method | Yogermeisters",
    description:
      "Онлайн-курс по йоге для спины, осанки, гибкости и глубокого расслабления. Предпродажа курса от €49.",
    imagePath: "/assets/landing-v2/cutouts/himalayan-bg.png",
  },
};

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    const meta = routeMeta[getCleanPath(req)];

    if (!meta) {
      res.sendFile(indexPath);
      return;
    }

    const html = fs.readFileSync(indexPath, "utf-8");
    res.type("html").send(injectRouteMeta(html, meta, getBaseUrl(req)));
  });
}

function getCleanPath(req: Request): string {
  return req.originalUrl.split("?")[0] || "/";
}

function getBaseUrl(req: Request): string {
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = forwardedProto || req.protocol;
  return `${proto}://${req.get("host")}`;
}

function injectRouteMeta(html: string, meta: RouteMeta, baseUrl: string): string {
  const absoluteImageUrl = `${baseUrl}${meta.imagePath}`;

  return html
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:image" content="${escapeHtml(absoluteImageUrl)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:image" content="${escapeHtml(absoluteImageUrl)}" />`,
    );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
