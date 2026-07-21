import * as React from 'react';

export interface ArrowTurnUpLeftIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowTurnUpLeftIcon = React.forwardRef<SVGSVGElement, ArrowTurnUpLeftIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.49 12 3.74 8.248m0 0 3.75-3.75m-3.75 3.75h16.5V19.5" />
    </svg>
  ),
);

ArrowTurnUpLeftIcon.displayName = 'ArrowTurnUpLeftIcon';
