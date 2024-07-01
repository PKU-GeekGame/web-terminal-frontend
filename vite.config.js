import {defineConfig} from 'vite';

export default defineConfig(() => {
    return {
        build: {
            outDir: 'build',
            sourcemap: false,
            rollupOptions: {
                output: {
                    compact: true,
                    generatedCode: 'es2015',
                }
            }
        },
        esbuild: {
            legalComments: 'none',
        },
    };
});
