import * as React from 'react';

export interface ArrowTurnLeftUpIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowTurnLeftUpIcon = React.forwardRef<SVGSVGElement, ArrowTurnLeftUpIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M14 13.25a.75.75 0 0 0-.75-.75h-6.5V4.56l.97.97a.75.75 0 0 0 1.06-1.06L6.53 2.22a.75.75 0 0 0-1.06 0L3.22 4.47a.75.75 0 0 0 1.06 1.06l.97-.97v8.69c0 .414.336.75.75.75h7.25a.75.75 0 0 0 .75-.75Z" clipRule="evenodd" />
    </svg>
  ),
);

ArrowTurnLeftUpIcon.displayName = 'ArrowTurnLeftUpIcon';
