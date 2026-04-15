import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RankData {
  skill_score: number;
  streak_score: number;
  consistency_score: number;
  final_rank: number;
  rank_position?: number;
}

export function useUserRank() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-rank", user?.id],
    queryFn: async (): Promise<RankData | null> => {
      if (!user) return null;

      const { data } = await (supabase as any)
        .from("candidate_ranks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) {
        await supabase.functions.invoke("calculate-rank", {
          body: { user_id: user.id },
        });

        const { data: newData } = await (supabase as any)
          .from("candidate_ranks")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        return newData as RankData | null;
      }

      return data as RankData;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useJobRanking() {
  return useMutation({
    mutationFn: async ({ job_id }: { job_id: string; required_skills?: string[] }) => {
      const { data, error } = await supabase.functions.invoke("calculate-rank", {
        body: { job_id },
      });
      if (error) throw error;
      return data;
    },
  });
}
