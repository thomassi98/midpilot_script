const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'midpilot.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'midpilot',
      type: 'umd',
    },
  },
  mode: 'production', // Use 'production' for minified output
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // Add rules for CSS or other assets if needed
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@components': path.resolve(__dirname, 'src/components/'),
      '@containers': path.resolve(__dirname, 'src/containers/'),
      '@styles': path.resolve(__dirname, 'src/styles/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
      '@services': path.resolve(__dirname, 'src/services/'),
    },
  },
};
