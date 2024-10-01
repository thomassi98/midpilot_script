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
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        oneOf: [
          // Handle CSS imports with ?inline
          {
            resourceQuery: /inline/,
            use: 'raw-loader',
          },
          // Handle other CSS imports
          {
            use: [
              'style-loader', // Injects styles into the DOM
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                },
              },
              'postcss-loader', // Processes Tailwind CSS
            ],
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      '@components': path.resolve(__dirname, 'src/components/'),
      '@containers': path.resolve(__dirname, 'src/containers/'),
      '@styles': path.resolve(__dirname, 'src/styles/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
      '@services': path.resolve(__dirname, 'src/services/'),
      '@lib': path.resolve(__dirname, 'src/lib/'),
    },
  },
};