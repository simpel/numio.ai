import { defineConfig } from 'tsup';

export const baseConfig = defineConfig({
  format: ['esm'],
  sourcemap: true,
  clean: true,
  dts: true,
});

export const nodeConfig = defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
});
