import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, QueryBoundary, selectCls } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { useCustomers } from "@/lib/queries";

export const Route = createFileRoute("/customers/")({ head: pageHead("Customers", "Directory of customer accounts."), component: Customers });

function Customers() {
  const [q, setQ] = useState(""); const [tier, setTier] = useState("all");
  const res = useCustomers(q);
  return (
    <>
      <PageHeader title="Customers" actions={<Button asChild><Link to="/customers/new"><Plus className="h-4 w-4" /> Add customer</Link></Button>} />
      <div className="mb-4 flex gap-2">
        <Input placeholder="Search name, company, email…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select className={selectCls} value={tier} onChange={(e) => setTier(e.target.value)}>{["all", "free", "pro", "enterprise"].map((v) => <option key={v}>{v}</option>)}</select>
      </div>
      <QueryBoundary q={res} rows={10}>
        {(list) => (
          <div className="overflow-x-auto rounded-lg border bg-card shadow-card"><Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Company</TableHead><TableHead>Email</TableHead><TableHead>Tier</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.filter((c) => tier === "all" || c.tier === tier).map((c) => (
                <TableRow key={c.id}>
                  <TableCell><Link to="/customers/$id" params={{ id: c.id }} className="font-medium hover:text-primary">{c.name}</Link></TableCell>
                  <TableCell>{c.company}</TableCell><TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell><Badge variant={c.tier === "enterprise" ? "default" : "secondary"} className="capitalize">{c.tier}</Badge></TableCell>
                  <TableCell className="capitalize text-sm">{c.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></div>
        )}
      </QueryBoundary>
    </>
  );
}
