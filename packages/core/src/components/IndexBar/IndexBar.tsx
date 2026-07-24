import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlTransition, focusRing, pressable } from '../../utils/interaction';

const indexBarVariants = tv({
  base: 'relative flex h-full w-full min-h-0',
});

const sidebarIndexVariants = tv({
  base: 'flex w-6 shrink-0 flex-col items-center justify-center gap-0.5 self-stretch py-2 text-xs font-medium leading-none text-muted-foreground',
});

export interface IndexBarGroup<T = unknown> {
  index: string;
  title?: ReactNode;
  items: T[];
}

export interface IndexBarProps<T = unknown>
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof indexBarVariants> {
  groups: IndexBarGroup<T>[];
  renderItem: (item: T, index: number) => ReactNode;
  stickyOffset?: number;
  onIndexChange?: (index: string) => void;
}

export function IndexBar<T>({
  groups,
  renderItem,
  stickyOffset = 0,
  onIndexChange,
  className,
  ...props
}: IndexBarProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const suppressScrollSyncRef = useRef(false);
  const activeIndexRef = useRef(groups[0]?.index ?? '');
  const [activeIndex, setActiveIndex] = useState(groups[0]?.index ?? '');

  const indexes = useMemo(() => groups.map((g) => g.index), [groups]);

  const commitActiveIndex = useCallback(
    (index: string) => {
      if (activeIndexRef.current === index) return;
      activeIndexRef.current = index;
      setActiveIndex(index);
      onIndexChange?.(index);
    },
    [onIndexChange],
  );

  const scrollToIndex = useCallback(
    (index: string) => {
      const el = sectionRefs.current.get(index);
      const container = containerRef.current;
      if (!el || !container) return;

      // Instant jump — smooth scroll + in-flow sticky sidebar caused the rail to drift.
      suppressScrollSyncRef.current = true;
      container.scrollTo({
        top: el.offsetTop - stickyOffset,
        behavior: 'auto',
      });
      commitActiveIndex(index);
      requestAnimationFrame(() => {
        suppressScrollSyncRef.current = false;
      });
    },
    [commitActiveIndex, stickyOffset],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (suppressScrollSyncRef.current) return;

      let current = indexes[0] ?? '';
      for (const index of indexes) {
        const el = sectionRefs.current.get(index);
        if (!el) continue;
        const top =
          el.getBoundingClientRect().top -
          container.getBoundingClientRect().top;
        if (top <= stickyOffset + 8) {
          current = index;
        }
      }
      commitActiveIndex(current);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [commitActiveIndex, indexes, stickyOffset]);

  return (
    <div className={cn(indexBarVariants(), className)} {...props}>
      <div
        ref={containerRef}
        className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {groups.map((group) => (
          <section
            key={group.index}
            ref={(el) => {
              if (el) sectionRefs.current.set(group.index, el);
              else sectionRefs.current.delete(group.index);
            }}
          >
            <div
              className="sticky z-1 bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
              style={{ top: stickyOffset }}
            >
              {group.title ?? group.index}
            </div>
            <ul>
              {group.items.map((item, i) => (
                <li
                  key={i}
                  className="border-b border-border px-4 py-3 last:border-b-0"
                >
                  {renderItem(item, i)}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className={cn(sidebarIndexVariants())} role="navigation">
        {indexes.map((index) => (
          <button
            key={index}
            type="button"
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-selector',
              'hover:bg-primary/10 hover:text-primary',
              controlTransition,
              focusRing,
              pressable,
              activeIndex === index &&
                'bg-primary/15 font-semibold text-primary hover:bg-primary/20 hover:text-primary',
            )}
            onClick={() => scrollToIndex(index)}
          >
            {index}
          </button>
        ))}
      </div>
    </div>
  );
}
