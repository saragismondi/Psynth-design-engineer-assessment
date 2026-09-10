import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)]',
    'px-3 py-2 text-sm font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page',
    'disabled:pointer-events-none disabled:text-text-tertiary',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-accent text-text-inverse hover:bg-accent-hover disabled:bg-bg-muted',
        secondary:
          'border border-border-default bg-sage-surface text-accent hover:bg-bg-subtle disabled:border-border-subtle disabled:bg-bg-muted',
        ghost: 'bg-transparent text-text-primary hover:bg-bg-subtle',
      },
      size: {
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-9 px-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
