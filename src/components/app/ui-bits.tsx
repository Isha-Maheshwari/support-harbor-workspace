import { Link } from "@tanstack/react-router";
import { AlertTriangle, Loader2, RotateCw } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Priority, TicketStatus } from "@/lib/mock-api";

export function PageHeader({ title, subtitle, actions, crumbs }: { title: string; subtitle?: string; actions?: ReactNode; crumbs?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {crumbs && <div className="mb-1 text-xs text-muted-foreground">{crumbs}</div>}
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function QueryBoundary<T>({ q, children, rows = 5 }: { q: { data: T | undefined; isPending: boolean; error: Error | null; refetch: () => unknown; isFetching: boolean }; children: (d: T) => ReactNode; rows?: number }) {
  if (q.error && !q.data) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <p className="text-sm font-medium">{q.error.message}</p>
        <Button size="sm" variant="outline" onClick={() => q.refetch()} disabled={q.isFetching}>
          {q.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />} Retry
        </Button>
      </div>
    );
  }
  if (q.isPending || q.data === undefined) {
    return <div className="space-y-2">{Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  }
  return <>{children(q.data)}</>;
}

const statusStyle: Record<TicketStatus, string> = {
  open: "bg-status-open/15 text-status-open border-status-open/30",
  pending: "bg-status-pending/15 text-status-pending border-status-pending/30",
  on_hold: "bg-muted text-muted-foreground",
  solved: "bg-status-solved/15 text-status-solved border-status-solved/30",
  closed: "bg-muted text-muted-foreground",
};
export const StatusBadge = ({ s }: { s: TicketStatus }) => <Badge variant="outline" className={cn("capitalize", statusStyle[s])}>{s.replace("_", " ")}</Badge>;

const prioStyle: Record<Priority, string> = {
  low: "text-muted-foreground", medium: "text-foreground", high: "text-status-pending", urgent: "text-destructive font-semibold",
};
export const PriorityBadge = ({ p }: { p: Priority }) => (
  <span className={cn("inline-flex items-center gap-1.5 text-xs capitalize", prioStyle[p])}>
    <span className={cn("h-2 w-2 rounded-full bg-current")} />{p}
  </span>
);

export function StatCard({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: string | undefined; tone?: "warn" | "bad" | "good" | undefined }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-card">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-2 font-display text-3xl font-semibold", tone === "bad" && "text-destructive", tone === "warn" && "text-status-pending", tone === "good" && "text-status-solved")}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Panel({ title, children, action, className }: { title?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border bg-card p-5 shadow-card", className)}>
      {title && <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-sm font-semibold">{title}</h2>{action}</div>}
      {children}
    </section>
  );
}

export function TableFrame({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto rounded-lg border bg-card shadow-card">{children}</div>;
}

export function NotFoundBlock({ what, back }: { what: string; back: "/tickets" | "/customers" | "/knowledge-base" | "/team" }) {
  return (
    <div className="rounded-lg border bg-card p-10 text-center">
      <p className="font-display text-lg font-semibold">{what} not found</p>
      <Link to={back} className="mt-3 inline-block text-sm text-primary underline">Back to list</Link>
    </div>
  );
}

export const fmtDate = (s: string) => new Date(s).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
export function relTime(s: string) {
  const diff = (Date.parse(s) - Date.now()) / 60000; const a = Math.abs(diff);
  const v = a < 60 ? `${Math.round(a)}m` : a < 1440 ? `${Math.round(a / 60)}h` : `${Math.round(a / 1440)}d`;
  return diff < 0 ? `${v} ago` : `in ${v}`;
}

export const selectCls = "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring";
