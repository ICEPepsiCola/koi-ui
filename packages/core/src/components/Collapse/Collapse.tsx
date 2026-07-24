import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDownIcon } from '@koi-ui/icons';
import { cn } from '../../utils/cn';
import { controlTransition } from '../../utils/interaction';
import {
  collapsePanelVariants,
  collapseTransition,
} from '../../motion/presets';

export interface CollapseItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

export interface CollapseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: CollapseItem[];
  defaultActiveKeys?: string[];
  activeKeys?: string[];
  onChange?: (keys: string[]) => void;
  accordion?: boolean;
}

export function Collapse({
  className,
  items,
  defaultActiveKeys = [],
  activeKeys: controlledKeys,
  onChange,
  accordion = false,
  ...props
}: CollapseProps) {
  const [internalKeys, setInternalKeys] = useState(defaultActiveKeys);
  const activeKeys = controlledKeys ?? internalKeys;
  const reduce = useReducedMotion();
  const transition = reduce ? { duration: 0 } : collapseTransition;

  const toggle = (key: string) => {
    let next: string[];
    if (accordion) {
      next = activeKeys.includes(key) ? [] : [key];
    } else {
      next = activeKeys.includes(key)
        ? activeKeys.filter((k) => k !== key)
        : [...activeKeys, key];
    }
    if (controlledKeys === undefined) setInternalKeys(next);
    onChange?.(next);
  };

  return (
    <div
      className={cn(
        'divide-y divide-border overflow-hidden rounded-lg border border-border',
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const open = activeKeys.includes(item.key);
        return (
          <div key={item.key}>
            <button
              type="button"
              disabled={item.disabled}
              className={cn(
                'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-surface-foreground',
                controlTransition,
                !item.disabled && 'hover:bg-muted/50',
                item.disabled && 'cursor-not-allowed opacity-50',
              )}
              onClick={() => !item.disabled && toggle(item.key)}
              aria-expanded={open}
            >
              {item.label}
              <ChevronDownIcon
                aria-hidden
                className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  open && 'rotate-180',
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  key={`${item.key}-panel`}
                  className="overflow-hidden"
                  variants={collapsePanelVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={transition}
                >
                  <motion.div
                    initial={reduce ? false : { y: -8, opacity: 0.35 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduce ? undefined : { y: -6, opacity: 0 }}
                    transition={transition}
                    className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    {item.children}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
