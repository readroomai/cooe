"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ button */

type ButtonVariant = "primary" | "ghost" | "quiet";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[13px] leading-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-40";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-paper px-6 py-3.5 rounded-md hover:bg-[#2a2420] active:scale-[0.99]",
  ghost:
    "border border-line-strong text-ink px-6 py-3.5 rounded-md hover:border-ink hover:bg-paper-2",
  quiet:
    "text-muted hover:text-ink underline-offset-4 decoration-line-strong hover:decoration-ink underline",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], className)}
      {...props}
    />
  );
}

type LinkButtonProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
};

export function LinkButton({
  variant = "primary",
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------- field */

export function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-4">
      <label htmlFor={htmlFor} className="eyebrow">
        {children}
      </label>
      {hint && <span className="text-[11px] text-faint">{hint}</span>}
    </div>
  );
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p className="mt-2 text-[12px] text-signal-orange" role="alert">
      {children}
    </p>
  );
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
  limit?: number;
  showCount?: boolean;
};

export function TextArea({
  label,
  hint,
  error,
  limit,
  showCount,
  className,
  id,
  value,
  ...props
}: TextAreaProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  const length = typeof value === "string" ? value.length : 0;
  const over = limit ? length > limit : false;

  return (
    <div>
      <FieldLabel htmlFor={fieldId} hint={hint}>
        {label}
      </FieldLabel>
      <textarea
        id={fieldId}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(
          "field-line w-full resize-none py-2 text-[16px] leading-[1.6] text-ink placeholder:text-faint sm:text-[15px]",
          className,
        )}
        {...props}
      />
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <span id={`${fieldId}-error`} className="text-[12px] text-signal-orange">
          {error}
        </span>
        {showCount && limit && (
          <span
            className={cn(
              "shrink-0 text-[11px] tabular-nums",
              over ? "text-signal-orange" : "text-faint",
            )}
          >
            {length} / {limit}
          </span>
        )}
      </div>
    </div>
  );
}

type ChoiceProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T | "";
  onChange: (value: T) => void;
  optional?: boolean;
  name: string;
};

/** Inline chip group — keeps the form flat instead of boxed. */
export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  optional,
  name,
}: ChoiceProps<T>) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3">
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal text-faint">optional</span>}
      </legend>
      <div className="flex flex-wrap gap-x-1.5 gap-y-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              name={name}
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-[13px] leading-none transition-colors duration-200",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* --------------------------------------------------------------- copy chip */

export function CopyButton({
  text,
  label = "Copy",
  className,
  onCopied,
}: {
  text: string;
  label?: string;
  className?: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return; // Clipboard denied — no fake confirmation.
    }
    setCopied(true);
    onCopied?.();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "text-[12px] text-faint underline decoration-transparent underline-offset-4 transition-colors hover:text-ink hover:decoration-line-strong",
        className,
      )}
    >
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}

/* ------------------------------------------------------------------- modal */

export function Modal({
  open,
  onClose,
  title,
  children,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const headingId = useId();

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function focusables() {
      return Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    }

    focusables()[0]?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[#14110f]/25 backdrop-blur-[2px]"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? headingId}
        className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-lg border border-line bg-paper p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-lg sm:rounded-lg sm:p-8"
      >
        <h2 id={headingId} className="serif text-[26px] leading-tight text-ink">
          {title}
        </h2>
        <div className="mt-5 text-[14px] leading-[1.65] text-muted">{children}</div>
        <button
          type="button"
          onClick={onClose}
          className="mt-7 text-[12px] text-faint underline underline-offset-4 hover:text-ink"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ misc */

export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}
