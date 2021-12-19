module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'react/prop-types': 0,
    'no-use-before-define': ['error', { variables: false }],
    'no-nested-ternary': 0,
    'no-underscore-dangle': 0,
    'react/destructuring-assignment': 0,
    'no-return-await': 0,
    'consistent-return': 0,
  },
};
