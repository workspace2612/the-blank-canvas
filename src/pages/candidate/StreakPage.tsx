import Navbar from "@/components/Navbar";
import { Flame, Github, Code2, BarChart3, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStreakData } from "@/hooks/useStreakData";

const StreakPage = () => {
  const { data, isLoading, refetch, isRefetching } = useStreakData();

  const githubStreak = data?.github?.streak ?? 0;
  const leetcodeStreak = data?.leetcode?.streak ?? 0;
  const maxStreak = Math.max(githubStreak, leetcodeStreak);

  // Build last 30 days visualization from github data
  const streakDays = Array.from({ length: 30 }, (_, i) => {
    // Simple visualization based on streak length
    if (i < maxStreak) return 1;
    return 0;
  }).reverse();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        {/* Main Streak Card */}
        <div className="bg-card rounded-xl border p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <Flame className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Activity Streak</h1>
          {isLoading ? (
            <p className="text-muted-foreground">Loading streak data...</p>
          ) : (
            <>
              <p className="text-5xl font-extrabold text-destructive my-4">{maxStreak} Days</p>
              <p className="text-sm text-muted-foreground mb-6">Your current consecutive active days</p>
              <div className="grid grid-cols-10 gap-1.5 max-w-xs mx-auto">
                {streakDays.map((active, i) => (
                  <div key={i} className={`w-5 h-5 rounded ${active ? "bg-green-500" : "bg-muted"}`} title={`Day ${i + 1}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Last 30 days</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
            </>
          )}
        </div>

        {/* Platform Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Github className="h-4 w-4" /> GitHub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-semibold">{data?.github?.today_commits ?? 0} commits</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-semibold">{data?.github?.weekly_commits ?? 0} commits</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Days</span>
                  <span className="font-semibold">{data?.github?.active_days ?? 0}/7</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Streak</span>
                  <span className="font-bold text-primary">{data?.github?.streak ?? 0} days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Code2 className="h-4 w-4" /> LeetCode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-semibold">{data?.leetcode?.today_solved ?? 0} solved</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-semibold">{data?.leetcode?.weekly_solved ?? 0} solved</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Streak</span>
                  <span className="font-bold text-primary">{data?.leetcode?.streak ?? 0} days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Kaggle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{data?.kaggle?.note || "Kaggle integration pending — no public API available"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StreakPage;
