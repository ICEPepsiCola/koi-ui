import * as React from 'react';

export interface UnderlineIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const UnderlineIcon = React.forwardRef<SVGSVGElement, UnderlineIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M4.75 2a.75.75 0 0 1 .75.75V7a2.5 2.5 0 0 0 5 0V2.75a.75.75 0 0 1 1.5 0V7a4 4 0 0 1-8 0V2.75A.75.75 0 0 1 4.75 2ZM2 13.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  ),
);

UnderlineIcon.displayName = 'UnderlineIcon';
