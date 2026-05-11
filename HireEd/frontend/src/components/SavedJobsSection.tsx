import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Trash2 } from "lucide-react";

interface SavedJob {
  job_id: number;
  job_title: string;
  company_name?: string;
  salary_min?: number;
  salary_max?: number;
  qualification?: string;
  status?: "saved" | "applied";
}

interface SavedJobsSectionProps {
  jobs: SavedJob[];
  onRemove: (jobId: number) => void;
  onApply?: (jobId: number) => void;
  loading?: boolean;
}

export const SavedJobsSection = ({ jobs, onRemove, onApply, loading }: SavedJobsSectionProps) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading saved jobs...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No saved jobs yet.</p>
        <p className="text-sm text-muted-foreground">
          Browse jobs and tap the bookmark to save them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.job_id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {job.company_name || "Company"}
                  </span>
                </div>
                <CardTitle className="text-lg">{job.job_title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {job.status !== "applied" && onApply && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApply(job.job_id)}
                    className="text-primary hover:bg-primary/10"
                  >
                    Mark applied
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(job.job_id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {job.salary_min != null && job.salary_max != null && (
              <p className="text-sm text-muted-foreground">
                ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
              </p>
            )}
            {job.qualification && (
              <Badge variant="secondary">{job.qualification}</Badge>
            )}
            {job.status && (
              <Badge variant={job.status === "applied" ? "default" : "outline"} className="capitalize">
                {job.status}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
