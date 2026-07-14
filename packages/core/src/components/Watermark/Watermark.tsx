import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface WatermarkProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  content?: ReactNode;
  gap?: [number, number];
  rotate?: number;
  fontSize?: number;
  fontColor?: string;
  zIndex?: number;
  children?: ReactNode;
}

export function Watermark({
  className,
  content = 'Koi UI',
  gap = [100, 100],
  rotate = -22,
  fontSize = 14,
  fontColor = 'rgba(0,0,0,0.08)',
  zIndex = 9,
  children,
  ...props
}: WatermarkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const text = String(content);
    ctx.font = `${fontSize}px sans-serif`;
    const metrics = ctx.measureText(text);
    const width = metrics.width + gap[0];
    const height = fontSize + gap[1];

    canvas.width = width;
    canvas.height = height;
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);

    canvasRef.current = canvas;
    if (containerRef.current) {
      containerRef.current.style.backgroundImage = `url(${canvas.toDataURL()})`;
    }
  }, [content, gap, rotate, fontSize, fontColor]);

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{ zIndex }}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundRepeat: 'repeat',
          zIndex,
        }}
      />
      <div className="relative" style={{ zIndex: zIndex + 1 }}>
        {children}
      </div>
    </div>
  );
}
