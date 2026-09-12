import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AlumniConnect',
    short_name: 'AlumniConnect',
    description: 'The verified professional network for your university community.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#0A0A0A',
  };
}
