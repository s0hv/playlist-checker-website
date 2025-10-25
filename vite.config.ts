import netlify from '@netlify/vite-plugin-tanstack-start';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { prerenderHeader } from './src/constants';

export default defineConfig({
  server: {
    port: 3000,
  },
  ssr: {
    noExternal: ['@mui/*'],
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
        host: new URL(process.env.OAUTH_REDIRECT ?? '').origin,
      },
      prerender: {
        enabled: true,
        // This header can be used to disable optional features during the prerender
        // such as automatic redirects based on authentication status.
        headers: { [prerenderHeader]: 'true' },
      },
    }),
    viteReact(),
  ],
});
