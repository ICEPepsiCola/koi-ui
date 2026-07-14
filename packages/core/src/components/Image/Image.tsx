import {
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from '../shared/Spinner';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: ReactNode;
  preview?: boolean;
}

export function Image({
  className,
  src,
  alt,
  width,
  height,
  style,
  fallback,
  preview = false,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  const boxStyle: CSSProperties = {
    ...style,
    width:
      width != null
        ? typeof width === 'number'
          ? `${width}px`
          : width
        : style?.width,
    height:
      height != null
        ? typeof height === 'number'
          ? `${height}px`
          : height
        : style?.height,
  };

  return (
    <>
      <div
        className={cn(
          'relative inline-block overflow-hidden bg-muted',
          // 无显式尺寸时给加载态一个合理占位，避免塌成竖条
          status === 'loading' &&
            width == null &&
            height == null &&
            style?.width == null &&
            style?.height == null &&
            'min-h-24 min-w-32',
          className,
        )}
        style={boxStyle}
      >
        {status === 'loading' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        ) : null}
        {status === 'error' ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {fallback ?? '加载失败'}
          </div>
        ) : null}
        {status !== 'error' ? (
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              'block h-full w-full object-cover',
              status === 'loading' && 'opacity-0',
              preview && 'cursor-zoom-in',
            )}
            onLoad={(e) => {
              setStatus('loaded');
              onLoad?.(e);
            }}
            onError={(e) => {
              setStatus('error');
              onError?.(e);
            }}
            onClick={() => preview && setPreviewOpen(true)}
            {...props}
          />
        ) : null}
      </div>
      {preview && previewOpen && status === 'loaded' ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
          onClick={() => setPreviewOpen(false)}
          role="presentation"
        >
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
