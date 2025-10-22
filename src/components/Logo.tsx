import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`font-bold ${sizeClasses[size]} ${className}`}>
      <span className="text-blue-600">k</span>
      <span className="text-foreground">ampus</span>
    </div>
  );
}
