import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginatedMenuItems } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export const MENU_PAGE_SIZE = 24;

type UseMenuItemsOptions = {
  admin?: boolean;
  page: number;
  search?: string;
  category?: string;
};

export function useMenuItems({
  admin = false,
  page,
  search = "",
  category = "All",
}: UseMenuItemsOptions) {
  const endpoint = admin ? "/api/admin/menu" : "/api/menu";

  return useQuery<PaginatedMenuItems>({
    queryKey: [endpoint, { page, limit: MENU_PAGE_SIZE, search, category }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(MENU_PAGE_SIZE),
      });

      if (search) params.set("search", search);
      if (category && category.toLowerCase() !== "all") {
        params.set("category", category);
      }

      const response = await apiRequest("GET", `${endpoint}?${params}`);
      return response.json() as Promise<PaginatedMenuItems>;
    },
    placeholderData: keepPreviousData,
  });
}
