import Navbar from "@/components/Navbar";
import { Trophy, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUserRank } from "@/hooks/useRanking";
import { useProfile } from "@/hooks/useProfile";

const RankPage = () => {
  const { data: rank, isLoading, refetch, isRefetching } = useUserRank();
  const { skills, projects, certificates } = useProfile();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        {/* Main Rank Card */}
        <div className="bg-card rounded-xl border p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Ranking</h1>
          {isLoading ? (
            <p className="text-muted-foreground">Calculating your rank...</p>
          ) : (
            <>
              <p className="text-5xl font-extrabold text-primary my-4">
                {rank?.final_rank ? `${Math.round(rank.final_rank)}/100` : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">Overall score based on skills, streaks, and consistency</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
                Recalculate
              </Button>
            </>
          )}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              ["Skills", String(skills?.length ?? 0)],
              ["Projects", String(projects?.length ?? 0)],
              ["Certifications", String(certificates?.length ?? 0)],
            ].map(([l, v]) => (
              <div key={l} className="bg-secondary rounded-lg p-3">
                <p className="text-lg font-bold text-foreground">{v}</p>
                <p className="text-xs text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Score Breakdown */}
        {rank && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Skill Score", value: rank.skill_score, description: "Based on number and proficiency of skills" },
                { label: "Streak Score", value: rank.streak_score, description: "Based on platform activity and streaks" },
                { label: "Consistency Score", value: rank.consistency_score, description: "Based on regular activity patterns" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{item.label}</span>
                    <span className="font-bold text-primary">{Math.round(item.value)}/100</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RankPage;
