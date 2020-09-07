import { exec } from 'child_process';

function execPromise(cmd) {
    return new Promise((resolve) => {
        exec(cmd, (error, stdout, stderr) => {
            error && console.warn(error);
            stderr && console.warn(stderr);
            stdout && console.log(stdout);
            resolve();
        });
    });
}

function deleteOldLib() {
    return execPromise('rm -rf ./lib');
}

function copySvelteFiles() {
    return execPromise('cp -a ./src/components ./lib/components');
}

function buildDir() {
    return execPromise(
        "tsc --rootDir './src' --outDir './lib' --declarationDir './lib' -d -p './tsconfig.json'"
    );
}

async function build() {
    await deleteOldLib();
    await buildDir();
    await copySvelteFiles();
}

build();
