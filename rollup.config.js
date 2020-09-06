import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';


export default {
    input: 'src/index.js',
    output: [
        { file: pkg.module, 'format': 'es' },
        { file: pkg.main, 'format': 'umd', name: 'ReactiveDnD' },
    ],
    plugins: [
        svelte(),
        resolve(),
        typescript(),
    ]
};