import { createFileRoute } from "@tanstack/react-router";
import { TicketTable } from "@/components/app/ticket-table";
import { PageHeader, QueryBoundary } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { useTickets } from "@/lib/queries";

export const Route = createFileRoute("/tickets/escalations")({ head: pageHead("Escalations", "Tickets escalated for urgent attention."), component: Escalations });

function Escalations() {
  const q = useTickets({ escalated: true });
  return (
    <>
      <PageHeader title="Escalations" subtitle="Tickets flagged for lead or engineering attention." />
      <QueryBoundary q={q}>{(t) => <TicketTable tickets={t} showReason />}</QueryBoundary>
    </>
  );
}
