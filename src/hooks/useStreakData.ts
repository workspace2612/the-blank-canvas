import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StreakData {
  github: {
    today_commits: number;
    weekly_commits: number;
    active_days: number;
    streak: number;
  };
  leetcode: {
    today_solved: number;
    weekly_solved: number;
    streak: number;
  };
  kaggle: {
    weekly_activity: number;
    last_active_days_ago: number | null;
    note: string;
  };
}

export const useStreakData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["streak-data", user?.id],
    queryFn: async (): Promise<StreakData> => {
      if (!user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("github_url, leetcode_url, kaggle_url")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { data, error } = await supabase.functions.invoke("fetch-streak", {
        body: {
          github_url: profile.github_url,
          leetcode_url: profile.leetcode_url,
          kaggle_url: profile.kaggle_url,
        },
      });

      if (error) {
        if (error.message?.includes("429")) throw new Error("Rate limit exceeded");
        if (error.message?.includes("402")) throw new Error("Credits exhausted");
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.message || "Failed to analyze profile");
      }

      // Store streak data in DB
      const streakUpdates: Promise<any>[] = [];
      if (data.data.github) {
        streakUpdates.push(
          (supabase as any).from("streaks").upsert({
            user_id: user.id,
            platform: "github",
            streak_days: data.data.github.streak,
            weekly_contributions: data.data.github.weekly_commits,
            today_contributions: data.data.github.today_commits,
            active_days: data.data.github.active_days,
            total_contributions: data.data.github.weekly_commits,
            last_fetched_at: new Date().toISOString(),
            raw_data: data.data.github,
          }, { onConflict: "user_id,platform" })
        );
      }
      if (data.data.leetcode) {
        streakUpdates.push(
          (supabase as any).from("streaks").upsert({
            user_id: user.id,
            platform: "leetcode",
            streak_days: data.data.leetcode.streak,
            weekly_contributions: data.data.leetcode.weekly_solved,
            today_contributions: data.data.leetcode.today_solved,
            active_days: 0,
            total_contributions: data.data.leetcode.weekly_solved,
            last_fetched_at: new Date().toISOString(),
            raw_data: data.data.leetcode,
          }, { onConflict: "user_id,platform" })
        );
      }
      await Promise.all(streakUpdates);

      supabase.functions.invoke("calculate-rank", { body: { user_id: user.id } }).catch(console.error);

      return data.data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
