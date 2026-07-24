import { useState, type ReactNode } from 'react';
import { ChevronRightIcon } from '@koi-ui/icons';
import { cn } from '../../utils/cn';
import { controlTransition } from '../../utils/interaction';

export interface TreeNode {
  key: string;
  title: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  isLeaf?: boolean;
}

export interface TreeProps {
  data: TreeNode[];
  defaultExpandedKeys?: string[];
  expandedKeys?: string[];
  selectedKeys?: string[];
  onSelect?: (keys: string[]) => void;
  onExpand?: (keys: string[]) => void;
  className?: string;
  showLine?: boolean;
}

export function Tree({
  data,
  defaultExpandedKeys = [],
  expandedKeys: controlledExpanded,
  selectedKeys = [],
  onSelect,
  onExpand,
  className,
  showLine = false,
}: TreeProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpandedKeys);
  const expandedKeys = controlledExpanded ?? internalExpanded;

  const toggleExpand = (key: string) => {
    const next = expandedKeys.includes(key)
      ? expandedKeys.filter((k) => k !== key)
      : [...expandedKeys, key];
    if (controlledExpanded === undefined) setInternalExpanded(next);
    onExpand?.(next);
  };

  const handleSelect = (key: string) => {
    onSelect?.([key]);
  };

  const renderNode = (node: TreeNode, depth = 0) => {
    const hasChildren = Boolean(node.children?.length);
    const expanded = expandedKeys.includes(node.key);
    const selected = selectedKeys.includes(node.key);

    return (
      <div key={node.key}>
        <div
          role="treeitem"
          aria-expanded={hasChildren ? expanded : undefined}
          aria-selected={selected}
          className={cn(
            'flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm',
            'hover:bg-muted/70',
            selected && 'bg-primary/10 text-primary hover:bg-primary/10',
            node.disabled && 'pointer-events-none cursor-not-allowed opacity-50',
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.disabled) return;
            handleSelect(node.key);
            if (hasChildren) toggleExpand(node.key);
          }}
        >
          {hasChildren ? (
            <span
              className={cn(
                'inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground',
                selected && 'text-primary',
              )}
              aria-hidden
            >
              <ChevronRightIcon
                className={cn(
                  'h-3.5 w-3.5',
                  controlTransition,
                  expanded && 'rotate-90',
                )}
              />
            </span>
          ) : (
            <span className="w-4 shrink-0" aria-hidden />
          )}
          <span className="min-w-0 flex-1 truncate">{node.title}</span>
        </div>
        {hasChildren && expanded ? (
          <div
            role="group"
            className={cn(showLine && 'ml-4 border-l border-border')}
          >
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className={cn('w-full', className)} role="tree">
      {data.map((node) => renderNode(node))}
    </div>
  );
}
