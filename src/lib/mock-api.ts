// Local asynchronous mock service with seeded data, simulated latency and controllable errors.
import { useSyncExternalStore } from "react";

export type TicketStatus = "open" | "pending" | "on_hold" | "solved" | "closed";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Channel = "email" | "chat" | "phone" | "web";
export type Tier = "free" | "pro" | "enterprise";

export interface Agent {
  id: string; name: string; email: string; role: "Agent" | "Lead" | "Manager";
  team: string; status: "online" | "away" | "offline"; capacity: number; joinedAt: string;
}
export interface Customer {
  id: string; name: string; company: string; email: string; phone: string;
  tier: Tier; status: "active" | "churned" | "trial"; createdAt: string; notes: string;
}
export interface Comment { id: string; authorType: "agent" | "customer"; authorId: string; body: string; internal: boolean; createdAt: string; }
export interface Ticket {
  id: string; subject: string; description: string; status: TicketStatus; priority: Priority;
  channel: Channel; customerId: string; assigneeId: string | null; tags: string[];
  createdAt: string; updatedAt: string; dueAt: string; escalated: boolean; escalationReason?: string | undefined;
  comments: Comment[];
}
export interface Article {
  id: string; title: string; category: string; body: string; status: "draft" | "published" | "archived";
  authorId: string; views: number; helpful: number; notHelpful: number; tags: string[]; updatedAt: string;
}
export interface SlaPolicy { id: string; name: string; priority: Priority; firstResponseMins: number; resolutionHours: number; active: boolean; }
export interface Activity { id: string; actorId: string; action: string; entityType: "ticket" | "customer" | "article" | "sla"; entityId: string; message: string; createdAt: string; }

// ---------- service controls ----------
export interface ServiceSettings { latency: number; failureRate: number; forceError: boolean; }
let settings: ServiceSettings = { latency: 450, failureRate: 0, forceError: false };
const listeners = new Set<() => void>();
export function setServiceSettings(p: Partial<ServiceSettings>) { settings = { ...settings, ...p }; listeners.forEach((l) => l()); }
export function useServiceSettings() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => settings, () => settings);
}

export class ServiceError extends Error {}
async function call<T>(fn: () => T): Promise<T> {
  const jitter = settings.latency * (0.6 + Math.random() * 0.8);
  await new Promise((r) => setTimeout(r, jitter));
  if (settings.forceError || Math.random() < settings.failureRate) {
    throw new ServiceError("Service unavailable (simulated 503). Please retry.");
  }
  return structuredClone(fn());
}

// ---------- seeding ----------
export const NOW = Date.parse("2026-10-29T09:00:00Z");
function rng(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r = rng(42);
const pick = <T,>(a: readonly T[]): T => a[Math.floor(r() * a.length)] as T;
const iso = (ms: number) => new Date(ms).toISOString();
const H = 3600_000;

const agentNames = ["Priya Raman", "Marcus Chen", "Sofia Alvarez", "Daniel Okafor", "Hannah Weiss", "Arjun Mehta", "Lena Novak", "Tom Brennan", "Aiko Tanaka", "Rafael Costa"];
const teams = ["Tier 1", "Tier 2", "Billing", "Technical"];
const agents: Agent[] = agentNames.map((name, i) => ({
  id: `a${i + 1}`, name, email: name.toLowerCase().replace(" ", ".") + "@supportdesk.io",
  role: i === 0 ? "Manager" : i < 3 ? "Lead" : "Agent", team: teams[i % 4] as string,
  status: pick(["online", "online", "away", "offline"] as const), capacity: 15 + Math.floor(r() * 15),
  joinedAt: iso(NOW - (200 + i * 90) * 24 * H),
}));

const firsts = ["Olivia", "Liam", "Emma", "Noah", "Ava", "Ethan", "Mia", "Lucas", "Zara", "Kenji", "Nadia", "Omar", "Grace", "Felix", "Isla", "Ravi", "Chloe", "Mateo", "Ines", "Yusuf"];
const lasts = ["Parker", "Nguyen", "Schmidt", "Rossi", "Kim", "Silva", "Dubois", "Patel", "Johansson", "Ward"];
const companies = ["Northwind Labs", "Acme Logistics", "Helios Energy", "Bluefin Retail", "Quanta Health", "Vertex Finance", "Orbit Media", "Pinecrest Foods", "Lumen Systems", "Atlas Travel", "Cobalt Robotics", "Juniper Legal"];
const customers: Customer[] = Array.from({ length: 36 }, (_, i) => {
  const name = `${pick(firsts)} ${pick(lasts)}`; const company = pick(companies);
  return {
    id: `c${i + 1}`, name, company, email: `${name.split(" ")[0]!.toLowerCase()}@${company.split(" ")[0]!.toLowerCase()}.com`,
    phone: `+1 (${200 + Math.floor(r() * 700)}) 555-${String(1000 + Math.floor(r() * 9000))}`,
    tier: pick(["free", "pro", "pro", "enterprise"] as const), status: pick(["active", "active", "active", "trial", "churned"] as const),
    createdAt: iso(NOW - Math.floor(r() * 700) * 24 * H), notes: "",
  };
});

const subjects = ["Unable to log in after password reset", "Invoice shows duplicate charge", "API returning 429 rate limit errors", "Export to CSV missing columns", "SSO configuration with Okta fails", "Webhook deliveries delayed", "Request to upgrade plan", "Mobile app crashes on launch", "Data sync stuck at 80%", "Need refund for annual plan", "Dashboard loads very slowly", "2FA codes not arriving", "Bulk import rejects valid file", "Integration with Slack disconnected", "Cannot invite new team members", "Report numbers don't match", "Email notifications going to spam", "Account locked unexpectedly"];
const tagPool = ["billing", "login", "api", "bug", "feature-request", "integration", "performance", "mobile", "security", "refund"];
const slaHours: Record<Priority, number> = { urgent: 4, high: 12, medium: 24, low: 72 };
const tickets: Ticket[] = Array.from({ length: 84 }, (_, i) => {
  const created = NOW - Math.floor(r() * 30 * 24) * H - Math.floor(r() * H);
  const priority = pick(["low", "medium", "medium", "high", "high", "urgent"] as const);
  const status = pick(["open", "open", "open", "pending", "on_hold", "solved", "solved", "closed"] as const);
  const customerId = pick(customers).id;
  const assigneeId = r() < 0.12 ? null : pick(agents).id;
  const escalated = r() < 0.14 && status !== "closed";
  const comments: Comment[] = [{ id: `m${i}-0`, authorType: "customer", authorId: customerId, body: "Hi team, this is blocking our work. Could you take a look as soon as possible?", internal: false, createdAt: iso(created + 10 * 60_000) }];
  if (assigneeId) comments.push({ id: `m${i}-1`, authorType: "agent", authorId: assigneeId, body: "Thanks for reaching out — I'm investigating and will update you shortly.", internal: false, createdAt: iso(created + 2 * H) });
  return {
    id: `T-${1000 + i}`, subject: pick(subjects), description: "Customer reports the issue started after the latest release. Steps to reproduce were provided in the original email. Affects multiple users in their workspace.",
    status, priority, channel: pick(["email", "chat", "phone", "web"] as const), customerId, assigneeId,
    tags: [pick(tagPool), pick(tagPool)].filter((v, k, a) => a.indexOf(v) === k),
    createdAt: iso(created), updatedAt: iso(created + Math.floor(r() * 48) * H), dueAt: iso(created + slaHours[priority] * H),
    escalated, escalationReason: escalated ? pick(["Customer threatened churn", "SLA at risk", "Requires engineering", "Executive request"]) : undefined, comments,
  };
});

const categories = ["Getting Started", "Billing", "Integrations", "Troubleshooting", "Security", "API"];
const articleTitles = ["How to reset your password", "Understanding your invoice", "Connecting Slack to SupportDesk", "Fixing webhook delivery delays", "Setting up SSO with Okta", "API rate limits explained", "Exporting data to CSV", "Enabling two-factor authentication", "Inviting teammates", "Bulk importing customers", "Troubleshooting mobile app crashes", "Refund and cancellation policy", "Configuring email forwarding", "Best practices for API keys"];
const articles: Article[] = articleTitles.map((title, i) => ({
  id: `kb${i + 1}`, title, category: categories[i % categories.length] as string,
  body: `## Overview\nThis guide explains ${title.toLowerCase()}.\n\n## Steps\n1. Open **Settings** from the left sidebar.\n2. Choose the relevant section.\n3. Follow the on-screen instructions and save.\n\n## Still stuck?\nContact support and reference this article.`,
  status: i % 7 === 6 ? "draft" : "published", authorId: pick(agents).id, views: Math.floor(r() * 5000),
  helpful: Math.floor(r() * 300), notHelpful: Math.floor(r() * 40), tags: [pick(tagPool)], updatedAt: iso(NOW - Math.floor(r() * 90) * 24 * H),
}));

const slaPolicies: SlaPolicy[] = [
  { id: "sla1", name: "Urgent — Enterprise", priority: "urgent", firstResponseMins: 15, resolutionHours: 4, active: true },
  { id: "sla2", name: "High priority", priority: "high", firstResponseMins: 60, resolutionHours: 12, active: true },
  { id: "sla3", name: "Standard", priority: "medium", firstResponseMins: 240, resolutionHours: 24, active: true },
  { id: "sla4", name: "Low priority", priority: "low", firstResponseMins: 720, resolutionHours: 72, active: true },
];

const activities: Activity[] = Array.from({ length: 60 }, (_, i) => {
  const t = pick(tickets); const a = pick(agents);
  const [action, message] = pick([["status_changed", `changed status of ${t.id} to ${t.status}`], ["commented", `replied on ${t.id}`], ["assigned", `assigned ${t.id} to themselves`], ["priority_changed", `set ${t.id} priority to ${t.priority}`]] as const);
  return { id: `ev${i}`, actorId: a.id, action, entityType: "ticket" as const, entityId: t.id, message, createdAt: iso(NOW - i * 47 * 60_000) };
});

export const CURRENT_AGENT_ID = "a2";
let seq = 2000;
const now = () => new Date().toISOString();
function log(entityType: Activity["entityType"], entityId: string, action: string, message: string) {
  activities.unshift({ id: `ev${++seq}`, actorId: CURRENT_AGENT_ID, action, entityType, entityId, message, createdAt: now() });
}
const isOpen = (t: Ticket) => t.status !== "solved" && t.status !== "closed";
export const isBreached = (t: Ticket, at = Date.now()) => isOpen(t) && Date.parse(t.dueAt) < Math.max(at, NOW);

// ---------- API ----------
export interface TicketFilters { q?: string | undefined; status?: string | undefined; priority?: string | undefined; assigneeId?: string | undefined; escalated?: boolean | undefined; customerId?: string | undefined; }
export type TicketInput = Pick<Ticket, "subject" | "description" | "status" | "priority" | "channel" | "customerId" | "assigneeId" | "tags">;
export type CustomerInput = Omit<Customer, "id" | "createdAt">;
export type ArticleInput = Pick<Article, "title" | "category" | "body" | "status" | "tags">;

function notFound(what: string): never { throw new ServiceError(`${what} not found`); }

export const api = {
  listTickets: (f: TicketFilters = {}) => call(() => tickets.filter((t) =>
    (!f.q || `${t.id} ${t.subject}`.toLowerCase().includes(f.q.toLowerCase())) &&
    (!f.status || f.status === "all" || t.status === f.status) &&
    (!f.priority || f.priority === "all" || t.priority === f.priority) &&
    (!f.assigneeId || (f.assigneeId === "unassigned" ? !t.assigneeId : t.assigneeId === f.assigneeId)) &&
    (f.escalated === undefined || t.escalated === f.escalated) &&
    (!f.customerId || t.customerId === f.customerId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  getTicket: (id: string) => call(() => tickets.find((t) => t.id === id) ?? notFound("Ticket")),
  createTicket: (d: TicketInput) => call(() => {
    const t: Ticket = { ...d, id: `T-${1000 + tickets.length}`, createdAt: now(), updatedAt: now(), dueAt: iso(Date.now() + slaHours[d.priority] * H), escalated: false, comments: [] };
    tickets.unshift(t); log("ticket", t.id, "created", `created ${t.id}`); return t;
  }),
  updateTicket: (id: string, d: Partial<Ticket>) => call(() => {
    const t = tickets.find((x) => x.id === id) ?? notFound("Ticket");
    Object.assign(t, d, { updatedAt: now() });
    log("ticket", id, "updated", `updated ${id}${d.status ? ` (status: ${d.status})` : ""}${d.escalated !== undefined ? (d.escalated ? " — escalated" : " — de-escalated") : ""}`); return t;
  }),
  addComment: (id: string, body: string, internal: boolean) => call(() => {
    const t = tickets.find((x) => x.id === id) ?? notFound("Ticket");
    t.comments.push({ id: `m${++seq}`, authorType: "agent", authorId: CURRENT_AGENT_ID, body, internal, createdAt: now() });
    t.updatedAt = now(); log("ticket", id, "commented", `${internal ? "added an internal note on" : "replied on"} ${id}`); return t;
  }),
  deleteTicket: (id: string) => call(() => { const i = tickets.findIndex((t) => t.id === id); if (i < 0) notFound("Ticket"); tickets.splice(i, 1); log("ticket", id, "deleted", `deleted ${id}`); return true; }),

  listCustomers: (q = "") => call(() => customers.filter((c) => `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(q.toLowerCase()))),
  getCustomer: (id: string) => call(() => customers.find((c) => c.id === id) ?? notFound("Customer")),
  createCustomer: (d: CustomerInput) => call(() => { const c = { ...d, id: `c${customers.length + 1 + seq++}`, createdAt: now() }; customers.unshift(c); log("customer", c.id, "created", `added customer ${c.name}`); return c; }),
  updateCustomer: (id: string, d: Partial<Customer>) => call(() => { const c = customers.find((x) => x.id === id) ?? notFound("Customer"); Object.assign(c, d); log("customer", id, "updated", `updated customer ${c.name}`); return c; }),

  listArticles: (q = "") => call(() => articles.filter((a) => `${a.title} ${a.category}`.toLowerCase().includes(q.toLowerCase()))),
  getArticle: (id: string) => call(() => articles.find((a) => a.id === id) ?? notFound("Article")),
  createArticle: (d: ArticleInput) => call(() => { const a: Article = { ...d, id: `kb${articles.length + 1 + seq++}`, authorId: CURRENT_AGENT_ID, views: 0, helpful: 0, notHelpful: 0, updatedAt: now() }; articles.unshift(a); log("article", a.id, "created", `created article "${a.title}"`); return a; }),
  updateArticle: (id: string, d: Partial<Article>) => call(() => { const a = articles.find((x) => x.id === id) ?? notFound("Article"); Object.assign(a, d, { updatedAt: now() }); log("article", id, "updated", `updated article "${a.title}"`); return a; }),
  voteArticle: (id: string, helpful: boolean) => call(() => { const a = articles.find((x) => x.id === id) ?? notFound("Article"); if (helpful) a.helpful++; else a.notHelpful++; return a; }),

  listAgents: () => call(() => agents),
  getAgent: (id: string) => call(() => agents.find((a) => a.id === id) ?? notFound("Agent")),

  listSlaPolicies: () => call(() => slaPolicies),
  updateSlaPolicy: (id: string, d: Partial<SlaPolicy>) => call(() => { const p = slaPolicies.find((x) => x.id === id) ?? notFound("Policy"); Object.assign(p, d); log("sla", id, "updated", `updated SLA policy "${p.name}"`); return p; }),
  listBreaches: () => call(() => tickets.filter((t) => isBreached(t)).sort((a, b) => a.dueAt.localeCompare(b.dueAt))),

  listActivity: () => call(() => activities.slice(0, 200)),

  stats: () => call(() => {
    const open = tickets.filter(isOpen);
    const byDay = Array.from({ length: 14 }, (_, k) => {
      const d = new Date(NOW - (13 - k) * 24 * H); const key = d.toISOString().slice(0, 10);
      return { day: key.slice(5), created: tickets.filter((t) => t.createdAt.startsWith(key)).length, solved: tickets.filter((t) => !isOpen(t) && t.updatedAt.startsWith(key)).length };
    });
    const count = <K extends string>(keys: readonly K[], f: (t: Ticket) => K) => keys.map((k) => ({ name: k, value: tickets.filter((t) => f(t) === k).length }));
    const agentStats = agents.map((a) => {
      const mine = tickets.filter((t) => t.assigneeId === a.id);
      const solved = mine.filter((t) => !isOpen(t)).length;
      return { id: a.id, name: a.name, team: a.team, assigned: mine.length, open: mine.filter(isOpen).length, solved, breached: mine.filter((t) => isBreached(t)).length,
        csat: Math.round(82 + ((a.id.charCodeAt(1) * 7) % 16)), avgResponseMins: 20 + ((a.id.charCodeAt(1) * 13) % 90) };
    });
    return {
      total: tickets.length, open: open.length, unassigned: open.filter((t) => !t.assigneeId).length,
      escalated: tickets.filter((t) => t.escalated && isOpen(t)).length, breached: tickets.filter((t) => isBreached(t)).length,
      solved: tickets.length - open.length, csat: 91, avgFirstResponseMins: 42, byDay,
      byStatus: count(["open", "pending", "on_hold", "solved", "closed"] as const, (t) => t.status),
      byPriority: count(["low", "medium", "high", "urgent"] as const, (t) => t.priority),
      byChannel: count(["email", "chat", "phone", "web"] as const, (t) => t.channel),
      agentStats,
    };
  }),
};
