import { useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

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
    const hasChildren = node.children && node.children.length > 0;
    const expanded = expandedKeys.includes(node.key);
    const selected = selectedKeys.includes(node.key);

    return (
      <div key={node.key}>
        <div
          className={cn(
            'flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm',
            selected && 'bg-primary/10 text-primary',
            node.disabled && 'cursor-not-allowed opacity-50',
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => !node.disabled && handleSelect(node.key)}
        >
          {hasChildren ? (
            <button
              type="button"
              className="shrink-0 rounded p-0.5 hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.key);
              }}
              aria-expanded={expanded}
            >
              {expanded ? '▾' : '▸'}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}
          <span>{node.title}</span>
        </div>
        {hasChildren && expanded ? (
          <div className={cn(showLine && 'border-l border-border ml-4')}>
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
