import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isBreached, type Ticket } from "@/lib/mock-api";
import { useAgents, useCustomers } from "@/lib/queries";
import { PriorityBadge, StatusBadge, relTime } from "./ui-bits";

export function TicketTable({ tickets, showReason }: { tickets: Ticket[]; showReason?: boolean }) {
  const agents = useAgents().data ?? [];
  const customers = useCustomers().data ?? [];
  if (!tickets.length) return <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No tickets match.</div>;
  return (
    <div className="overflow-x-auto rounded-lg border bg-card shadow-card">
      <Table>
        <TableHeader><TableRow>
          <TableHead>Ticket</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead>
          <TableHead>Priority</TableHead><TableHead>Assignee</TableHead><TableHead>{showReason ? "Reason" : "SLA due"}</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {tickets.map((t) => {
            const breached = isBreached(t);
            return (
              <TableRow key={t.id}>
                <TableCell className="max-w-sm">
                  <Link to="/tickets/$id" params={{ id: t.id }} className="font-medium hover:text-primary">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">{t.id}</span>{t.subject}
                  </Link>
                  {t.escalated && <Flame className="ml-1 inline h-3.5 w-3.5 text-destructive" aria-label="Escalated" />}
                </TableCell>
                <TableCell className="text-sm">{customers.find((c) => c.id === t.customerId)?.name ?? "—"}</TableCell>
                <TableCell><StatusBadge s={t.status} /></TableCell>
                <TableCell><PriorityBadge p={t.priority} /></TableCell>
                <TableCell className="text-sm">{agents.find((a) => a.id === t.assigneeId)?.name ?? <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                <TableCell className={`text-sm ${breached ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                  {showReason ? t.escalationReason : t.status === "solved" || t.status === "closed" ? "—" : `${breached ? "Breached " : ""}${relTime(t.dueAt)}`}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
