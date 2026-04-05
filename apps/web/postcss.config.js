import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    'postcss-mixins': {
      mixinsFiles: path.join(__dirname, 'src/assets/styles/mixins.css'),
    },
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
