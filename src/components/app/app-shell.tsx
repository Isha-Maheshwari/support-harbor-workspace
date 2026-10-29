import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, BarChart3, BookOpen, Gauge, Headset, Inbox, LayoutDashboard, Menu, ShieldAlert, Timer, UserCheck, Users, UsersRound, FileBarChart, Flame, PlusCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { setServiceSettings, useServiceSettings } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

const nav: { group: string; items: { to: string; label: string; icon: typeof Inbox; exact?: boolean }[] }[] = [
  { group: "Workspace", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/activity-log", label: "Activity log", icon: Activity },
  ] },
  { group: "Tickets", items: [
    { to: "/tickets", label: "All tickets", icon: Inbox, exact: true },
    { to: "/tickets/new", label: "New ticket", icon: PlusCircle },
    { to: "/tickets/assigned", label: "Assigned to me", icon: UserCheck },
    { to: "/tickets/escalations", label: "Escalations", icon: Flame },
  ] },
  { group: "Customers", items: [{ to: "/customers", label: "Customers", icon: Users }] },
  { group: "Knowledge", items: [{ to: "/knowledge-base", label: "Knowledge base", icon: BookOpen }] },
  { group: "Team & SLA", items: [
    { to: "/team", label: "Team", icon: UsersRound },
    { to: "/sla/policies", label: "SLA policies", icon: Timer },
    { to: "/sla/breaches", label: "SLA breaches", icon: ShieldAlert },
  ] },
  { group: "Reports", items: [
    { to: "/reports", label: "Overview", icon: FileBarChart, exact: true },
    { to: "/reports/tickets", label: "Ticket report", icon: Gauge },
    { to: "/reports/agents", label: "Agent report", icon: UsersRound },
  ] },
];

function ServiceControls() {
  const s = useServiceSettings();
  return (
    <div className="space-y-3 rounded-md border border-sidebar-border bg-sidebar-accent/40 p-3 text-xs">
      <div className="font-semibold uppercase tracking-wider text-sidebar-foreground/60">Mock service</div>
      <div>
        <div className="mb-1.5 flex justify-between"><span>Latency</span><span className="font-mono">{s.latency}ms</span></div>
        <Slider value={[s.latency]} min={0} max={3000} step={50} onValueChange={([v]) => setServiceSettings({ latency: v })} />
      </div>
      <div>
        <div className="mb-1.5 flex justify-between"><span>Random failures</span><span className="font-mono">{Math.round(s.failureRate * 100)}%</span></div>
        <Slider value={[s.failureRate * 100]} min={0} max={100} step={5} onValueChange={([v]) => setServiceSettings({ failureRate: v / 100 })} />
      </div>
      <label className="flex items-center justify-between"><span>Force outage</span><Switch checked={s.forceError} onCheckedChange={(v) => setServiceSettings({ forceError: v })} /></label>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const isActive = (to: string, exact?: boolean) => exact ? path === to || (to === "/tickets" && /^\/tickets\/T-/.test(path)) || (to === "/customers" && path.startsWith("/customers")) : path === to || path.startsWith(to + "/");
  return (
    <div className="flex min-h-screen bg-background">
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <Link to="/dashboard" className="flex items-center gap-2 px-5 py-5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><Headset className="h-4 w-4" /></span>
          <span className="font-display text-base font-semibold">SupportDesk <span className="text-sidebar-primary">Pro</span></span>
        </Link>
        <nav className="flex-1 space-y-5 px-3 pb-4">
          {nav.map((g) => (
            <div key={g.group}>
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">{g.group}</div>
              {g.items.map((it) => (
                <Link key={it.to} to={it.to} onClick={() => setOpen(false)}
                  className={cn("flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent", isActive(it.to, it.exact) && "bg-sidebar-accent font-medium text-sidebar-primary")}>
                  <it.icon className="h-4 w-4" />{it.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-3"><ServiceControls /></div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <div className="text-sm text-muted-foreground">Signed in as <span className="font-medium text-foreground">Marcus Chen</span> · Tier 2 Lead</div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
