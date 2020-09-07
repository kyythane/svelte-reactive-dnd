import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';

import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import sveltePreprocess from 'svelte-preprocess';
import package from './package.json';

export default {
    input: 'src/index.js',
    output: [
        { file: package.module, format: 'es' },
        { file: package.main, format: 'umd', name: 'ReactiveDnD' },
        {
            file: package.main.replace('.js', '.min.js'),
            format: 'iife',
            name,
            plugins: [terser()],
        },
    ],
    plugins: [
        svelte({
            preprocess: sveltePreprocess(),
        }),
        resolve(),
        //typescript(),
    ],
};
