export default {
  plugins: {
   'postcss-preset-env': {
      stage: 2,
      features: {
        'nesting-rules': true,
      },
      autoprefixer: {
        grid: 'autoplace'
      }
    },
  },
}
