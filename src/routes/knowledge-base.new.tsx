import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArticleForm } from "@/components/app/forms";
import { PageHeader } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/mock-api";
import { useApiMutation } from "@/lib/queries";

export const Route = createFileRoute("/knowledge-base/new")({ head: pageHead("New article", "Write a knowledge base article."), component: NewArticle });

function NewArticle() {
  const nav = useNavigate();
  const m = useApiMutation(api.createArticle, "Article created");
  return (
    <>
      <PageHeader title="New article" />
      <ArticleForm submitLabel="Create article" pending={m.isPending} onCancel={() => nav({ to: "/knowledge-base" })}
        onSubmit={(d) => m.mutate(d, { onSuccess: (a) => nav({ to: "/knowledge-base/$id", params: { id: a.id } }) })} />
    </>
  );
}
