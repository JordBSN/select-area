import { defineConfig } from 'vite';
import typescript from "@rollup/plugin-typescript";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts',
            name: 'select-image-area',
        },
        rollupOptions: {
            plugins: [
                typescript({
                    outDir: 'dist',
                    declaration: true
                })
            ]
        }
    },
});
