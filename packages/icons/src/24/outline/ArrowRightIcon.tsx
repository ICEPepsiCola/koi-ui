import * as React from 'react';

export interface ArrowRightIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowRightIcon = React.forwardRef<SVGSVGElement, ArrowRightIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  ),
);

ArrowRightIcon.displayName = 'ArrowRightIcon';
