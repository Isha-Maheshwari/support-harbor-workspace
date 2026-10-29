import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VolumeChart } from "@/components/app/charts";
import { TicketTable } from "@/components/app/ticket-table";
import { PageHeader, Panel, QueryBoundary, StatCard } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { useStats, useTickets } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/")({ head: pageHead("Dashboard", "Live overview of your support queue."), component: Dashboard });

function Dashboard() {
  const stats = useStats();
  const urgent = useTickets({ priority: "urgent", status: "open" });
  return (
    <>
      <PageHeader title="Good afternoon, Marcus" subtitle="Here's what's happening in your queue today."
        actions={<Button asChild><Link to="/tickets/new"><Plus className="h-4 w-4" /> New ticket</Link></Button>} />
      <QueryBoundary q={stats} rows={3}>
        {(s) => (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatCard label="Open" value={s.open} hint={`${s.total} total`} />
              <StatCard label="Unassigned" value={s.unassigned} tone={s.unassigned ? "warn" : undefined} />
              <StatCard label="Escalated" value={s.escalated} tone="warn" />
              <StatCard label="SLA breached" value={s.breached} tone="bad" />
              <StatCard label="CSAT" value={`${s.csat}%`} tone="good" hint={`${s.avgFirstResponseMins}m avg first reply`} />
            </div>
            <Panel title="Ticket volume — last 14 days" className="mt-6"><VolumeChart data={s.byDay} /></Panel>
          </>
        )}
      </QueryBoundary>
      <div className="mt-6">
        <h2 className="mb-3 font-display text-sm font-semibold">Urgent & open</h2>
        <QueryBoundary q={urgent}>{(t) => <TicketTable tickets={t.slice(0, 8)} />}</QueryBoundary>
      </div>
    </>
  );
}
