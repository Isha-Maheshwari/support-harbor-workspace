import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TicketForm } from "@/components/app/forms";
import { PageHeader } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/mock-api";
import { useApiMutation } from "@/lib/queries";

export const Route = createFileRoute("/tickets/new")({ head: pageHead("New ticket", "Log a new customer support ticket."), component: NewTicket });

function NewTicket() {
  const nav = useNavigate();
  const m = useApiMutation(api.createTicket, "Ticket created");
  return (
    <>
      <PageHeader title="New ticket" subtitle="Log a request on behalf of a customer." />
      <TicketForm submitLabel="Create ticket" pending={m.isPending} onCancel={() => nav({ to: "/tickets" })}
        onSubmit={(d) => m.mutate(d, { onSuccess: (t) => nav({ to: "/tickets/$id", params: { id: t.id } }) })} />
    </>
  );
}
