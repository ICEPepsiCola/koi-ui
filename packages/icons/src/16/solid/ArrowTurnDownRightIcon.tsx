import * as React from 'react';

export interface ArrowTurnDownRightIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowTurnDownRightIcon = React.forwardRef<SVGSVGElement, ArrowTurnDownRightIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M2.75 2a.75.75 0 0 1 .75.75v6.5h7.94l-.97-.97a.75.75 0 0 1 1.06-1.06l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H2.75A.75.75 0 0 1 2 10V2.75A.75.75 0 0 1 2.75 2Z" clipRule="evenodd" />
    </svg>
  ),
);

ArrowTurnDownRightIcon.displayName = 'ArrowTurnDownRightIcon';
