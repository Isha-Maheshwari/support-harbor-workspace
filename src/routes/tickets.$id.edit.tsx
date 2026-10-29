import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TicketForm } from "@/components/app/forms";
import { NotFoundBlock, PageHeader, QueryBoundary } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { api, type TicketInput } from "@/lib/mock-api";
import { useApiMutation, useTicket } from "@/lib/queries";

export const Route = createFileRoute("/tickets/$id/edit")({ head: pageHead("Edit ticket", "Update ticket properties."), component: EditTicket });

function EditTicket() {
  const { id } = Route.useParams(); const nav = useNavigate();
  const q = useTicket(id);
  const m = useApiMutation((d: TicketInput) => api.updateTicket(id, d), "Ticket saved");
  if (q.error?.message.includes("not found")) return <NotFoundBlock what={`Ticket ${id}`} back="/tickets" />;
  return (
    <>
      <PageHeader crumbs={<Link to="/tickets/$id" params={{ id }} className="hover:underline">{id}</Link>} title="Edit ticket" />
      <QueryBoundary q={q}>
        {(t) => <TicketForm initial={t} submitLabel="Save changes" pending={m.isPending} onCancel={() => nav({ to: "/tickets/$id", params: { id } })}
          onSubmit={(d) => m.mutate(d, { onSuccess: () => nav({ to: "/tickets/$id", params: { id } }) })} />}
      </QueryBoundary>
    </>
  );
}
