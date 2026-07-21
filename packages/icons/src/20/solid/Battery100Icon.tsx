import * as React from 'react';

export interface Battery100IconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

export const Battery100Icon = React.forwardRef<SVGSVGElement, Battery100IconProps>(
  ({ title, titleId, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden={title ? undefined : true} data-slot="icon" ref={ref} aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <path d="M4.75 8a.75.75 0 0 0-.75.75v2.5c0 .414.336.75.75.75h9.5a.75.75 0 0 0 .75-.75v-2.5a.75.75 0 0 0-.75-.75h-9.5Z" />
  <path fillRule="evenodd" d="M1 7.25A2.25 2.25 0 0 1 3.25 5h12.5A2.25 2.25 0 0 1 18 7.25v1.085a1.5 1.5 0 0 1 1 1.415v.5a1.5 1.5 0 0 1-1 1.415v1.085A2.25 2.25 0 0 1 15.75 15H3.25A2.25 2.25 0 0 1 1 12.75v-5.5Zm2.25-.75a.75.75 0 0 0-.75.75v5.5c0 .414.336.75.75.75h12.5a.75.75 0 0 0 .75-.75v-5.5a.75.75 0 0 0-.75-.75H3.25Z" clipRule="evenodd" />
    </svg>
  ),
);

Battery100Icon.displayName = 'Battery100Icon';
