import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader, QueryBoundary, StatCard } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { useStats } from "@/lib/queries";

export const Route = createFileRoute("/reports/")({ head: pageHead("Reports", "Support performance reports."), component: Reports });

function Reports() {
  const q = useStats();
  return (
    <>
      <PageHeader title="Reports" subtitle="Summary of support performance for the last 30 days." />
      <QueryBoundary q={q} rows={3}>
        {(s) => (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Tickets" value={s.total} /><StatCard label="Solved" value={s.solved} tone="good" />
            <StatCard label="Breached" value={s.breached} tone="bad" /><StatCard label="CSAT" value={`${s.csat}%`} />
          </div>
        )}
      </QueryBoundary>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/reports/tickets" className="group rounded-lg border bg-card p-6 shadow-card hover:border-primary/50">
          <h3 className="font-display font-semibold">Ticket report</h3><p className="mt-1 text-sm text-muted-foreground">Volume, status, priority and channel breakdowns with CSV export.</p>
          <ArrowRight className="mt-4 h-4 w-4 text-primary transition group-hover:translate-x-1" />
        </Link>
        <Link to="/reports/agents" className="group rounded-lg border bg-card p-6 shadow-card hover:border-primary/50">
          <h3 className="font-display font-semibold">Agent report</h3><p className="mt-1 text-sm text-muted-foreground">Per-agent workload, resolution, breaches and CSAT.</p>
          <ArrowRight className="mt-4 h-4 w-4 text-primary transition group-hover:translate-x-1" />
        </Link>
      </div>
    </>
  );
}
