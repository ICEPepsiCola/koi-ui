import * as React from 'react';

export interface ArrowTurnLeftUpIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowTurnLeftUpIcon = React.forwardRef<SVGSVGElement, ArrowTurnLeftUpIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M16 16.25a.75.75 0 0 0-.75-.75h-7.5V4.56l1.97 1.97a.75.75 0 1 0 1.06-1.06L7.53 2.22a.75.75 0 0 0-1.06 0L3.22 5.47a.75.75 0 0 0 1.06 1.06l1.97-1.97v11.69c0 .414.336.75.75.75h8.25a.75.75 0 0 0 .75-.75Z" clipRule="evenodd" />
    </svg>
  ),
);

ArrowTurnLeftUpIcon.displayName = 'ArrowTurnLeftUpIcon';
