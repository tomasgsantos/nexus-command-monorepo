import { createElement } from 'react';

const motion = new Proxy(
  {},
  {
    get: (_target, tag: string) =>
      ({ children, ...props }: any) =>
        createElement(tag, props, children),
  },
);

const AnimatePresence = ({ children }: any) => children;

export { motion, AnimatePresence };
