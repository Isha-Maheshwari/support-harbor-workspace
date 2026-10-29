import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, PriorityBadge, QueryBoundary } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { api, type SlaPolicy } from "@/lib/mock-api";
import { useApiMutation, useSlaPolicies } from "@/lib/queries";

export const Route = createFileRoute("/sla/policies")({ head: pageHead("SLA policies", "Response and resolution targets by priority."), component: Policies });

function Row({ p }: { p: SlaPolicy }) {
  const [fr, setFr] = useState(p.firstResponseMins); const [rh, setRh] = useState(p.resolutionHours);
  const m = useApiMutation((d: Partial<SlaPolicy>) => api.updateSlaPolicy(p.id, d), "Policy updated");
  const dirty = fr !== p.firstResponseMins || rh !== p.resolutionHours;
  return (
    <TableRow>
      <TableCell className="font-medium">{p.name}</TableCell>
      <TableCell><PriorityBadge p={p.priority} /></TableCell>
      <TableCell><Input type="number" min={1} className="w-24" value={fr} onChange={(e) => setFr(Number(e.target.value))} aria-label="First response minutes" /></TableCell>
      <TableCell><Input type="number" min={1} className="w-24" value={rh} onChange={(e) => setRh(Number(e.target.value))} aria-label="Resolution hours" /></TableCell>
      <TableCell><Switch checked={p.active} onCheckedChange={(v) => m.mutate({ active: v })} /></TableCell>
      <TableCell><Button size="sm" disabled={!dirty || fr < 1 || rh < 1 || m.isPending} onClick={() => m.mutate({ firstResponseMins: fr, resolutionHours: rh })}>Save</Button></TableCell>
    </TableRow>
  );
}

function Policies() {
  const q = useSlaPolicies();
  return (
    <>
      <PageHeader title="SLA policies" subtitle="Targets applied to tickets based on priority." />
      <QueryBoundary q={q}>
        {(list) => (
          <div className="overflow-x-auto rounded-lg border bg-card shadow-card"><Table>
            <TableHeader><TableRow><TableHead>Policy</TableHead><TableHead>Priority</TableHead><TableHead>First response (min)</TableHead><TableHead>Resolution (h)</TableHead><TableHead>Active</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{list.map((p) => <Row key={`${p.id}-${p.firstResponseMins}-${p.resolutionHours}`} p={p} />)}</TableBody>
          </Table></div>
        )}
      </QueryBoundary>
    </>
  );
}
