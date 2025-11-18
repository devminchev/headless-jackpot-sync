module.exports = {
    preset: 'ts-jest',
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
        "^.+\\.(js|jsx)$": "babel-jest",
    },
    moduleNameMapper: {
        '\\.css$': 'identity-obj-proxy',
    },
    testEnvironment: 'jest-environment-jsdom',
};