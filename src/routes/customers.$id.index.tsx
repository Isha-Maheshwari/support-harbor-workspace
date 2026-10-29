import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketTable } from "@/components/app/ticket-table";
import { NotFoundBlock, PageHeader, Panel, QueryBoundary, StatCard, fmtDate } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { useCustomer, useTickets } from "@/lib/queries";

export const Route = createFileRoute("/customers/$id/")({ head: pageHead("Customer", "Customer profile and ticket history."), component: CustomerDetail });

function CustomerDetail() {
  const { id } = Route.useParams();
  const q = useCustomer(id); const tickets = useTickets({ customerId: id });
  if (q.error?.message.includes("not found")) return <NotFoundBlock what="Customer" back="/customers" />;
  return (
    <QueryBoundary q={q}>
      {(c) => (
        <>
          <PageHeader crumbs={<Link to="/customers" className="hover:underline">Customers</Link>} title={c.name} subtitle={`${c.company} · customer since ${fmtDate(c.createdAt)}`}
            actions={<><Button variant="outline" asChild><Link to="/customers/$id/edit" params={{ id }}><Pencil className="h-4 w-4" /> Edit</Link></Button>
              <Button asChild><Link to="/tickets/new"><Plus className="h-4 w-4" /> New ticket</Link></Button></>} />
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <Panel title="Contact">
              <dl className="space-y-2 text-sm">
                <div><dt className="text-muted-foreground">Email</dt><dd>{c.email}</dd></div>
                <div><dt className="text-muted-foreground">Phone</dt><dd>{c.phone || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Tier</dt><dd><Badge className="capitalize">{c.tier}</Badge></dd></div>
                <div><dt className="text-muted-foreground">Status</dt><dd className="capitalize">{c.status}</dd></div>
                <div><dt className="text-muted-foreground">Notes</dt><dd className="whitespace-pre-wrap">{c.notes || "—"}</dd></div>
              </dl>
            </Panel>
            <div className="space-y-4">
              {tickets.data && <div className="grid grid-cols-3 gap-4">
                <StatCard label="Tickets" value={tickets.data.length} />
                <StatCard label="Open" value={tickets.data.filter((t) => t.status !== "solved" && t.status !== "closed").length} />
                <StatCard label="Escalated" value={tickets.data.filter((t) => t.escalated).length} tone="warn" />
              </div>}
              <QueryBoundary q={tickets}>{(t) => <TicketTable tickets={t} />}</QueryBoundary>
            </div>
          </div>
        </>
      )}
    </QueryBoundary>
  );
}
