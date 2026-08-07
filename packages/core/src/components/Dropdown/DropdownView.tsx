import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import {
  floatPanelVariants,
  resolveTransition,
  springSnappy,
} from '../../motion/presets';
import { cn } from '../../utils/cn';
import {
  findEnabledIndex,
  findNextEnabledIndex,
  isActivationKey,
} from '../../utils/keyboard';
import {
  controlTransition,
  floatPanel,
  pressable,
} from '../../utils/interaction';

export interface DropdownItem {
  key: string;
  label: ReactNode;
  disabled?: boolean;
  /** Error action item. */
  color?: 'error';
  onClick?: () => void;
}

export interface DropdownViewProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  disabled?: boolean;
  onSelect?: (key: string) => void;
}

const placementClasses: Record<
  NonNullable<DropdownViewProps['placement']>,
  string
> = {
  'bottom-start': 'left-0 top-full mt-1 origin-top-left',
  'bottom-end': 'right-0 top-full mt-1 origin-top-right',
  'top-start': 'left-0 bottom-full mb-1 origin-bottom-left',
  'top-end': 'right-0 bottom-full mb-1 origin-bottom-right',
};

function focusItem(buttons: HTMLButtonElement[], index: number) {
  const button = buttons[index];
  if (!button) return;
  try {
    button.focus({ preventScroll: true });
  } catch {
    button.focus();
  }
}

export function DropdownView({
  trigger,
  items,
  placement = 'bottom-start',
  disabled = false,
  onSelect,
}: DropdownViewProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();
  const reduce = useReducedMotion();

  useDismissibleLayer({
    open,
    onDismiss: () => setOpen(false),
    containerRef,
    closeOnPointerDownOutside: true,
  });

  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      return;
    }
    const first = findEnabledIndex(items);
    setActiveIndex(first);
    queueMicrotask(() => {
      const buttons = getMenuButtons(menuRef.current);
      if (first >= 0) focusItem(buttons, first);
    });
    // Focus once when the menu opens; item list is read from the latest render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open-only
  }, [open]);

  const commit = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;
    item.onClick?.();
    onSelect?.(item.key);
    setOpen(false);
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => {
        const next = findNextEnabledIndex(
          items,
          current < 0 ? 0 : current,
          event.key === 'ArrowDown' ? 1 : -1,
        );
        queueMicrotask(() => focusItem(getMenuButtons(menuRef.current), next));
        return next;
      });
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      const next = findEnabledIndex(items);
      setActiveIndex(next);
      queueMicrotask(() => focusItem(getMenuButtons(menuRef.current), next));
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      const reversed = [...items]
        .reverse()
        .findIndex((item) => !item.disabled);
      const next = reversed >= 0 ? items.length - reversed - 1 : -1;
      setActiveIndex(next);
      queueMicrotask(() => focusItem(getMenuButtons(menuRef.current), next));
      return;
    }
    if (isActivationKey(event.key)) {
      event.preventDefault();
      commit(activeIndex);
    }
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent) => {
    if (disabled) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
    }
    if (isActivationKey(event.key)) {
      // Let native button click fire; still ensure open for non-button triggers.
      if (!isValidElement(trigger)) {
        event.preventDefault();
        setOpen((v) => !v);
      }
    }
  };

  const triggerNode = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<Record<string, unknown>>, {
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? menuId : undefined,
        onKeyDown: (event: ReactKeyboardEvent) => {
          handleTriggerKeyDown(event);
          const prev = (trigger as ReactElement<Record<string, unknown>>).props
            .onKeyDown as ((e: ReactKeyboardEvent) => void) | undefined;
          prev?.(event);
        },
      })
    : trigger;

  return (
    <div ref={containerRef} className="relative inline-block">
      <div
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        className={cn(disabled && 'pointer-events-none opacity-50')}
      >
        {triggerNode}
      </div>
      {open ? (
        <motion.ul
          key="koi-dropdown-menu"
          ref={menuRef}
          id={menuId}
          role="menu"
          tabIndex={-1}
          initial="closed"
          animate="open"
          variants={floatPanelVariants}
          transition={resolveTransition(reduce, springSnappy)}
          className={cn(
            'absolute z-50 min-w-40 overflow-hidden outline-none',
            floatPanel,
            placementClasses[placement],
          )}
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                tabIndex={index === activeIndex ? 0 : -1}
                disabled={item.disabled}
                className={cn(
                  'block w-full px-3 py-2 text-left text-sm',
                  controlTransition,
                  pressable,
                  'hover:bg-muted',
                  index === activeIndex && 'bg-muted',
                  item.disabled && 'cursor-not-allowed opacity-50',
                  item.color === 'error' && 'text-error hover:bg-error/10',
                )}
                onMouseEnter={() => {
                  if (!item.disabled) setActiveIndex(index);
                }}
                onClick={() => commit(index)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </motion.ul>
      ) : null}
    </div>
  );
}

function getMenuButtons(menu: HTMLUListElement | null) {
  if (!menu) return [] as HTMLButtonElement[];
  return Array.from(
    menu.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'),
  );
}
