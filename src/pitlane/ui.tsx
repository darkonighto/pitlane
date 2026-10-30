import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "./cn";
import type { Safety } from "./types";

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "quiet" }) {
  return (
    <button
      type={type}
      className={cn(
        "press inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-accent text-accent-fg",
        variant === "secondary" && "border border-border bg-transparent text-fg hover:bg-elevated",
        variant === "ghost" && "bg-transparent text-muted hover:bg-elevated hover:text-fg",
        variant === "quiet" && "border border-border bg-inset text-fg hover:bg-elevated",
        className,
      )}
      {...props}
    />
  );
}

const safetyCopy: Record<Safety | "protected", { label: string; className: string }> = {
  safe: { label: "Safe to try", className: "bg-safe-bg text-safe" },
  caution: { label: "Caution", className: "bg-caution-bg text-caution" },
  advanced: { label: "Advanced", className: "border border-border bg-elevated text-info" },
  protected: { label: "Leave running", className: "bg-risk-bg text-risk" },
};

export function SafetyBadge({ safety }: { safety: Safety | "protected" }) {
  const item = safetyCopy[safety];
  return <span className={cn("inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium", item.className)}>{item.label}</span>;
}

export function ImpactLabel({ impact }: { impact: "low" | "medium" | "high" }) {
  const label = impact === "high" ? "Often heavier" : impact === "medium" ? "Sometimes busy" : "Usually light";
  return <span className="text-xs text-subtle">{label}</span>;
}

export function PageHeader({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  return (
    <header className="mb-6">
      <p className="text-xs font-medium tracking-wide text-subtle uppercase">{kicker}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{lede}</p>
    </header>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-border bg-inset px-3 py-3 text-sm leading-relaxed text-muted">{children}</p>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-xs font-medium text-subtle">{label}</span>
      <div className="[&_input]:w-full [&_select]:w-full [&_textarea]:w-full">
        {typeof children === "object" && children && "type" in (children as object)
          ? children
          : <span id={id}>{children}</span>}
      </div>
    </label>
  );
}

export const fieldClass =
  "min-h-11 w-full rounded-sm border border-border bg-inset px-3 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="w-full max-w-lg rounded-xl border border-border bg-surface p-5 text-fg"
    >
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      <div className="mt-4">{children}</div>
    </dialog>
  );
}

export function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}
