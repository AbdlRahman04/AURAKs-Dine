import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { PaginatedOrders } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export const ORDERS_QUERY_KEY = "/api/orders";
export const ORDER_SUMMARY_QUERY_KEY = "/api/orders/summary";

type OrderSummary = {
  hasOrders: boolean;
};

export function useOrderSummary() {
  return useQuery<OrderSummary>({
    queryKey: [ORDER_SUMMARY_QUERY_KEY],
    queryFn: async () => {
      const response = await apiRequest("GET", ORDER_SUMMARY_QUERY_KEY);
      return response.json() as Promise<OrderSummary>;
    },
  });
}

export function useOrders(options?: { refetchInterval?: number | false }) {
  return useInfiniteQuery<PaginatedOrders>({
    queryKey: [ORDERS_QUERY_KEY, { limit: 50 }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await apiRequest(
        "GET",
        `${ORDERS_QUERY_KEY}?page=${pageParam}&limit=50`,
      );
      return response.json() as Promise<PaginatedOrders>;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    refetchInterval: options?.refetchInterval ?? false,
  });
}

export function flattenOrderPages(data: { pages: PaginatedOrders[] } | undefined) {
  return data?.pages.flatMap((page) => page.items) ?? [];
}
