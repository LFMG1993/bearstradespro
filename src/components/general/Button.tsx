import type {ComponentProps} from 'react';

type ButtonProps = ComponentProps<'button'> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
};

const variants = {
    primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 focus:ring-[var(--primary)]',
    secondary: 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary-hover)] focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'bg-transparent border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)] focus-visible:ring-gray-400',
    ghost: 'bg-transparent text-[var(--foreground)] hover:bg-[var(--secondary)]',
};

const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'h-10 w-10',
};

export function Button({children, variant = 'primary', size = 'md', className, ...props}: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = variants[variant];
    const sizeClasses = sizes[size];

    return (
        <button className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`} {...props}>
            {children}
        </button>
    );
}