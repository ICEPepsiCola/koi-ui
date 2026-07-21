import * as React from 'react';

export interface EqualsIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const EqualsIcon = React.forwardRef<SVGSVGElement, EqualsIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.499 8.248h15m-15 7.501h15" />
    </svg>
  ),
);

EqualsIcon.displayName = 'EqualsIcon';
