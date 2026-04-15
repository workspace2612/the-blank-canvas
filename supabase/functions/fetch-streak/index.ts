import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function offsetDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function calcStreak(dailyMap: Record<string, number>): number {
  let streak = 0;
  let i = 0;
  while (true) {
    const date = offsetDate(i);
    if ((dailyMap[date] || 0) > 0) {
      streak++;
      i++;
    } else if (i === 0) {
      i++;
    } else {
      break;
    }
  }
  return streak;
}

function calcWeeklyTotal(dailyMap: Record<string, number>): number {
  let total = 0;
  for (let i = 0; i < 7; i++) {
    total += dailyMap[offsetDate(i)] || 0;
  }
  return total;
}

function calcActiveDays(dailyMap: Record<string, number>, n = 7): number {
  let active = 0;
  for (let i = 0; i < n; i++) {
    if ((dailyMap[offsetDate(i)] || 0) > 0) active++;
  }
  return active;
}

async function fetchGitHub(username: string) {
  try {
    const resp = await fetch(`https://api.github.com/users/${username}/events`, {
      headers: { "User-Agent": "lovable-streak-extractor" },
    });
    if (!resp.ok) throw new Error(`GitHub API error: ${resp.status}`);
    const events = await resp.json();

    const dailyMap: Record<string, number> = {};
    for (const event of events) {
      if (event.type !== "PushEvent") continue;
      const date = event.created_at.slice(0, 10);
      const count = event.payload?.commits?.length || 0;
      dailyMap[date] = (dailyMap[date] || 0) + count;
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    return {
      today_commits: dailyMap[todayKey] || 0,
      weekly_commits: calcWeeklyTotal(dailyMap),
      active_days: calcActiveDays(dailyMap, 7),
      streak: calcStreak(dailyMap),
    };
  } catch (e) {
    console.error("GitHub fetch error:", e);
    return { today_commits: 0, weekly_commits: 0, active_days: 0, streak: 0 };
  }
}

async function fetchLeetCode(username: string) {
  try {
    const query = `
      query userProfileCalendar($username: String!) {
        matchedUser(username: $username) {
          userCalendar { submissionCalendar }
          submitStats: submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
        }
      }
    `;
    const resp = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { username } }),
    });
    if (!resp.ok) throw new Error(`LeetCode API error: ${resp.status}`);
    const data = await resp.json();

    const rawCalendar = data?.data?.matchedUser?.userCalendar?.submissionCalendar;
    const calendar = JSON.parse(rawCalendar || "{}");

    const dailyMap: Record<string, number> = {};
    for (const [ts, count] of Object.entries(calendar)) {
      const date = new Date(Number(ts) * 1000).toISOString().slice(0, 10);
      dailyMap[date] = (dailyMap[date] || 0) + (count as number);
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    return {
      today_solved: dailyMap[todayKey] || 0,
      weekly_solved: calcWeeklyTotal(dailyMap),
      streak: calcStreak(dailyMap),
    };
  } catch (e) {
    console.error("LeetCode fetch error:", e);
    return { today_solved: 0, weekly_solved: 0, streak: 0 };
  }
}

function extractUsername(url: string): string {
  if (!url) return "";
  return url.replace(/\/$/, "").split("/").pop() || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { github_url, leetcode_url, kaggle_url } = await req.json();

    const githubUser = extractUsername(github_url || "");
    const leetcodeUser = extractUsername(leetcode_url || "");

    const [github, leetcode] = await Promise.all([
      githubUser ? fetchGitHub(githubUser) : Promise.resolve({ today_commits: 0, weekly_commits: 0, active_days: 0, streak: 0 }),
      leetcodeUser ? fetchLeetCode(leetcodeUser) : Promise.resolve({ today_solved: 0, weekly_solved: 0, streak: 0 }),
    ]);

    const kaggle = {
      weekly_activity: 0,
      last_active_days_ago: null as number | null,
      note: "Kaggle integration pending — no public API available",
    };

    return new Response(JSON.stringify({ success: true, data: { github, leetcode, kaggle } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-streak error:", e);
    return new Response(JSON.stringify({ success: false, message: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
