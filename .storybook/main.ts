import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineMain } from '@storybook/nextjs-vite/node';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '../src');

export default defineMain({
  framework: '@storybook/nextjs-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', 'storybook-addon-pseudo-states'],
  staticDirs: [{ from: '../public', to: '/' }],
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [
        tailwindcss(),
        svgr({ include: '**/*.svg', svgrOptions: { svgo: false } }),
      ],
      resolve: {
        alias: {
          '@': srcDir,
          '#ui': srcDir,
        },
      },
    });
  },
});
