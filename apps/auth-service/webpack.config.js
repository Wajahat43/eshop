const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['apps/auth-service/src/assets'], // Changed from './src/assets' to 'apps/auth-service/src/assets'
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
