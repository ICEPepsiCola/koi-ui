import * as React from 'react';

export interface ArrowDownRightIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const ArrowDownRightIcon = React.forwardRef<SVGSVGElement, ArrowDownRightIconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06l7.22 7.22H6.75a.75.75 0 0 0 0 1.5h7.5a.747.747 0 0 0 .75-.75v-7.5a.75.75 0 0 0-1.5 0v5.69L6.28 5.22Z" />
    </svg>
  ),
);

ArrowDownRightIcon.displayName = 'ArrowDownRightIcon';
