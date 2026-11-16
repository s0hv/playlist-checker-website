import netlify from '@netlify/vite-plugin-tanstack-start';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    netlify(),
    tanstackStart({
      srcDirectory: 'src',
      router: {
        // Specifies the directory TanStack Router uses for your routes.
        routesDirectory: 'routes',
      },
      sitemap: {
        enabled: true,
        host: new URL(process.env.OAUTH_REDIRECT ?? 'https://localhost:3000').origin,
      },
      prerender: {
        enabled: false,
      },
    }),
    viteReact(),
  ],
});
