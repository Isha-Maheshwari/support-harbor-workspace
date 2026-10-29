import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TicketTable } from "@/components/app/ticket-table";
import { PageHeader, QueryBoundary, selectCls } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { useAgents, useTickets } from "@/lib/queries";

const search = z.object({ q: z.string().optional().catch(undefined), status: z.string().optional().catch(undefined), priority: z.string().optional().catch(undefined), assignee: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/tickets/")({ validateSearch: search, head: pageHead("Tickets", "Search and filter all support tickets."), component: Tickets });

function Tickets() {
  const s = Route.useSearch(); const nav = useNavigate({ from: "/tickets/" });
  const set = (k: string, v: string) => nav({ search: (p) => ({ ...p, [k]: v && v !== "all" ? v : undefined }), replace: true });
  const q = useTickets({ q: s.q, status: s.status, priority: s.priority, assigneeId: s.assignee });
  const agents = useAgents().data ?? [];
  return (
    <>
      <PageHeader title="All tickets" subtitle={q.data ? `${q.data.length} tickets` : "Loading…"} actions={<Button asChild><Link to="/tickets/new"><Plus className="h-4 w-4" /> New ticket</Link></Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Search ID or subject…" defaultValue={s.q} onChange={(e) => set("q", e.target.value)} className="max-w-xs" />
        <select aria-label="Status" className={selectCls} value={s.status ?? "all"} onChange={(e) => set("status", e.target.value)}>
          {["all", "open", "pending", "on_hold", "solved", "closed"].map((v) => <option key={v} value={v}>{v === "all" ? "All statuses" : v.replace("_", " ")}</option>)}
        </select>
        <select aria-label="Priority" className={selectCls} value={s.priority ?? "all"} onChange={(e) => set("priority", e.target.value)}>
          {["all", "urgent", "high", "medium", "low"].map((v) => <option key={v} value={v}>{v === "all" ? "All priorities" : v}</option>)}
        </select>
        <select aria-label="Assignee" className={selectCls} value={s.assignee ?? "all"} onChange={(e) => set("assignee", e.target.value)}>
          <option value="all">All assignees</option><option value="unassigned">Unassigned</option>
          {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      <QueryBoundary q={q} rows={10}>{(t) => <TicketTable tickets={t} />}</QueryBoundary>
    </>
  );
}
