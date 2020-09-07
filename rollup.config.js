import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import sveltePreprocess from 'svelte-preprocess';
// import dts from 'rollup-plugin-dts';
import pkg from './package.json';

const name = pkg.name
    .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
    .replace(/^\w/, (match) => match.toUpperCase())
    .replace(/-\w/g, (match) => match[1].toUpperCase());

export default [
    {
        input: 'src/index.js',
        output: [
            { file: pkg.module, format: 'es' },
            { file: pkg.main, format: 'umd', name },
            {
                file: pkg.main.replace('.js', '.min.js'),
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
            typescript(),
        ],
    },
    /*{
        input: 'src/type_exports.d.ts',
        external: [
            'svelte',
            'svelte/internal',
            'svelte/store',
            'svelte/motion',
            'svelte/easing',
        ],
        output: {
            file: pkg.main.replace('.js', '.d.ts'),
            format: 'es',
        },
        plugins: [
            svelte({
                preprocess: sveltePreprocess(),
            }),
            dts(),
        ],
    },*/
];
