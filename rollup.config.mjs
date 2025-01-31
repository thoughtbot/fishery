import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

/**
 * @type {import('rollup').RollupOptions}
 */
const baseConfig = {
  input: 'lib/index.ts',
  plugins: [typescript({ tsconfigOverride: { exclude: ['**/__tests__/**'] } })],
};

const external = ['lodash.mergewith'];

/**
 * @type {import('rollup').RollupOptions[]}
 */
const config = [
  // CommonJS
  {
    ...baseConfig,
    output: { file: 'dist/fishery.js', format: 'cjs' },
    external,
  },
  // ES Modules
  {
    ...baseConfig,
    output: { file: 'dist/fishery.mjs', format: 'es' },
    external,
  },
  // UMD
  {
    ...baseConfig,
    output: {
      file: 'dist/fishery.umd.js',
      format: 'umd',
      name: 'Fishery',
    },
    plugins: [...baseConfig.plugins, nodeResolve(), commonjs()],
    external: [],
  },
];

export default config;
