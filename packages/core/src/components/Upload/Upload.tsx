import { useCallback, useRef, useState, type DragEvent } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlTransition, focusRing } from '../../utils/interaction';
import { Text } from '../../primitives/Text';
import { Button } from '../Button/Button';

const uploadVariants = tv({
  slots: {
    root: 'w-full',
    dropzone: cn(
      'flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-box border-2 border-dashed border-border/80 bg-surface px-4 py-6 text-center',
      controlTransition,
      focusRing,
      'hover:border-primary hover:bg-muted/50',
    ),
    list: 'mt-3 flex flex-col gap-2',
    item: cn(
      'flex items-center justify-between rounded-box border border-border/80 bg-surface px-3 py-2 text-sm shadow-field',
    ),
  },
  variants: {
    dragging: {
      true: { dropzone: 'border-primary bg-muted/50' },
      false: {},
    },
    disabled: {
      true: { dropzone: 'cursor-not-allowed opacity-50' },
      false: {},
    },
  },
  defaultVariants: {
    dragging: false,
    disabled: false,
  },
});

export interface UploadFileItem {
  uid: string;
  name: string;
  size: number;
  file: File;
}

export interface UploadProps {
  value?: UploadFileItem[];
  defaultValue?: UploadFileItem[];
  onChange?: (files: UploadFileItem[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxCount?: number;
  className?: string;
  hint?: string;
}

let uploadUid = 0;

function toItems(files: FileList | File[]): UploadFileItem[] {
  return Array.from(files).map((file) => ({
    uid: `upload-${++uploadUid}`,
    name: file.name,
    size: file.size,
    file,
  }));
}

export function Upload({
  value,
  defaultValue = [],
  onChange,
  accept,
  multiple = false,
  disabled = false,
  maxCount,
  className,
  hint = '点击或拖拽文件到此处上传',
}: UploadProps) {
  const [internal, setInternal] = useControlled(value, defaultValue, onChange);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { root, dropzone, list, item } = uploadVariants({ dragging, disabled });

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      if (disabled) return;
      const nextItems = toItems(files);
      let merged = multiple ? [...internal, ...nextItems] : nextItems.slice(0, 1);
      if (maxCount !== undefined) merged = merged.slice(0, maxCount);
      setInternal(merged);
    },
    [disabled, internal, maxCount, multiple, setInternal],
  );

  const removeFile = (uid: string) => {
    setInternal(internal.filter((f) => f.uid !== uid));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div className={cn(root(), className)}>
      <div
        className={dropzone()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <Text size="sm" muted>
          {hint}
        </Text>
        {accept ? (
          <Text size="xs" muted className="mt-1">
            支持：{accept}
          </Text>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {internal.length > 0 ? (
        <ul className={list()}>
          {internal.map((file) => (
            <li key={file.uid} className={item()}>
              <span className="truncate">
                {file.name} ({formatSize(file.size)})
              </span>
              <Button
                variant="ghost"
                color="neutral"
                size="sm"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.uid);
                }}
              >
                移除
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function useControlled(
  value: UploadFileItem[] | undefined,
  defaultValue: UploadFileItem[],
  onChange?: (v: UploadFileItem[]) => void,
) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const setValue = (next: UploadFileItem[]) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return [current, setValue] as const;
}
