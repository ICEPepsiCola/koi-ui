import { useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface EllipsisProps {
  content: ReactNode;
  rows?: number;
  expandable?: boolean;
  expandText?: string;
  collapseText?: string;
  className?: string;
}

export function Ellipsis({
  content,
  rows = 1,
  expandable = true,
  expandText = '展开',
  collapseText = '收起',
  className,
}: EllipsisProps) {
  const [expanded, setExpanded] = useState(false);

  if (rows === 1 && !expanded) {
    return (
      <div className={cn('flex items-start gap-1', className)}>
        <span className="truncate">{content}</span>
        {expandable ? (
          <button
            type="button"
            className="shrink-0 text-xs text-primary"
            onClick={() => setExpanded(true)}
          >
            {expandText}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={cn(!expanded && rows > 1 && 'line-clamp-[var(--rows)]')}
        style={!expanded && rows > 1 ? { ['--rows' as string]: rows } : undefined}
      >
        {content}
      </div>
      {expandable ? (
        <button
          type="button"
          className="mt-1 text-xs text-primary"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? collapseText : expandText}
        </button>
      ) : null}
    </div>
  );
}
