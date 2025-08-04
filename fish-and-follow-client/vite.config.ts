import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from 'vite-plugin-pwa';
import { manifest } from './manifest';

const devServer = {
  target: process.env.REACT_APP_API_URL ?? 'http://localhost:3000',
  changeOrigin: true,
};

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate', devOptions: {
        enabled: true
      },
      manifest,
    }),
  ],
  server: {
    proxy: {
      '/api': devServer,
      '/auth/status': devServer,
      '/signin': devServer,
      '/signout': devServer,
      '/contact-submit': devServer,
    }
  }
});
