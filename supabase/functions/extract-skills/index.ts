import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { content, source_type } = await req.json();
    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "content is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a skill extraction AI. Analyze the given text and extract technical skills.
Classify each skill into one of: language, framework, tool, database, concept.
Estimate proficiency as a percentage (0-100) based on context depth.
Detect whether the input is from a certificate, project description, or GitHub README.

Return a JSON object with this exact structure:
{
  "detected_type": "certificate" | "project" | "github",
  "skills": [{ "name": "SkillName", "category": "language|framework|tool|database|concept", "percentage": 75 }],
  "summary": "Brief summary of what was analyzed",
  "key_concepts": ["concept1", "concept2"],
  "complexity_level": "beginner" | "intermediate" | "advanced"
}`;

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
          { role: "user", content: `Analyze and extract skills from this ${source_type || "text"}:\n\n${content}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_skills",
            description: "Extract skills from text content",
            parameters: {
              type: "object",
              properties: {
                detected_type: { type: "string", enum: ["certificate", "project", "github"] },
                skills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      category: { type: "string", enum: ["language", "framework", "tool", "database", "concept"] },
                      percentage: { type: "number" },
                    },
                    required: ["name", "category", "percentage"],
                  },
                },
                summary: { type: "string" },
                key_concepts: { type: "array", items: { type: "string" } },
                complexity_level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
              },
              required: ["detected_type", "skills", "summary", "key_concepts", "complexity_level"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_skills" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const extracted = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-skills error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
