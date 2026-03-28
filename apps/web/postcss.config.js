export default {
  plugins: {
    'postcss-nested': {},
    'postcss-preset-env': {
      stage: 2,
      features: {
        'nesting-rules': false,
      },
      autoprefixer: {
        grid: 'autoplace'
      }
    },
  },
}
