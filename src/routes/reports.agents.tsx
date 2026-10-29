import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bars } from "@/components/app/charts";
import { PageHeader, Panel, QueryBoundary } from "@/components/app/ui-bits";
import { downloadCsv } from "@/lib/csv";
import { pageHead } from "@/lib/head";
import { useStats } from "@/lib/queries";

export const Route = createFileRoute("/reports/agents")({ head: pageHead("Agent report", "Per-agent performance report."), component: AgentReport });

type Key = "assigned" | "open" | "solved" | "breached" | "csat" | "avgResponseMins";

function AgentReport() {
  const q = useStats(); const [sort, setSort] = useState<Key>("solved");
  const cols: [Key, string][] = [["assigned", "Assigned"], ["open", "Open"], ["solved", "Solved"], ["breached", "Breached"], ["csat", "CSAT %"], ["avgResponseMins", "Avg reply (m)"]];
  return (
    <QueryBoundary q={q} rows={8}>
      {(s) => {
        const rows = [...s.agentStats].sort((a, b) => b[sort] - a[sort]);
        return (
          <>
            <PageHeader title="Agent report" actions={<Button variant="outline" onClick={() => downloadCsv("agents.csv", rows)}><Download className="h-4 w-4" /> Export CSV</Button>} />
            <Panel title="Solved vs breached" className="mb-6"><Bars data={rows.map((r) => ({ name: r.name.split(" ")[0], solved: r.solved, breached: r.breached }))} keys={["solved", "breached"]} /></Panel>
            <div className="overflow-x-auto rounded-lg border bg-card shadow-card"><Table>
              <TableHeader><TableRow><TableHead>Agent</TableHead><TableHead>Team</TableHead>
                {cols.map(([k, l]) => <TableHead key={k}><button onClick={() => setSort(k)} className={sort === k ? "font-semibold text-primary" : ""}>{l}{sort === k ? " ↓" : ""}</button></TableHead>)}
              </TableRow></TableHeader>
              <TableBody>{rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell><Link to="/team/$id" params={{ id: r.id }} className="font-medium hover:text-primary">{r.name}</Link></TableCell>
                  <TableCell className="text-muted-foreground">{r.team}</TableCell>
                  {cols.map(([k]) => <TableCell key={k} className={k === "breached" && r[k] ? "text-destructive" : ""}>{r[k]}</TableCell>)}
                </TableRow>
              ))}</TableBody>
            </Table></div>
          </>
        );
      }}
    </QueryBoundary>
  );
}
