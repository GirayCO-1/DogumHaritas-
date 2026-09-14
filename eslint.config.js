// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// eslint-plugin-import, `typescript` adıyla çözümleyiciyi ararken kaynak
// dosyadan yola çıkar; bulamazsa TypeScript derleyicisinin kendisini yükleyip
// "invalid interface" hatası verir. Mutlak yol vererek arama adımını atlıyoruz.
const tsResolver = require.resolve('eslint-import-resolver-typescript');

module.exports = defineConfig([
  expoConfig,
  {
    settings: {
      'import/resolver': {
        [tsResolver]: { project: './tsconfig.json' },
      },
    },
  },
  {
    ignores: ['dist/*', 'node_modules/*', 'server/node_modules/*', '.expo/*', 'src/data/*.json'],
  },
]);
