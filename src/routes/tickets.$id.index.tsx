import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Flame, Lock, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { NotFoundBlock, PageHeader, Panel, PriorityBadge, QueryBoundary, StatusBadge, fmtDate, relTime, selectCls } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { api, isBreached, type Ticket } from "@/lib/mock-api";
import { useAgents, useApiMutation, useCustomer, useTicket } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tickets/$id/")({ head: pageHead("Ticket", "Ticket conversation, properties and SLA."), component: TicketDetail });

function TicketDetail() {
  const { id } = Route.useParams();
  const q = useTicket(id);
  if (q.error?.message.includes("not found")) return <NotFoundBlock what={`Ticket ${id}`} back="/tickets" />;
  return <QueryBoundary q={q} rows={8}>{(t) => <TicketView t={t} />}</QueryBoundary>;
}

function TicketView({ t }: { t: Ticket }) {
  const nav = useNavigate();
  const agents = useAgents().data ?? [];
  const customer = useCustomer(t.customerId).data;
  const update = useApiMutation((d: Partial<Ticket>) => api.updateTicket(t.id, d), "Ticket updated");
  const comment = useApiMutation((v: { body: string; internal: boolean }) => api.addComment(t.id, v.body, v.internal), "Reply posted");
  const del = useApiMutation(() => api.deleteTicket(t.id), "Ticket deleted");
  const [body, setBody] = useState(""); const [internal, setInternal] = useState(false);
  const breached = isBreached(t);

  return (
    <>
      <PageHeader crumbs={<Link to="/tickets" className="hover:underline">Tickets</Link>} title={t.subject}
        subtitle={`${t.id} · opened ${fmtDate(t.createdAt)} via ${t.channel}`}
        actions={<>
          <Button variant={t.escalated ? "secondary" : "outline"} onClick={() => update.mutate({ escalated: !t.escalated, escalationReason: t.escalated ? undefined : "Escalated by agent" })} disabled={update.isPending}>
            <Flame className="h-4 w-4" />{t.escalated ? "De-escalate" : "Escalate"}
          </Button>
          <Button variant="outline" asChild><Link to="/tickets/$id/edit" params={{ id: t.id }}><Pencil className="h-4 w-4" /> Edit</Link></Button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline" aria-label="Delete"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Delete {t.id}?</AlertDialogTitle><AlertDialogDescription>This permanently removes the ticket and its conversation.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => del.mutate(undefined, { onSuccess: () => nav({ to: "/tickets" }) })}>Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>} />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Panel><p className="whitespace-pre-wrap text-sm leading-relaxed">{t.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">{t.tags.map((g) => <Badge key={g} variant="secondary">{g}</Badge>)}</div></Panel>
          {t.comments.map((c) => {
            const isAgent = c.authorType === "agent";
            const name = isAgent ? agents.find((a) => a.id === c.authorId)?.name : customer?.name;
            return (
              <div key={c.id} className={cn("rounded-lg border p-4 text-sm", c.internal ? "border-status-pending/40 bg-status-pending/10" : isAgent ? "bg-accent/50" : "bg-card")}>
                <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{name ?? "…"}{c.internal && <span className="ml-2 inline-flex items-center gap-1 text-status-pending"><Lock className="h-3 w-3" />Internal note</span>}</span>
                  <time>{fmtDate(c.createdAt)}</time>
                </div>
                <p className="whitespace-pre-wrap">{c.body}</p>
              </div>
            );
          })}
          <form className="rounded-lg border bg-card p-4 shadow-card" onSubmit={(e) => { e.preventDefault(); if (body.trim()) comment.mutate({ body: body.trim(), internal }, { onSuccess: () => setBody("") }); }}>
            <Textarea placeholder={internal ? "Add an internal note (not visible to customer)…" : "Reply to customer…"} rows={4} maxLength={5000} value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm"><Switch checked={internal} onCheckedChange={setInternal} /> Internal note</label>
              <Button type="submit" disabled={!body.trim() || comment.isPending}>{comment.isPending ? "Sending…" : internal ? "Add note" : "Send reply"}</Button>
            </div>
          </form>
        </div>
        <aside className="space-y-4">
          <Panel title="Properties">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><dt className="text-muted-foreground">Status</dt><StatusBadge s={t.status} /></div>
              <div className="flex items-center justify-between"><dt className="text-muted-foreground">Priority</dt><PriorityBadge p={t.priority} /></div>
              <div><dt className="mb-1 text-muted-foreground">Quick status</dt>
                <select className={cn(selectCls, "w-full")} value={t.status} onChange={(e) => update.mutate({ status: e.target.value as Ticket["status"] })}>
                  {["open", "pending", "on_hold", "solved", "closed"].map((v) => <option key={v} value={v}>{v.replace("_", " ")}</option>)}
                </select></div>
              <div><dt className="mb-1 text-muted-foreground">Assignee</dt>
                <select className={cn(selectCls, "w-full")} value={t.assigneeId ?? ""} onChange={(e) => update.mutate({ assigneeId: e.target.value || null })}>
                  <option value="">Unassigned</option>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select></div>
            </dl>
          </Panel>
          <Panel title="SLA">
            <p className={cn("text-sm", breached ? "font-medium text-destructive" : "text-muted-foreground")}>
              {t.status === "solved" || t.status === "closed" ? "Resolved" : breached ? `Breached ${relTime(t.dueAt)}` : `Due ${relTime(t.dueAt)}`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Target {fmtDate(t.dueAt)} UTC</p>
            {t.escalated && <p className="mt-2 text-xs text-destructive">Escalated: {t.escalationReason}</p>}
          </Panel>
          {customer && <Panel title="Customer">
            <Link to="/customers/$id" params={{ id: customer.id }} className="font-medium hover:text-primary">{customer.name}</Link>
            <p className="text-sm text-muted-foreground">{customer.company}</p><p className="text-sm text-muted-foreground">{customer.email}</p>
            <Badge variant="outline" className="mt-2 capitalize">{customer.tier}</Badge>
          </Panel>}
        </aside>
      </div>
    </>
  );
}
