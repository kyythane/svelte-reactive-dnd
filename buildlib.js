import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import svelte2tsx from 'svelte2tsx';
import sveltePreprocess from 'svelte-preprocess';
import { compile as svelteCompile, preprocess } from 'svelte/compiler';

const quiet =
    process.argv.findIndex((arg) => arg === '--quiet' || arg === '-q') >= 0;

function fromDir(startPath, filter) {
    if (!fs.existsSync(startPath)) {
        console.log('no dir', startPath);
        return [];
    }
    var files = fs.readdirSync(startPath);
    const found = [];
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            found.push(...fromDir(filename, filter)); //recurse
        } else if (filename.indexOf(filter) >= 0) {
            found.push(filename);
        }
    }
    return found;
}

function execPromise(cmd) {
    return new Promise((resolve) => {
        exec(cmd, (error, stdout, stderr) => {
            !quiet && error && console.warn(error);
            !quiet && stderr && console.warn(stderr);
            !quiet && stdout && console.log(stdout);
            resolve();
        });
    });
}

function deleteOldLib() {
    console.log('delete old lib');
    return execPromise('rm -rf ./lib');
}

function generateTsxFiles() {
    console.log('generate tsx files');
    const fileNames = fromDir('./src', '.svelte');
    fileNames.forEach((filename) => {
        const file = fs
            .readFileSync(filename, 'utf-8')
            .replace(/\s+$/, '')
            .replace(/\r\n/g, '\n');
        const output = svelte2tsx(file, {
            strictMode: false,
            isTsFile: true,
            filename,
        });
        fs.writeFileSync(
            filename.replace('.svelte', '.tsx'),
            output.code,
            'utf-8'
        );
    });
}

function buildDir() {
    console.log('compile types');
    return execPromise("tsc -p './buildlib.config.json'");
}

function cleanUpSrc() {
    console.log('remove tsx files');
    return execPromise("find ./src -print | grep -E 'tsx' | xargs rm -f");
}

function copySvelteFiles() {
    console.log('copy svelte files');
    const fileNames = fromDir('./src', '.svelte');
    return Promise.all(
        fileNames.map(async (filename) => {
            const file = fs
                .readFileSync(filename, 'utf-8')
                .replace(/\s+$/, '')
                .replace(/\r\n/g, '\n');
            const processed = await preprocess(file, sveltePreprocess(), {
                filename,
            });
            fs.writeFileSync(
                filename.replace('src', 'lib'),
                processed,
                'utf-8'
            );
        })
    );
}

async function cleanUpLib() {
    console.log('cleanup and format lib');
    await execPromise("find ./lib -print | grep -E 'jsx' | xargs rm -f");
    await execPromise('prettier --write ./lib/**/*.svelte');
    const file = fs.readFileSync('./lib/index.d.ts', 'utf-8');
    let stripped = file;
    while (stripped.indexOf('.svelte') > -1) {
        stripped = stripped.replace('.svelte', '');
    }
    fs.writeFileSync('./lib/index.d.ts', stripped, 'utf-8');
}

async function build() {
    await deleteOldLib();
    // generateTsxFiles is syncronous
    generateTsxFiles();
    await buildDir();
    await cleanUpSrc();
    await copySvelteFiles();
    await cleanUpLib();
}

build();
