import React from 'react';
import { cn } from '@/lib/utils';

interface NeoCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  noShadow?: boolean;
}

export const NeoCard = ({
  children,
  className,
  color = 'white',
  noShadow = false,
}: NeoCardProps) => {
  return (
    <div
      className={cn(
        'border-4 border-black transition-all duration-200 p-6',
        !noShadow && 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
        className
      )}
      style={{ backgroundColor: color }}
    >
      {children}
    </div>
  );
};

export const NeoButton = ({
  children,
  className,
  onClick,
  color = '#A3E635',
  type = 'button',
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  color?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'border-2 border-black px-6 py-2 font-black uppercase tracking-wider transition-all duration-200',
        'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
      style={{ backgroundColor: color }}
    >
      {children}
    </button>
  );
};

export const NeoInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        'flex h-12 w-full border-2 border-black bg-white px-3 py-2 text-sm font-bold ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
NeoInput.displayName = 'NeoInput';

export const NeoBadge = ({
  children,
  className,
  color = '#A3E635',
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) => {
  return (
    <span
      className={cn('border-2 border-black px-2 py-0.5 text-xs font-black uppercase', className)}
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
};
