import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Code2, BarChart3, RefreshCw, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const AddPlatformPage = () => {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || "");
  const [leetcodeUrl, setLeetcodeUrl] = useState(profile?.leetcode_url || "");
  const [kaggleUrl, setKaggleUrl] = useState(profile?.kaggle_url || "");
  const [saving, setSaving] = useState(false);

  // Update state when profile loads
  useState(() => {
    if (profile) {
      setGithubUrl(profile.github_url || "");
      setLeetcodeUrl(profile.leetcode_url || "");
      setKaggleUrl(profile.kaggle_url || "");
    }
  });

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          github_url: githubUrl || null,
          leetcode_url: leetcodeUrl || null,
          kaggle_url: kaggleUrl || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Trigger streak extraction after saving profiles
      if (githubUrl || leetcodeUrl || kaggleUrl) {
        toast.success("Profiles saved! Fetching streak data...");
        supabase.functions.invoke("fetch-streak", {
          body: { github_url: githubUrl, leetcode_url: leetcodeUrl, kaggle_url: kaggleUrl },
        }).then(({ data }) => {
          if (data?.success) {
            // Store streak data
            const updates = [];
            if (data.data.github && githubUrl) {
              updates.push(supabase.from("streaks").upsert({
                user_id: user.id,
                platform: "github",
                streak_days: data.data.github.streak,
                weekly_contributions: data.data.github.weekly_commits,
                today_contributions: data.data.github.today_commits,
                active_days: data.data.github.active_days,
                total_contributions: data.data.github.weekly_commits,
                last_fetched_at: new Date().toISOString(),
                raw_data: data.data.github,
              }, { onConflict: "user_id,platform" }));
            }
            if (data.data.leetcode && leetcodeUrl) {
              updates.push(supabase.from("streaks").upsert({
                user_id: user.id,
                platform: "leetcode",
                streak_days: data.data.leetcode.streak,
                weekly_contributions: data.data.leetcode.weekly_solved,
                today_contributions: data.data.leetcode.today_solved,
                active_days: 0,
                total_contributions: data.data.leetcode.weekly_solved,
                last_fetched_at: new Date().toISOString(),
                raw_data: data.data.leetcode,
              }, { onConflict: "user_id,platform" }));
            }
            Promise.all(updates).then(() => {
              toast.success("Streak data updated!");
              // Trigger rank recalculation
              supabase.functions.invoke("calculate-rank", { body: { user_id: user.id } }).catch(console.error);
            });
          }
        }).catch(console.error);
      } else {
        toast.success("Profiles saved!");
      }

      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profiles");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Connect Your Platforms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Link your developer profiles to track streaks and improve your ranking.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Github className="h-5 w-5" /> GitHub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="github">Profile URL</Label>
            <Input
              id="github"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="mt-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code2 className="h-5 w-5" /> LeetCode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="leetcode">Profile URL</Label>
            <Input
              id="leetcode"
              value={leetcodeUrl}
              onChange={(e) => setLeetcodeUrl(e.target.value)}
              placeholder="https://leetcode.com/username"
              className="mt-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Kaggle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="kaggle">Profile URL</Label>
            <Input
              id="kaggle"
              value={kaggleUrl}
              onChange={(e) => setKaggleUrl(e.target.value)}
              placeholder="https://kaggle.com/username"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Kaggle integration is pending — no public API available yet.</p>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save & Extract Streaks"}
        </Button>
      </div>
    </div>
  );
};

export default AddPlatformPage;
