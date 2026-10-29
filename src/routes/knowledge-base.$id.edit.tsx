import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArticleForm } from "@/components/app/forms";
import { NotFoundBlock, PageHeader, QueryBoundary } from "@/components/app/ui-bits";
import { pageHead } from "@/lib/head";
import { api, type ArticleInput } from "@/lib/mock-api";
import { useApiMutation, useArticle } from "@/lib/queries";

export const Route = createFileRoute("/knowledge-base/$id/edit")({ head: pageHead("Edit article", "Update a knowledge base article."), component: EditArticle });

function EditArticle() {
  const { id } = Route.useParams(); const nav = useNavigate();
  const q = useArticle(id);
  const m = useApiMutation((d: ArticleInput) => api.updateArticle(id, d), "Article saved");
  if (q.error?.message.includes("not found")) return <NotFoundBlock what="Article" back="/knowledge-base" />;
  return (
    <>
      <PageHeader crumbs={<Link to="/knowledge-base/$id" params={{ id }} className="hover:underline">Back to article</Link>} title="Edit article" />
      <QueryBoundary q={q}>
        {(a) => <ArticleForm initial={a} submitLabel="Save article" pending={m.isPending} onCancel={() => nav({ to: "/knowledge-base/$id", params: { id } })}
          onSubmit={(d) => m.mutate(d, { onSuccess: () => nav({ to: "/knowledge-base/$id", params: { id } }) })} />}
      </QueryBoundary>
    </>
  );
}
