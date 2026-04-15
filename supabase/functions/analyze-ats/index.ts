import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { profile, job_requirements } = await req.json();
    if (!profile) {
      return new Response(JSON.stringify({ error: "profile data is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an ATS (Applicant Tracking System) analyzer. Given a candidate profile and optionally job requirements, produce a comprehensive ATS analysis.

Return a structured analysis including:
- Overall ATS score (0-100)
- Summary
- Score breakdown by category
- Profile gaps with severity
- Strengths and weaknesses
- Consistency score
- Recommendations
- Learning roadmap
- If job requirements provided: match_percentage, matched_skills, missing_skills, gap_analysis`;

    const userMessage = job_requirements
      ? `Analyze this candidate profile against the job requirements:\n\nProfile: ${JSON.stringify(profile)}\n\nJob Requirements: ${job_requirements}`
      : `Analyze this candidate profile for general ATS readiness:\n\nProfile: ${JSON.stringify(profile)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        tools: [{
          type: "function",
          function: {
            name: "ats_analysis",
            description: "Return ATS analysis results",
            parameters: {
              type: "object",
              properties: {
                ats_score: { type: "number" },
                summary: { type: "string" },
                profile_summary: {
                  type: "object",
                  properties: {
                    bio: { type: "string" },
                    top_skills: { type: "array", items: { type: "string" } },
                    current_projects: { type: "array", items: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, tech: { type: "array", items: { type: "string" } } } } },
                    certifications: { type: "object", properties: { has_certs: { type: "boolean" }, list: { type: "array", items: { type: "string" } }, summary: { type: "string" } } },
                    experience_highlights: { type: "array", items: { type: "string" } },
                  },
                },
                score_breakdown: { type: "array", items: { type: "object", properties: { category: { type: "string" }, score: { type: "number" }, max: { type: "number" }, detail: { type: "string" } }, required: ["category", "score", "max", "detail"] } },
                profile_gaps: { type: "array", items: { type: "object", properties: { area: { type: "string" }, severity: { type: "string", enum: ["high", "medium", "low"] }, detail: { type: "string" } }, required: ["area", "severity", "detail"] } },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } },
                consistency_score: { type: "number" },
                recommendations: { type: "array", items: { type: "string" } },
                learning_roadmap: { type: "array", items: { type: "string" } },
                match_percentage: { type: "number" },
                matched_skills: { type: "array", items: { type: "string" } },
                missing_skills: { type: "array", items: { type: "string" } },
                gap_analysis: { type: "string" },
              },
              required: ["ats_score", "summary", "score_breakdown", "profile_gaps", "strengths", "weaknesses", "consistency_score", "recommendations", "learning_roadmap"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "ats_analysis" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-ats error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
