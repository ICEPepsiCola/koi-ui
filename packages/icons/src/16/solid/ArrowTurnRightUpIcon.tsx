import * as React from 'react';

export interface ArrowTurnRightUpIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowTurnRightUpIcon = React.forwardRef<SVGSVGElement, ArrowTurnRightUpIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M2 13.25a.75.75 0 0 1 .75-.75h6.5V4.56l-.97.97a.75.75 0 0 1-1.06-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1-1.06 1.06l-.97-.97v8.69A.75.75 0 0 1 10 14H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  ),
);

ArrowTurnRightUpIcon.displayName = 'ArrowTurnRightUpIcon';
