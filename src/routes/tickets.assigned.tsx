import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketTable } from "@/components/app/ticket-table";
import { PageHeader, QueryBoundary } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { CURRENT_AGENT_ID } from "@/lib/mock-api";
import { useTickets } from "@/lib/queries";

export const Route = createFileRoute("/tickets/assigned")({ head: pageHead("Assigned to me", "Tickets in your personal queue."), component: Assigned });

function Assigned() {
  const q = useTickets({ assigneeId: CURRENT_AGENT_ID });
  const [tab, setTab] = useState("active");
  return (
    <>
      <PageHeader title="Assigned to me" subtitle="Your personal queue." />
      <Tabs value={tab} onValueChange={setTab} className="mb-4"><TabsList>
        <TabsTrigger value="active">Active</TabsTrigger><TabsTrigger value="resolved">Resolved</TabsTrigger><TabsTrigger value="all">All</TabsTrigger>
      </TabsList></Tabs>
      <QueryBoundary q={q}>
        {(t) => <TicketTable tickets={t.filter((x) => tab === "all" || (tab === "active") === (x.status !== "solved" && x.status !== "closed"))} />}
      </QueryBoundary>
    </>
  );
}
