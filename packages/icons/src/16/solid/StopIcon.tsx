import * as React from 'react';

export interface StopIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const StopIcon = React.forwardRef<SVGSVGElement, StopIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <rect width="10" height="10" x="3" y="3" rx="1.5" />
    </svg>
  ),
);

StopIcon.displayName = 'StopIcon';
