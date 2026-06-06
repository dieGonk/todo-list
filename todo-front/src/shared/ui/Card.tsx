import type { HTMLAttributes, PropsWithChildren } from 'react';

export const Card = ({ children, className = '', ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};
