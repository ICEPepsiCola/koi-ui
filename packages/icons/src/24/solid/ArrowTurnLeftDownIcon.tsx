import * as React from 'react';

export interface ArrowTurnLeftDownIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowTurnLeftDownIcon = React.forwardRef<SVGSVGElement, ArrowTurnLeftDownIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M20.24 3.75a.75.75 0 0 1-.75.75H8.989v13.939l2.47-2.47a.75.75 0 1 1 1.06 1.061l-3.75 3.75a.75.75 0 0 1-1.06 0l-3.751-3.75a.75.75 0 1 1 1.06-1.06l2.47 2.469V3.75a.75.75 0 0 1 .75-.75H19.49a.75.75 0 0 1 .75.75Z" clipRule="evenodd" />
    </svg>
  ),
);

ArrowTurnLeftDownIcon.displayName = 'ArrowTurnLeftDownIcon';
