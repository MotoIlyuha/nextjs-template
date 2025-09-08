import * as React from 'react';

export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl tg-border border tg-surface ${className}`} {...props} />;
}

export function CardHeader({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 border-b tg-border ${className}`} {...props} />;
}

export function CardContent({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 ${className}`} {...props} />;
}

export function CardFooter({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 border-t tg-border ${className}`} {...props} />;
}


