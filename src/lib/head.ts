export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} · SupportDesk Pro` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · SupportDesk Pro` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
