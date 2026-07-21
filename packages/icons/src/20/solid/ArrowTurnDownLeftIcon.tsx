import * as React from 'react';

export interface ArrowTurnDownLeftIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowTurnDownLeftIcon = React.forwardRef<SVGSVGElement, ArrowTurnDownLeftIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M16.25 3a.75.75 0 0 0-.75.75v7.5H4.56l1.97-1.97a.75.75 0 0 0-1.06-1.06l-3.25 3.25a.75.75 0 0 0 0 1.06l3.25 3.25a.75.75 0 0 0 1.06-1.06l-1.97-1.97h11.69A.75.75 0 0 0 17 12V3.75a.75.75 0 0 0-.75-.75Z" clipRule="evenodd" />
    </svg>
  ),
);

ArrowTurnDownLeftIcon.displayName = 'ArrowTurnDownLeftIcon';
