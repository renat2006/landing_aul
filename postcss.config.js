module.exports = {
  plugins: [
    [
      'postcss-preset-env',
      {
        autoprefixer: {
          grid: true,
          flexbox: 'no-2009'
        },
        stage: 1,
        features: {
          'custom-properties': false,
          'nesting-rules': true,
          'custom-media-queries': true,
          'media-query-ranges': true
        }
      }
    ]
  ]
}; 