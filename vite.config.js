import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    var target = env.VITE_API_TARGET || 'http://localhost:3000';
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: target.trim(),
                    changeOrigin: true,
                    secure: true,
                    rewrite: function (path) { return path.replace(/^\/api/, ''); },
                    configure: function (proxy, _options) {
                        proxy.on('error', function (err, _req, _res) {
                            console.log('proxy error', err);
                        });
                        proxy.on('proxyReq', function (proxyReq, req, _res) {
                            console.log('Sending Request to the Target:', req.method, req.url);
                        });
                        proxy.on('proxyRes', function (proxyRes, req, _res) {
                            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                        });
                    },
                },
                '/socket.io': {
                    target: target,
                    ws: true,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});
