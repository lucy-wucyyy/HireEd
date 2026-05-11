import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface SavedJob {
  job_id: number;
  job_title: string;
  company_name?: string;
  salary_min?: number;
  salary_max?: number;
  qualification?: string;
  status?: "saved" | "applied";
  date_added?: string;
}

export const useSavedJobs = (userId: string | number | undefined) => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSavedJobs = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/user-jobs/${userId}`);
      const data = await res.json();
      const jobs: SavedJob[] = data.savedJobs || [];
      setSavedJobs(jobs);
      setSavedJobIds(new Set(jobs.map((j) => j.job_id)));
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch saved jobs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveJob = async (jobId: number, status: "saved" | "applied" = "saved") => {
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save jobs.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const res = await fetch("http://localhost:3000/user-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jobId, status }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setSavedJobIds((prev) => new Set([...prev, jobId]));
      toast({
        title: status === "applied" ? "Marked applied" : "Job saved!",
        description: data?.message || undefined,
      });
      fetchSavedJobs();
      return true;
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: "Failed to save job.",
        variant: "destructive",
      });
      return false;
    }
  };

  const applyJob = async (jobId: number) => saveJob(jobId, "applied");

  const removeJob = async (jobId: number) => {
    if (!userId) return false;

    try {
      await fetch("http://localhost:3000/user-jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jobId }),
      });
      setSavedJobIds((prev) => {
        const updated = new Set(prev);
        updated.delete(jobId);
        return updated;
      });
      fetchSavedJobs();
      toast({ title: "Job removed", description: "Removed from your saved jobs." });
      return true;
    } catch (error) {
      console.error("Error removing job:", error);
      toast({
        title: "Error",
        description: "Failed to remove job.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [userId]);

  return {
    savedJobs,
    savedJobIds,
    loading,
    saveJob,
    applyJob,
    removeJob,
    refreshSavedJobs: fetchSavedJobs,
  };
};
