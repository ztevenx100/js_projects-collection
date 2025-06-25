import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://js-projects-collection-gamma.vercel.app/',
  integrations: [
    sitemap(),
  ],
  outDir: './dist',
});
