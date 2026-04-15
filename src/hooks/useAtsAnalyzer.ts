import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "./useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ATSResult {
  ats_score: number;
  summary: string;
  profile_summary: {
    bio: string;
    top_skills: string[];
    current_projects: Array<{ name: string; description: string; tech: string[] }>;
    certifications: { has_certs: boolean; list: string[]; summary: string };
    experience_highlights: string[];
  };
  score_breakdown: Array<{ category: string; score: number; max: number; detail: string }>;
  profile_gaps: Array<{ area: string; severity: "high" | "medium" | "low"; detail: string }>;
  strengths: string[];
  weaknesses: string[];
  consistency_score: number;
  recommendations: string[];
  learning_roadmap: string[];
  match_percentage?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  gap_analysis?: string;
}

export function useAtsAnalyzer() {
  const { user } = useAuth();
  const { profile, skills, experience, projects, education, certificates } = useProfile(user?.id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const analyzeProfile = async (jobRequirements?: string) => {
    if (!profile) {
      toast.error("Please complete your profile first");
      return null;
    }

    setLoading(true);
    try {
      const profileData = {
        full_name: profile.full_name,
        bio: profile.bio,
        about: profile.about,
        github_url: profile.github_url,
        leetcode_url: profile.leetcode_url,
        kaggle_url: profile.kaggle_url,
        location: profile.location,
        skills: skills.map((s) => s.name),
        experience: experience.map((e) => ({
          company: e.company,
          role: e.role,
          duration: `${e.start_date || ""} - ${e.end_date || "Present"}`,
          description: e.description,
        })),
        projects: projects.map((p) => ({
          title: p.title,
          description: p.description,
          tech_stack: p.tech_stack,
        })),
        education: education.map((e) => ({
          school: e.school,
          degree: e.degree,
          field: e.field_of_study,
        })),
        certificates: certificates?.map((c) => c.title) || [],
      };

      const { data, error } = await supabase.functions.invoke("analyze-ats", {
        body: { profile: profileData, job_requirements: jobRequirements },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast.error("Rate limit exceeded. Please wait and try again.");
          throw new Error("Rate limit exceeded");
        }
        if (error.message?.includes("402")) {
          toast.error("AI credits exhausted. Please add funds in Settings > Workspace > Usage.");
          throw new Error("Credits exhausted");
        }
        throw error;
      }

      if (data?.error) throw new Error(data.error);

      // Ensure profile_summary exists with defaults
      const atsResult: ATSResult = {
        ...data,
        profile_summary: data.profile_summary || {
          bio: profile.bio || "",
          top_skills: skills.slice(0, 6).map((s) => s.name),
          current_projects: [],
          certifications: { has_certs: false, list: [], summary: "" },
          experience_highlights: [],
        },
      };

      setResult(atsResult);
      return atsResult;
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze profile");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeProfile, result, loading };
}
