import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';
import './animations.css';

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'text-underline' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...rest }, ref) => {
    const cls = ['nx-btn', `nx-btn--${variant}`, className].filter(Boolean).join(' ');
    return (
      <button ref={ref} className={`${cls} ${variant === 'text-underline' ? 'with-underline' : ''}` } {...rest}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
