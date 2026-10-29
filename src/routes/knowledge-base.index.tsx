import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Plus, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, QueryBoundary } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { useArticles } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/knowledge-base/")({ head: pageHead("Knowledge base", "Help articles for agents and customers."), component: KB });

function KB() {
  const [q, setQ] = useState(""); const [cat, setCat] = useState("All");
  const res = useArticles(q);
  const cats = ["All", "Getting Started", "Billing", "Integrations", "Troubleshooting", "Security", "API"];
  return (
    <>
      <PageHeader title="Knowledge base" actions={<Button asChild><Link to="/knowledge-base/new"><Plus className="h-4 w-4" /> New article</Link></Button>} />
      <Input placeholder="Search articles…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-3 max-w-md" />
      <div className="mb-5 flex flex-wrap gap-1.5">
        {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={cn("rounded-full border px-3 py-1 text-xs", cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}>{c}</button>)}
      </div>
      <QueryBoundary q={res} rows={6}>
        {(list) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.filter((a) => cat === "All" || a.category === cat).map((a) => (
              <Link key={a.id} to="/knowledge-base/$id" params={{ id: a.id }} className="group rounded-lg border bg-card p-5 shadow-card transition hover:border-primary/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{a.category}</span>{a.status !== "published" && <Badge variant="outline" className="capitalize">{a.status}</Badge>}</div>
                <h3 className="mt-2 font-display font-semibold group-hover:text-primary">{a.title}</h3>
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Eye className="h-3 w-3" />{a.views}</span><span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{a.helpful}</span></div>
              </Link>
            ))}
          </div>
        )}
      </QueryBoundary>
    </>
  );
}
