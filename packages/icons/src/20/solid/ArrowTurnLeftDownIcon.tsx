import * as React from 'react';

export interface ArrowTurnLeftDownIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowTurnLeftDownIcon = React.forwardRef<SVGSVGElement, ArrowTurnLeftDownIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M16 3.75a.75.75 0 0 1-.75.75h-7.5v10.94l1.97-1.97a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0l-3.25-3.25a.75.75 0 1 1 1.06-1.06l1.97 1.97V3.75A.75.75 0 0 1 7 3h8.25a.75.75 0 0 1 .75.75Z" clipRule="evenodd" />
    </svg>
  ),
);

ArrowTurnLeftDownIcon.displayName = 'ArrowTurnLeftDownIcon';
