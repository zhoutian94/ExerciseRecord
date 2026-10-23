import { useEffect, useId, useState } from 'react';
import { isValidDuration } from '../store';

interface DurationInputProps {
  label: string;
  value: number;
  onChange: (duration: number) => void;
  onValidityChange?: (valid: boolean) => void;
}

export function DurationInput({ label, value, onChange, onValidityChange }: DurationInputProps) {
  const [draft, setDraft] = useState(String(value));
  const errorId = useId();
  const valid = isValidDuration(Number(draft));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <div className="shrink-0">
      <label className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
        <span>默认</span>
        <input
          type="number"
          min="1"
          step="1"
          required
          aria-label={label}
          aria-invalid={!valid}
          aria-describedby={!valid ? errorId : undefined}
          value={draft}
          onChange={event => {
            const next = event.target.value;
            const duration = Number(next);
            const nextValid = isValidDuration(duration);
            setDraft(next);
            onValidityChange?.(nextValid);
            if (nextValid) onChange(duration);
          }}
          className={`w-16 rounded-lg border bg-white px-2 py-2 text-center text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 ${valid ? 'border-gray-200' : 'border-red-400'}`}
        />
        <span>分钟</span>
      </label>
      {!valid && <p id={errorId} role="alert" className="mt-1 text-xs text-red-600">请输入大于 0 的整数</p>}
    </div>
  );
}
