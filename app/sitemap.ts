import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ['/', '/alumni', '/jobs', '/events', '/login', '/register'].map((path) => ({
    url: `https://alumniconnect.example${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'daily',
    priority: path === '/' ? 1 : 0.8,
  }));
}
