import * as React from 'react';

export interface DivideIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const DivideIcon = React.forwardRef<SVGSVGElement, DivideIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
  <path d="M9 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
    </svg>
  ),
);

DivideIcon.displayName = 'DivideIcon';
