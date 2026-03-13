import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://guardian-cleaners.com',
  adapter: vercel(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  },
  image: {
    remotePatterns: [{
      protocol: 'https',
      hostname: '**.supabase.co'
    }]
  }
});
