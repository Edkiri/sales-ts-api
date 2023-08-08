module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  extends: ['airbnb-typescript/base', 'plugin:prettier/recommended'],
  plugins: ['import', '@typescript-eslint'],
  rules: {
    'comma-dangle': 0,
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'no-return-assign': 0,
    camelcase: 0,
    'import/extensions': 0,
    '@typescript-eslint/no-redeclare': 0,
    "@typescript-eslint/lines-between-class-members": 0
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
  ignorePatterns: ['.eslintrc.js'],
};
