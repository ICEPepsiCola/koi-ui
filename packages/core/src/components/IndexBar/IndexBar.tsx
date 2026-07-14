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

const indexBarVariants = tv({
  base: 'relative h-full w-full min-h-0 overflow-y-auto overscroll-contain',
});

const sidebarIndexVariants = tv({
  base: 'sticky top-0 z-10 flex w-6 shrink-0 flex-col items-center justify-center gap-0.5 self-start py-2 text-xs font-medium text-muted-foreground',
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
  const [activeIndex, setActiveIndex] = useState(groups[0]?.index ?? '');
  const [portHeight, setPortHeight] = useState(0);

  const indexes = useMemo(() => groups.map((g) => g.index), [groups]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => setPortHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scrollToIndex = useCallback(
    (index: string) => {
      const el = sectionRefs.current.get(index);
      const container = containerRef.current;
      if (!el || !container) return;
      container.scrollTo({
        top: el.offsetTop - stickyOffset,
        behavior: 'smooth',
      });
      setActiveIndex(index);
      onIndexChange?.(index);
    },
    [onIndexChange, stickyOffset],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
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
      setActiveIndex(current);
      onIndexChange?.(current);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [indexes, onIndexChange, stickyOffset]);

  return (
    <div
      ref={containerRef}
      className={cn(indexBarVariants(), className)}
      {...props}
    >
      <div className="flex min-h-full">
        <div className="min-w-0 flex-1">
          {groups.map((group) => (
            <section
              key={group.index}
              ref={(el) => {
                if (el) sectionRefs.current.set(group.index, el);
                else sectionRefs.current.delete(group.index);
              }}
            >
              <div
                className="sticky z-[1] bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
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
        <div
          className={cn(sidebarIndexVariants())}
          style={{ height: portHeight || undefined }}
        >
          {indexes.map((index) => (
            <button
              key={index}
              type="button"
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:text-primary',
                activeIndex === index && 'bg-primary text-primary-foreground',
              )}
              onClick={() => scrollToIndex(index)}
            >
              {index}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
