import * as React from 'react';

export interface MinusIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const MinusIcon = React.forwardRef<SVGSVGElement, MinusIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  ),
);

MinusIcon.displayName = 'MinusIcon';
