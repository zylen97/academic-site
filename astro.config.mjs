// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://zylen.github.io',
  base: '/academic-site',
  vite: {
    plugins: [tailwindcss()],
  },
});
