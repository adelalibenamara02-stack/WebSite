import { queryOptions } from "@tanstack/react-query";

import { getCatalog } from "./shop.functions";

export const catalogQueryOptions = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
  staleTime: 30_000,
});
