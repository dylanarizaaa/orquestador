module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'html', 'js', 'mjs', 'json'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ]
  },
  // `@spartan-ng/brain` y otras dependencias publican ESM (`.mjs`): se transforman para Jest.
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  moduleNameMapper: {
    // Componentes de spartan.ng generados en `libs/ui` (mismos alias que `tsconfig.json`).
    '^@spartan-ng/helm/(.*)$': '<rootDir>/libs/ui/$1/src/index.ts',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/*.model.ts',
    // Componentes de spartan.ng (helm) generados en `libs/ui`: también se miden.
    'libs/ui/**/*.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  testMatch: ['**/+(*.)+(spec).+(ts)'],
};
