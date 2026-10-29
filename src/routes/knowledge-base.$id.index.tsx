import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, ThumbsDown, ThumbsUp } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotFoundBlock, PageHeader, QueryBoundary, fmtDate } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/mock-api";
import { useAgents, useApiMutation, useArticle } from "@/lib/queries";

export const Route = createFileRoute("/knowledge-base/$id/")({ head: pageHead("Article", "Knowledge base article."), component: ArticleView });

function inline(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*)/).map((p, i) => p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>);
}
function Markdown({ src }: { src: string }) {
  return <div className="space-y-3 text-sm leading-relaxed">{src.split("\n").map((l, i) =>
    l.startsWith("## ") ? <h2 key={i} className="pt-2 font-display text-lg font-semibold">{l.slice(3)}</h2>
    : /^\d+\. /.test(l) ? <p key={i} className="pl-4">{inline(l)}</p>
    : l.trim() ? <p key={i}>{inline(l)}</p> : null)}</div>;
}

function ArticleView() {
  const { id } = Route.useParams();
  const q = useArticle(id); const agents = useAgents().data ?? [];
  const vote = useApiMutation((h: boolean) => api.voteArticle(id, h), "Thanks for the feedback");
  if (q.error?.message.includes("not found")) return <NotFoundBlock what="Article" back="/knowledge-base" />;
  return (
    <QueryBoundary q={q}>
      {(a) => (
        <>
          <PageHeader crumbs={<Link to="/knowledge-base" className="hover:underline">Knowledge base / {a.category}</Link>} title={a.title}
            subtitle={`By ${agents.find((x) => x.id === a.authorId)?.name ?? "—"} · updated ${fmtDate(a.updatedAt)} · ${a.views} views`}
            actions={<Button variant="outline" asChild><Link to="/knowledge-base/$id/edit" params={{ id }}><Pencil className="h-4 w-4" /> Edit</Link></Button>} />
          <article className="max-w-3xl rounded-lg border bg-card p-8 shadow-card">
            <div className="mb-4 flex gap-1"><Badge variant="outline" className="capitalize">{a.status}</Badge>{a.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
            <Markdown src={a.body} />
            <div className="mt-8 flex items-center gap-3 border-t pt-4 text-sm">
              <span className="text-muted-foreground">Was this helpful?</span>
              <Button size="sm" variant="outline" disabled={vote.isPending} onClick={() => vote.mutate(true)}><ThumbsUp className="h-4 w-4" />{a.helpful}</Button>
              <Button size="sm" variant="outline" disabled={vote.isPending} onClick={() => vote.mutate(false)}><ThumbsDown className="h-4 w-4" />{a.notHelpful}</Button>
            </div>
          </article>
        </>
      )}
    </QueryBoundary>
  );
}
