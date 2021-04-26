import ts from '@wessberg/rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import pkg from './package.json';
import rootPkg from '../../package.json';

export default [
  {
    input: 'src/main.ts',
    plugins: [
      resolve({
        rootDir: process.cwd()
      }),
      commonjs(),
      ts({
        tsconfig: './tsconfig.build.json'
      }),
    ],
    output: [{ dir: './dist', format: 'cjs', sourcemap: true }],

    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(rootPkg.dependencies || {}),
      ...Object.keys(rootPkg.peerDependencies || {}),
      'path', 'util', 'stream', 'os', 'tty', 'events', 'buffer'
    ],
  },
];
