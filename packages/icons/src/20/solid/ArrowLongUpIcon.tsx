import * as React from 'react';

export interface ArrowLongUpIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowLongUpIcon = React.forwardRef<SVGSVGElement, ArrowLongUpIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M10 18a.75.75 0 0 1-.75-.75V4.66L7.3 6.76a.75.75 0 0 1-1.1-1.02l3.25-3.5a.75.75 0 0 1 1.1 0l3.25 3.5a.75.75 0 1 1-1.1 1.02l-1.95-2.1v12.59A.75.75 0 0 1 10 18Z" clipRule="evenodd" />
    </svg>
  ),
);

ArrowLongUpIcon.displayName = 'ArrowLongUpIcon';
