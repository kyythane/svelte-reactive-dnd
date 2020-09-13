module.exports = {
    transform: {
        '^.+\\.svelte$': 'svelte-jester',
        '^.+\\.(js|ts)$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'svelte'],
};
