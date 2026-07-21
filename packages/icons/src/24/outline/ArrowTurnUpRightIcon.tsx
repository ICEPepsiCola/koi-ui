import * as React from 'react';

export interface ArrowTurnUpRightIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowTurnUpRightIcon = React.forwardRef<SVGSVGElement, ArrowTurnUpRightIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.49 12 3.75-3.751m0 0-3.75-3.75m3.75 3.75H3.74V19.5" />
    </svg>
  ),
);

ArrowTurnUpRightIcon.displayName = 'ArrowTurnUpRightIcon';
