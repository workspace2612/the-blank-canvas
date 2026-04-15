import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, job_id } = await req.json();

    if (user_id) {
      // Calculate rank for a single user
      const rank = await calculateUserRank(supabase, user_id);
      return new Response(JSON.stringify({ success: true, rank }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (job_id) {
      // Rank all applicants for a job
      const { data: applications } = await supabase
        .from("applications")
        .select("candidate_id")
        .eq("job_id", job_id);

      if (!applications?.length) {
        return new Response(JSON.stringify({ success: true, candidates: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get job requirements
      const { data: job } = await supabase.from("jobs").select("*").eq("id", job_id).single();
      const requiredSkills = (job?.requirements || []).map((r: any) => r.name?.toLowerCase()).filter(Boolean);

      const rankedCandidates = [];
      for (const app of applications) {
        const rank = await calculateUserRank(supabase, app.candidate_id, requiredSkills);
        rankedCandidates.push({ candidate_id: app.candidate_id, ...rank });
      }

      // Sort by final_rank descending
      rankedCandidates.sort((a, b) => {
        if (b.final_rank !== a.final_rank) return b.final_rank - a.final_rank;
        return b.consistency_score - a.consistency_score; // Tie-breaker
      });

      // Assign positions
      rankedCandidates.forEach((c, i) => { c.position = i + 1; });

      return new Response(JSON.stringify({ success: true, candidates: rankedCandidates }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Recalculate all ranks
    const { data: profiles } = await supabase.from("profiles").select("user_id");
    if (profiles) {
      for (const p of profiles) {
        await calculateUserRank(supabase, p.user_id);
      }
    }

    return new Response(JSON.stringify({ success: true, message: "All ranks recalculated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("calculate-rank error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function calculateUserRank(supabase: any, userId: string, requiredSkills?: string[]) {
  // 1. Skill Score
  const { data: skills } = await supabase.from("skills").select("name, proficiency").eq("user_id", userId);
  let skillScore = 0;
  if (skills?.length) {
    if (requiredSkills?.length) {
      const userSkillNames = skills.map((s: any) => s.name.toLowerCase());
      const matchCount = requiredSkills.filter((rs) => userSkillNames.includes(rs)).length;
      skillScore = (matchCount / requiredSkills.length) * 100;
    } else {
      const avgProficiency = skills.reduce((sum: number, s: any) => sum + (s.proficiency || 50), 0) / skills.length;
      skillScore = Math.min(avgProficiency, 100);
    }
  }

  // 2. Streak Score
  const { data: streaks } = await supabase.from("streaks").select("*").eq("user_id", userId);
  let streakScore = 0;
  if (streaks?.length) {
    const totalStreak = streaks.reduce((sum: number, s: any) => sum + (s.streak_days || 0), 0);
    const totalWeekly = streaks.reduce((sum: number, s: any) => sum + (s.weekly_contributions || 0), 0);
    streakScore = Math.min((totalStreak * 5) + (totalWeekly * 2), 100);
  }

  // 3. Consistency Score (based on active days and streak maintenance)
  let consistencyScore = 0;
  if (streaks?.length) {
    const totalActiveDays = streaks.reduce((sum: number, s: any) => sum + (s.active_days || 0), 0);
    const maxStreak = Math.max(...streaks.map((s: any) => s.streak_days || 0));
    consistencyScore = Math.min((totalActiveDays / 7) * 50 + (maxStreak / 30) * 50, 100);
  }

  // Final Rank = Average of all three scores
  const finalRank = (skillScore + streakScore + consistencyScore) / 3;

  // Upsert into candidate_ranks
  await supabase.from("candidate_ranks").upsert({
    user_id: userId,
    skill_score: Math.round(skillScore * 100) / 100,
    streak_score: Math.round(streakScore * 100) / 100,
    consistency_score: Math.round(consistencyScore * 100) / 100,
    final_rank: Math.round(finalRank * 100) / 100,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });

  return {
    skill_score: Math.round(skillScore * 100) / 100,
    streak_score: Math.round(streakScore * 100) / 100,
    consistency_score: Math.round(consistencyScore * 100) / 100,
    final_rank: Math.round(finalRank * 100) / 100,
  };
}
