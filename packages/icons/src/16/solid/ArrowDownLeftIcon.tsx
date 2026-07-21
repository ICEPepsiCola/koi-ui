import * as React from 'react';

export interface ArrowDownLeftIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowDownLeftIcon = React.forwardRef<SVGSVGElement, ArrowDownLeftIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path fillRule="evenodd" d="M11.78 4.22a.75.75 0 0 1 0 1.06L6.56 10.5h3.69a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75v-5.5a.75.75 0 0 1 1.5 0v3.69l5.22-5.22a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  ),
);

ArrowDownLeftIcon.displayName = 'ArrowDownLeftIcon';
