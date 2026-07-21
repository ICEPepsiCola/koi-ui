import * as React from 'react';

export interface Bars2IconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const Bars2Icon = React.forwardRef<SVGSVGElement, Bars2IconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
  ),
);

Bars2Icon.displayName = 'Bars2Icon';
