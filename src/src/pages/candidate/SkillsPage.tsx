import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Trash2, Plus } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const SkillsPage = () => {
  const { user } = useAuth();
  const { skills, refetch } = useProfile();
  const [newSkill, setNewSkill] = useState("");
  const [adding, setAdding] = useState(false);

  const addSkill = async () => {
    if (!newSkill.trim() || !user) return;
    setAdding(true);
    try {
      const { error } = await supabase.from("skills").upsert({
        user_id: user.id,
        name: newSkill.trim(),
      }, { onConflict: "user_id,name" });
      if (error) throw error;
      setNewSkill("");
      refetch();
      toast.success("Skill added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add skill");
    } finally {
      setAdding(false);
    }
  };

  const removeSkill = async (id: string) => {
    try {
      await supabase.from("skills").delete().eq("id", id);
      refetch();
      toast.success("Skill removed");
    } catch {
      toast.error("Failed to remove skill");
    }
  };

  // Group skills by category
  const grouped = skills.reduce((acc: Record<string, typeof skills>, skill) => {
    const cat = (skill as any).category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Skill Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your skills are AI-extracted from certificates, projects, and GitHub repos.
            </p>
          </div>
          <Link to="/" className="rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary transition">
            Back to Dashboard
          </Link>
        </div>

        {/* Add skill manually */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a Skill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. React, Python, Docker..."
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
              />
              <Button onClick={addSkill} disabled={adding || !newSkill.trim()} className="gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Tip: Skills are also auto-extracted when you add projects or certificates. Go to{" "}
              <Link to="/projects" className="text-primary underline">Projects</Link> to extract skills with AI.
            </p>
          </CardContent>
        </Card>

        {/* Skills display */}
        {skills.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No skills yet. Add projects or certificates to auto-extract skills with AI.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Skills ({skills.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <div key={skill.id} className="group flex items-center gap-1 bg-secondary rounded-full pl-3 pr-1 py-1">
                      <span className="text-sm text-foreground">{skill.name}</span>
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {Object.keys(grouped).length > 1 && Object.entries(grouped).map(([category, catSkills]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-sm capitalize">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {catSkills.map((skill) => (
                      <Badge key={skill.id} variant="outline">{skill.name}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsPage;
