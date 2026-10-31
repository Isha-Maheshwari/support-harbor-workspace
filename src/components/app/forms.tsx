import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ArticleInput, CustomerInput, TicketInput } from "@/lib/mock-api";
import { useAgents, useCustomers } from "@/lib/queries";
import { selectCls } from "./ui-bits";

type Errs = Partial<Record<"subject" | "customerId" | "description" | "name" | "email" | "company" | "title" | "body", string>>;

const formClassName = "grid max-w-3xl gap-4 rounded-lg border bg-card p-6 shadow-card";

function Field({ label, error, children, htmlFor }: { label: string; error?: string | undefined; children: ReactNode; htmlFor: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Actions({ pending, label, onCancel }: { pending: boolean; label: string; onCancel: () => void }) {
  return (
    <div className="flex gap-2 pt-2">
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : label}</Button>
      <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
    </div>
  );
}

export function TicketForm({ initial, onSubmit, pending, submitLabel, onCancel }: { initial?: Partial<TicketInput>; onSubmit: (d: TicketInput) => void; pending: boolean; submitLabel: string; onCancel: () => void }) {
  const agents = useAgents().data ?? [];
  const customers = useCustomers().data ?? [];
  const [d, setD] = useState<TicketInput>({ subject: "", description: "", status: "open", priority: "medium", channel: "email", customerId: "", assigneeId: null, tags: [], ...initial });
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [err, setErr] = useState<Errs>({});
  const set = <K extends keyof TicketInput>(k: K, v: TicketInput[K]) => setD((p) => ({ ...p, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Errs = {};
    if (d.subject.trim().length < 5) er.subject = "Subject must be at least 5 characters";
    if (!d.customerId) er.customerId = "Select a customer";
    if (d.description.trim().length < 10) er.description = "Describe the issue (10+ characters)";
    setErr(er);
    if (!Object.keys(er).length) onSubmit({ ...d, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) });
  };
  return (
    <form onSubmit={submit} className={formClassName}>
      <Field label="Subject" htmlFor="subject" error={err.subject}><Input id="subject" maxLength={150} value={d.subject} onChange={(e) => set("subject", e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Customer" htmlFor="customer" error={err.customerId}>
          <select id="customer" className={selectCls} value={d.customerId} onChange={(e) => set("customerId", e.target.value)}>
            <option value="">Select…</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
          </select>
        </Field>
        <Field label="Assignee" htmlFor="assignee">
          <select id="assignee" className={selectCls} value={d.assigneeId ?? ""} onChange={(e) => set("assigneeId", e.target.value || null)}>
            <option value="">Unassigned</option>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="Priority" htmlFor="priority">
          <select id="priority" className={selectCls} value={d.priority} onChange={(e) => set("priority", e.target.value as TicketInput["priority"])}>
            {["low", "medium", "high", "urgent"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="Status" htmlFor="status">
          <select id="status" className={selectCls} value={d.status} onChange={(e) => set("status", e.target.value as TicketInput["status"])}>
            {["open", "pending", "on_hold", "solved", "closed"].map((v) => <option key={v} value={v}>{v.replace("_", " ")}</option>)}
          </select>
        </Field>
        <Field label="Channel" htmlFor="channel">
          <select id="channel" className={selectCls} value={d.channel} onChange={(e) => set("channel", e.target.value as TicketInput["channel"])}>
            {["email", "chat", "phone", "web"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="Tags (comma separated)" htmlFor="tags"><Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} /></Field>
      </div>
      <Field label="Description" htmlFor="desc" error={err.description}><Textarea id="desc" rows={6} maxLength={5000} value={d.description} onChange={(e) => set("description", e.target.value)} /></Field>
      <Actions pending={pending} label={submitLabel} onCancel={onCancel} />
    </form>
  );
}

export function CustomerForm({ initial, onSubmit, pending, submitLabel, onCancel }: { initial?: Partial<CustomerInput>; onSubmit: (d: CustomerInput) => void; pending: boolean; submitLabel: string; onCancel: () => void }) {
  const [d, setD] = useState<CustomerInput>({ name: "", company: "", email: "", phone: "", tier: "pro", status: "active", notes: "", ...initial });
  const [err, setErr] = useState<Errs>({});
  const set = <K extends keyof CustomerInput>(k: K, v: CustomerInput[K]) => setD((p) => ({ ...p, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Errs = {};
    if (!d.name.trim()) er.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) er.email = "Enter a valid email";
    if (!d.company.trim()) er.company = "Company is required";
    setErr(er);
    if (!Object.keys(er).length) onSubmit(d);
  };
  return (
    <form onSubmit={submit} className={formClassName}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" error={err.name}><Input id="name" maxLength={100} value={d.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Company" htmlFor="company" error={err.company}><Input id="company" maxLength={100} value={d.company} onChange={(e) => set("company", e.target.value)} /></Field>
        <Field label="Email" htmlFor="email" error={err.email}><Input id="email" type="email" maxLength={255} value={d.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Phone" htmlFor="phone"><Input id="phone" maxLength={30} value={d.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Tier" htmlFor="tier"><select id="tier" className={selectCls} value={d.tier} onChange={(e) => set("tier", e.target.value as CustomerInput["tier"])}>{["free", "pro", "enterprise"].map((v) => <option key={v}>{v}</option>)}</select></Field>
        <Field label="Status" htmlFor="cstatus"><select id="cstatus" className={selectCls} value={d.status} onChange={(e) => set("status", e.target.value as CustomerInput["status"])}>{["active", "trial", "churned"].map((v) => <option key={v}>{v}</option>)}</select></Field>
      </div>
      <Field label="Notes" htmlFor="notes"><Textarea id="notes" rows={4} maxLength={2000} value={d.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
      <Actions pending={pending} label={submitLabel} onCancel={onCancel} />
    </form>
  );
}

export function ArticleForm({ initial, onSubmit, pending, submitLabel, onCancel }: { initial?: Partial<ArticleInput>; onSubmit: (d: ArticleInput) => void; pending: boolean; submitLabel: string; onCancel: () => void }) {
  const [d, setD] = useState<ArticleInput>({ title: "", category: "Getting Started", body: "", status: "draft", tags: [], ...initial });
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [err, setErr] = useState<Errs>({});
  const set = <K extends keyof ArticleInput>(k: K, v: ArticleInput[K]) => setD((p) => ({ ...p, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Errs = {};
    if (d.title.trim().length < 5) er.title = "Title must be at least 5 characters";
    if (d.body.trim().length < 20) er.body = "Body must be at least 20 characters";
    setErr(er);
    if (!Object.keys(er).length) onSubmit({ ...d, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) });
  };
  return (
    <form onSubmit={submit} className={formClassName}>
      <Field label="Title" htmlFor="title" error={err.title}><Input id="title" maxLength={150} value={d.title} onChange={(e) => set("title", e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Category" htmlFor="cat"><select id="cat" className={selectCls} value={d.category} onChange={(e) => set("category", e.target.value)}>{["Getting Started", "Billing", "Integrations", "Troubleshooting", "Security", "API"].map((v) => <option key={v}>{v}</option>)}</select></Field>
        <Field label="Status" htmlFor="astatus"><select id="astatus" className={selectCls} value={d.status} onChange={(e) => set("status", e.target.value as ArticleInput["status"])}>{["draft", "published", "archived"].map((v) => <option key={v}>{v}</option>)}</select></Field>
        <Field label="Tags" htmlFor="atags"><Input id="atags" value={tags} onChange={(e) => setTags(e.target.value)} /></Field>
      </div>
      <Field label="Body (Markdown-lite: ## headings, **bold**, 1. lists)" htmlFor="body" error={err.body}><Textarea id="body" rows={14} className="font-mono text-sm" value={d.body} onChange={(e) => set("body", e.target.value)} /></Field>
      <Actions pending={pending} label={submitLabel} onCancel={onCancel} />
    </form>
  );
}
