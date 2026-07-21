import * as React from 'react';

export interface Bars4IconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const Bars4Icon = React.forwardRef<SVGSVGElement, Bars4IconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
    </svg>
  ),
);

Bars4Icon.displayName = 'Bars4Icon';
