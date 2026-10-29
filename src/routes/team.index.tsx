import { createFileRoute, Link } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { PageHeader, QueryBoundary } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { useAgents, useStats } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/team/")({ head: pageHead("Team", "Support agents, status and workload."), component: Team });

export const statusDot = { online: "bg-status-solved", away: "bg-status-pending", offline: "bg-muted-foreground" };

function Team() {
  const q = useAgents(); const stats = useStats().data;
  return (
    <>
      <PageHeader title="Team" subtitle="Agents, availability and current load." />
      <QueryBoundary q={q} rows={6}>
        {(agents) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => {
              const s = stats?.agentStats.find((x) => x.id === a.id);
              return (
                <Link key={a.id} to="/team/$id" params={{ id: a.id }} className="rounded-lg border bg-card p-5 shadow-card hover:border-primary/50">
                  <div className="flex items-center gap-3">
                    <div className="relative grid h-10 w-10 place-items-center rounded-full bg-accent font-display font-semibold text-accent-foreground">
                      {a.name.split(" ").map((n) => n[0]).join("")}
                      <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card", statusDot[a.status])} />
                    </div>
                    <div><div className="font-medium">{a.name}</div><div className="text-xs text-muted-foreground">{a.role} · {a.team}</div></div>
                  </div>
                  <div className="mt-4 flex justify-between text-xs text-muted-foreground"><span>Load</span><span>{s?.open ?? "–"} / {a.capacity}</span></div>
                  <Progress value={s ? (s.open / a.capacity) * 100 : 0} className="mt-1 h-1.5" />
                </Link>
              );
            })}
          </div>
        )}
      </QueryBoundary>
    </>
  );
}
