import * as React from 'react';

export interface ArrowSmallLeftIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowSmallLeftIcon = React.forwardRef<SVGSVGElement, ArrowSmallLeftIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0 6.75 6.75M4.5 12l6.75-6.75" />
    </svg>
  ),
);

ArrowSmallLeftIcon.displayName = 'ArrowSmallLeftIcon';
