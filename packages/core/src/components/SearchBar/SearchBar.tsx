import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import { InlineSearchView } from './InlineSearchView';
import { MobileSearchView } from './MobileSearchView';

export interface SearchBarProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCancel?: boolean;
  responsive?: boolean;
}

export function SearchBar({ responsive = true, ...props }: SearchBarProps) {
  return (
    <AdaptiveRender
      desktop={InlineSearchView}
      mobile={MobileSearchView}
      props={props}
      responsive={responsive}
    />
  );
}
