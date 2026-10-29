import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PageHeader, QueryBoundary, fmtDate, selectCls } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { useActivity, useAgents } from "@/lib/queries";

export const Route = createFileRoute("/activity-log")({ head: pageHead("Activity log", "Audit trail of every change in the workspace."), component: ActivityLog });

function ActivityLog() {
  const q = useActivity(); const agents = useAgents().data ?? [];
  const [type, setType] = useState("all"); const [search, setSearch] = useState("");
  return (
    <>
      <PageHeader title="Activity log" subtitle="Every change made across tickets, customers, articles and SLAs." />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Search activity…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select className={selectCls} value={type} onChange={(e) => setType(e.target.value)}>
          {["all", "ticket", "customer", "article", "sla"].map((v) => <option key={v}>{v}</option>)}
        </select>
      </div>
      <QueryBoundary q={q} rows={10}>
        {(items) => {
          const list = items.filter((a) => (type === "all" || a.entityType === type) && a.message.toLowerCase().includes(search.toLowerCase()));
          return (
            <ol className="relative space-y-0 rounded-lg border bg-card shadow-card">
              {list.map((a) => (
                <li key={a.id} className="flex items-start gap-3 border-b px-5 py-3 last:border-0">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1 text-sm">
                    <Link to="/team/$id" params={{ id: a.actorId }} className="font-medium hover:text-primary">{agents.find((x) => x.id === a.actorId)?.name ?? a.actorId}</Link>{" "}
                    {a.message}
                    {a.entityType === "ticket" && <Link to="/tickets/$id" params={{ id: a.entityId }} className="ml-2 text-xs text-primary">view</Link>}
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">{fmtDate(a.createdAt)}</time>
                </li>
              ))}
              {!list.length && <li className="p-8 text-center text-sm text-muted-foreground">No activity.</li>}
            </ol>
          );
        }}
      </QueryBoundary>
    </>
  );
}
