import { createFileRoute } from "@tanstack/react-router";
import { TicketTable } from "@/components/app/ticket-table";
import { PageHeader, QueryBoundary, StatCard } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { useBreaches } from "@/lib/queries";

export const Route = createFileRoute("/sla/breaches")({ head: pageHead("SLA breaches", "Open tickets past their SLA target."), component: Breaches });

function Breaches() {
  const q = useBreaches();
  return (
    <>
      <PageHeader title="SLA breaches" subtitle="Open tickets that have passed their resolution target, oldest first." />
      <QueryBoundary q={q}>
        {(t) => (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Breached" value={t.length} tone="bad" />
              <StatCard label="Urgent" value={t.filter((x) => x.priority === "urgent").length} tone="bad" />
              <StatCard label="High" value={t.filter((x) => x.priority === "high").length} tone="warn" />
              <StatCard label="Unassigned" value={t.filter((x) => !x.assigneeId).length} />
            </div>
            <TicketTable tickets={t} />
          </>
        )}
      </QueryBoundary>
    </>
  );
}
