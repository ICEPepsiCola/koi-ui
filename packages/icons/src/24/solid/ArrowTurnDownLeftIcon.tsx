import * as React from 'react';

export interface ArrowTurnDownLeftIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowTurnDownLeftIcon = React.forwardRef<SVGSVGElement, ArrowTurnDownLeftIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M20.239 3.749a.75.75 0 0 0-.75.75V15H5.549l2.47-2.47a.75.75 0 0 0-1.06-1.06l-3.75 3.75a.75.75 0 0 0 0 1.06l3.75 3.75a.75.75 0 1 0 1.06-1.06L5.55 16.5h14.69a.75.75 0 0 0 .75-.75V4.5a.75.75 0 0 0-.75-.751Z" clipRule="evenodd" />
    </svg>
  ),
);

ArrowTurnDownLeftIcon.displayName = 'ArrowTurnDownLeftIcon';
