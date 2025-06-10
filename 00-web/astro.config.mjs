import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com', // Reemplaza con la URL de tu sitio
  integrations: [
    sitemap(),
  ],
});
