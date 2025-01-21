import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // 指向 Next.js 应用的路径
  dir: './',
});

// Jest 配置
const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/_*.{js,jsx,ts,tsx}',
  ],
};

export default createJestConfig(config); 