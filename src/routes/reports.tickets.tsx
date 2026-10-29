import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bars, VolumeChart } from "@/components/app/charts";
import { PageHeader, Panel, QueryBoundary } from "@/components/app/ui-bits";
import { downloadCsv } from "@/lib/csv";
import { pageHead } from "@/lib/head";
import { useStats, useTickets } from "@/lib/queries";

export const Route = createFileRoute("/reports/tickets")({ head: pageHead("Ticket report", "Ticket volume and breakdown report."), component: TicketReport });

function TicketReport() {
  const q = useStats(); const tickets = useTickets();
  return (
    <>
      <PageHeader title="Ticket report" actions={<Button variant="outline" disabled={!tickets.data} onClick={() => downloadCsv("tickets.csv", (tickets.data ?? []).map((t) => ({ id: t.id, subject: t.subject, status: t.status, priority: t.priority, channel: t.channel, assignee: t.assigneeId ?? "", created: t.createdAt, due: t.dueAt, escalated: t.escalated })))}><Download className="h-4 w-4" /> Export CSV</Button>} />
      <QueryBoundary q={q} rows={6}>
        {(s) => (
          <div className="grid gap-6">
            <Panel title="Daily volume"><VolumeChart data={s.byDay} /></Panel>
            <div className="grid gap-6 lg:grid-cols-3">
              <Panel title="By status"><Bars data={s.byStatus} keys={["value"]} /></Panel>
              <Panel title="By priority"><Bars data={s.byPriority} keys={["value"]} /></Panel>
              <Panel title="By channel"><Bars data={s.byChannel} keys={["value"]} /></Panel>
            </div>
          </div>
        )}
      </QueryBoundary>
    </>
  );
}
