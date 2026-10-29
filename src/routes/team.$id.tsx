import { createFileRoute, Link } from "@tanstack/react-router";
import { TicketTable } from "@/components/app/ticket-table";
import { NotFoundBlock, PageHeader, QueryBoundary, StatCard, fmtDate } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { useAgent, useStats, useTickets } from "@/lib/queries";

export const Route = createFileRoute("/team/$id")({ head: pageHead("Agent", "Agent profile and performance."), component: AgentPage });

function AgentPage() {
  const { id } = Route.useParams();
  const q = useAgent(id); const tickets = useTickets({ assigneeId: id }); const s = useStats().data?.agentStats.find((x) => x.id === id);
  if (q.error?.message.includes("not found")) return <NotFoundBlock what="Agent" back="/team" />;
  return (
    <QueryBoundary q={q}>
      {(a) => (
        <>
          <PageHeader crumbs={<Link to="/team" className="hover:underline">Team</Link>} title={a.name} subtitle={`${a.role} · ${a.team} · ${a.email} · joined ${fmtDate(a.joinedAt)}`} />
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Status" value={<span className="capitalize">{a.status}</span>} />
            <StatCard label="Open" value={s?.open ?? "–"} hint={`capacity ${a.capacity}`} />
            <StatCard label="Solved" value={s?.solved ?? "–"} tone="good" />
            <StatCard label="Breached" value={s?.breached ?? "–"} tone="bad" />
            <StatCard label="CSAT" value={s ? `${s.csat}%` : "–"} />
          </div>
          <h2 className="mb-3 font-display text-sm font-semibold">Assigned tickets</h2>
          <QueryBoundary q={tickets}>{(t) => <TicketTable tickets={t} />}</QueryBoundary>
        </>
      )}
    </QueryBoundary>
  );
}
