module.exports = {
    "root": true,
    "env": {
      "node": true,
      "browser": true,
      "es6": true
    },
    "extends": [
      "eslint:recommended"
    ],
    "parserOptions": {
      "ecmaVersion": 2020
    },
    "rules": {
      "no-console": "off",
      "no-debugger": "off",
      "no-fallthrough": 'off'
    }
  }