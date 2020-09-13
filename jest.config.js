module.exports = {
    transform: {
        '^.+\\.svelte$': 'svelte-jester',
        '^.+\\.(js|ts)$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'svelte'],
    testMatch: ['**/*.spec.(ts|js)'],
    testEnvironment: 'node',
    globals: { 'ts-jest': { tsConfig: 'tsconfig.json' } },
};
