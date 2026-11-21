import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { handleRecommend, handleRouteInfo } from './server/api.ts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const mapsApiKey = env.VITE_GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyD1rDDP6T-gXOTFWeN8OY_xVry7g09jDyY';
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    define: {
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(mapsApiKey),
    },
    plugins: [
      {
        name: 'gemini-api-server',
        configureServer(server) {
          server.middlewares.use('/api/recommend', (req, res) => {
            handleRecommend(req, res);
          });
          server.middlewares.use('/api/routes', (req, res) => {
            handleRouteInfo(req, res);
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
