import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => { throw redirect({ to: "/dashboard" }); },
  head: () => ({ meta: [{ title: "SupportDesk Pro" }, { name: "description", content: "Enterprise customer support workspace." }, { property: "og:title", content: "SupportDesk Pro" }, { property: "og:description", content: "Enterprise customer support workspace." }] }),
});
