import { type HTMLAttributes, forwardRef } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'rounded-xl bg-[#FAFAFA] p-6',
          'border border-gray-200',
          hover &&
            'cursor-pointer transition-shadow duration-200 hover:shadow-lg',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
