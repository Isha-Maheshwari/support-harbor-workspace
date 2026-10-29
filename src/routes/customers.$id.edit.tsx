import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CustomerForm } from "@/components/app/forms";
import { NotFoundBlock, PageHeader, QueryBoundary } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { api, type CustomerInput } from "@/lib/mock-api";
import { useApiMutation, useCustomer } from "@/lib/queries";

export const Route = createFileRoute("/customers/$id/edit")({ head: pageHead("Edit customer", "Update customer details."), component: EditCustomer });

function EditCustomer() {
  const { id } = Route.useParams(); const nav = useNavigate();
  const q = useCustomer(id);
  const m = useApiMutation((d: CustomerInput) => api.updateCustomer(id, d), "Customer saved");
  if (q.error?.message.includes("not found")) return <NotFoundBlock what="Customer" back="/customers" />;
  return (
    <>
      <PageHeader crumbs={<Link to="/customers/$id" params={{ id }} className="hover:underline">Back to profile</Link>} title="Edit customer" />
      <QueryBoundary q={q}>
        {(c) => <CustomerForm initial={c} submitLabel="Save changes" pending={m.isPending} onCancel={() => nav({ to: "/customers/$id", params: { id } })}
          onSubmit={(d) => m.mutate(d, { onSuccess: () => nav({ to: "/customers/$id", params: { id } }) })} />}
      </QueryBoundary>
    </>
  );
}
