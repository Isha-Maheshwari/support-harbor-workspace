import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CustomerForm } from "@/components/app/forms";
import { PageHeader } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/mock-api";
import { useApiMutation } from "@/lib/queries";

export const Route = createFileRoute("/customers/new")({ head: pageHead("New customer", "Add a customer account."), component: NewCustomer });

function NewCustomer() {
  const nav = useNavigate();
  const m = useApiMutation(api.createCustomer, "Customer added");
  return (
    <>
      <PageHeader title="Add customer" />
      <CustomerForm submitLabel="Add customer" pending={m.isPending} onCancel={() => nav({ to: "/customers" })}
        onSubmit={(d) => m.mutate(d, { onSuccess: (c) => nav({ to: "/customers/$id", params: { id: c.id } }) })} />
    </>
  );
}
