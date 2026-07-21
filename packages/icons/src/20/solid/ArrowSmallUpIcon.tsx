import * as React from 'react';

export interface ArrowSmallUpIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowSmallUpIcon = React.forwardRef<SVGSVGElement, ArrowSmallUpIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M10 15a.75.75 0 0 1-.75-.75V7.612L7.29 9.77a.75.75 0 0 1-1.08-1.04l3.25-3.5a.75.75 0 0 1 1.08 0l3.25 3.5a.75.75 0 1 1-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0 1 10 15Z" clipRule="evenodd" />
    </svg>
  ),
);

ArrowSmallUpIcon.displayName = 'ArrowSmallUpIcon';
