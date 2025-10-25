import netlify from '@netlify/vite-plugin-tanstack-start';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsconfigPaths(),
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
