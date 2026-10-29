import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type TicketFilters } from "./mock-api";

export const qk = {
  tickets: (f?: TicketFilters) => ["tickets", f ?? {}] as const,
  ticket: (id: string) => ["ticket", id] as const,
  customers: (q = "") => ["customers", q] as const,
  customer: (id: string) => ["customer", id] as const,
  articles: (q = "") => ["articles", q] as const,
  article: (id: string) => ["article", id] as const,
};

export const useTickets = (f: TicketFilters = {}) => useQuery({ queryKey: qk.tickets(f), queryFn: () => api.listTickets(f) });
export const useTicket = (id: string) => useQuery({ queryKey: qk.ticket(id), queryFn: () => api.getTicket(id), retry: false });
export const useCustomers = (q = "") => useQuery({ queryKey: qk.customers(q), queryFn: () => api.listCustomers(q) });
export const useCustomer = (id: string) => useQuery({ queryKey: qk.customer(id), queryFn: () => api.getCustomer(id), retry: false });
export const useArticles = (q = "") => useQuery({ queryKey: qk.articles(q), queryFn: () => api.listArticles(q) });
export const useArticle = (id: string) => useQuery({ queryKey: qk.article(id), queryFn: () => api.getArticle(id), retry: false });
export const useAgents = () => useQuery({ queryKey: ["agents"], queryFn: api.listAgents, staleTime: 60_000 });
export const useAgent = (id: string) => useQuery({ queryKey: ["agent", id], queryFn: () => api.getAgent(id), retry: false });
export const useSlaPolicies = () => useQuery({ queryKey: ["sla"], queryFn: api.listSlaPolicies });
export const useBreaches = () => useQuery({ queryKey: ["breaches"], queryFn: api.listBreaches });
export const useActivity = () => useQuery({ queryKey: ["activity"], queryFn: api.listActivity });
export const useStats = () => useQuery({ queryKey: ["stats"], queryFn: api.stats });

/** Generic mutation that invalidates everything (mock data is small) and toasts. */
export function useApiMutation<A, R>(fn: (a: A) => Promise<R>, success?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => { qc.invalidateQueries(); if (success) toast.success(success); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Request failed"),
  });
}
