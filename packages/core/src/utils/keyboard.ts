export interface DisabledItemLike {
  disabled?: boolean;
}

export function findEnabledIndex<T extends DisabledItemLike>(items: T[]) {
  return items.findIndex((item) => !item.disabled);
}

export function findNextEnabledIndex<T extends DisabledItemLike>(
  items: T[],
  startIndex: number,
  direction: 1 | -1,
) {
  if (items.length === 0) return -1;

  for (let step = 1; step <= items.length; step += 1) {
    const index = (startIndex + step * direction + items.length) % items.length;
    if (!items[index]?.disabled) {
      return index;
    }
  }

  return startIndex;
}

export function isActivationKey(key: string) {
  return key === 'Enter' || key === ' ' || key === 'Spacebar';
}
