import { useQuery } from "@tanstack/react-query";
import { useApi } from "../lib/api";
import {
  statsResponseSchema,
  type StatsResponse,
  type StatsPeriod,
} from "../schemas";

const STATS_KEY = ["stats"];

export function useStats(period: StatsPeriod = "30d") {
  const api = useApi();

  return useQuery({
    queryKey: [...STATS_KEY, period],
    queryFn: () =>
      api.get<StatsResponse>(
        `/api/stats?period=${period}`,
        undefined,
        statsResponseSchema
      ),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}


