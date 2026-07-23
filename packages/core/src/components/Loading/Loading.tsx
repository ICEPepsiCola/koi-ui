import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import type { ControlColor } from '../../utils/controlColor';
import { Portal } from '../../utils/portal';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';
import { Spinner, type SpinnerStyle } from '../shared/Spinner';

export interface LoadingProps {
  open?: boolean;
  tip?: ReactNode;
  fullscreen?: boolean;
  className?: string;
  indicator?: SpinnerStyle;
  color?: ControlColor;
}

export function Loading({
  open = true,
  tip,
  fullscreen = true,
  className,
  indicator = 'spinner',
  color = 'primary',
}: LoadingProps) {
  const body = (
    <>
      <Spinner style={indicator} color={color} className="h-8 w-8" />
      {tip ? <span className="text-sm text-muted-foreground">{tip}</span> : null}
    </>
  );

  if (!fullscreen) {
    if (!open) return null;
    return (
      <div
        className={cn(
          'flex select-none flex-col items-center gap-3 rounded-box bg-surface px-6 py-4 shadow-float',
          className,
        )}
      >
        {body}
      </div>
    );
  }

  return (
    <Portal>
      <Overlay open={open} className="flex items-center justify-center">
        <MotionPanel
          variant="center"
          className={cn(
            'flex select-none flex-col items-center gap-3 rounded-box bg-surface px-6 py-4 shadow-float',
            className,
          )}
        >
          {body}
        </MotionPanel>
      </Overlay>
    </Portal>
  );
}
