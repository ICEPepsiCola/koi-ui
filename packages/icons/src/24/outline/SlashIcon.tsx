import * as React from 'react';

export interface SlashIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const SlashIcon = React.forwardRef<SVGSVGElement, SlashIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 20.247 6-16.5" />
    </svg>
  ),
);

SlashIcon.displayName = 'SlashIcon';
