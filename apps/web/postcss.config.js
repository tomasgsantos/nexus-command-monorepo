export default {
  plugins: {
    'postcss-mixins': {},
    'postcss-for': {},
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
