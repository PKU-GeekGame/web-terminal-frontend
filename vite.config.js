import {defineConfig} from 'vite';
import {compression, defineAlgorithm} from 'vite-plugin-compression2'
import zlib from 'zlib';

export default defineConfig(() => {
    return {
        build: {
            target: ['es2020', 'firefox78', 'chrome79', 'safari13'],
            outDir: 'build',
            sourcemap: false,
            reportCompressedSize: false,
            rollupOptions: {
                output: {
                    compact: true,
                    generatedCode: 'es2015',
                }
            },
            minify: 'terser',
        },
        esbuild: {
            legalComments: 'none',
        },
        plugins: [
            compression({
                include: /\.*$/,
                exclude: /\.(png|jpg|jpeg|webp|mp3|ogg|webm)$/i,
                algorithms: [
                    defineAlgorithm('brotliCompress', {
                        params: {
                            [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
                            [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
                        },
                    }),
                ],
            }),
        ],
    };
});
