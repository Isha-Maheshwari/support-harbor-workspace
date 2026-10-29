import { createFileRoute } from "@tanstack/react-router";
import { Bars, Donut, VolumeChart } from "@/components/app/charts";
import { PageHeader, Panel, QueryBoundary, StatCard } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { useStats } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/analytics")({ head: pageHead("Analytics", "Support trends by status, priority and channel."), component: Analytics });

function Analytics() {
  const q = useStats();
  return (
    <>
      <PageHeader title="Analytics" subtitle="Trends across the last 30 days." />
      <QueryBoundary q={q} rows={6}>
        {(s) => (
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Resolution rate" value={`${Math.round((s.solved / s.total) * 100)}%`} tone="good" />
              <StatCard label="Solved" value={s.solved} />
              <StatCard label="Avg first reply" value={`${s.avgFirstResponseMins}m`} />
              <StatCard label="Breach rate" value={`${Math.round((s.breached / Math.max(1, s.open)) * 100)}%`} tone="bad" hint="of open tickets" />
            </div>
            <Panel title="Created vs solved"><VolumeChart data={s.byDay} /></Panel>
            <div className="grid gap-6 lg:grid-cols-3">
              <Panel title="By status"><Donut data={s.byStatus} /></Panel>
              <Panel title="By priority"><Donut data={s.byPriority} /></Panel>
              <Panel title="By channel"><Donut data={s.byChannel} /></Panel>
            </div>
            <Panel title="Workload by agent"><Bars data={s.agentStats.map((a) => ({ name: a.name.split(" ")[0], open: a.open, solved: a.solved }))} keys={["open", "solved"]} /></Panel>
          </div>
        )}
      </QueryBoundary>
    </>
  );
}
