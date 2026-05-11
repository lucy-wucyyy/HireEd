
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Briefcase, Telescope } from "lucide-react";

type Job = {
    job_id: number;
    job_title: string;
    company_name: string;
    matching_skills?: number;
    aligned?: number;
    missing?: number;
    missingSkills?: string[];
};

type Props = {
    jobs: Job[];
    loading?: boolean;
    savedJobIds?: Set<number>;
    onSaveJob?: (jobId: number) => void;
    onRemoveJob?: (jobId: number) => void;
};

export const RecommendedJobs = ({
    jobs,
    loading,
    savedJobIds = new Set(),
    onSaveJob,
    onRemoveJob,
}: Props) => {
    if (loading) return <p className="text-sm text-muted-foreground">Loading jobs...</p>;
    const visibleJobs = jobs.filter(job => !savedJobIds.has(job.job_id));

    if (visibleJobs.length === 0) {
    return (
      <div className="text-center py-8">
        <Telescope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No recommendations yet.</p>
        <p className="text-sm text-muted-foreground">
          Complete some courses and come back for personalized job recommendations.
        </p>
      </div>
    );
  }


    const handleSaveToggle = (jobId: number) => {
        if (savedJobIds.has(jobId)) {
            onRemoveJob?.(jobId);
        } else {
            onSaveJob?.(jobId);
        }
    };

    return (
        <div className="space-y-4">
        {visibleJobs.map((job) => (
            <Card key={job.job_id} className="border">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="font-semibold">{job.job_title}</p>
                        <p className="text-sm text-muted-foreground">{job.company_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {typeof job.matching_skills === "number" && (
                            <span className="text-sm text-muted-foreground">
                            {job.matching_skills} matching skills
                            </span>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveToggle(job.job_id)}
                            className={savedJobIds.has(job.job_id) ? "text-primary" : "text-muted-foreground hover:text-primary"}
                        >
                            {savedJobIds.has(job.job_id) ? (
                                <BookmarkCheck className="h-5 w-5" />
                            ) : (
                                <Bookmark className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>
                {(job.aligned || job.missing) && (
                <p className="text-sm text-muted-foreground mt-2">
                    {job.aligned || 0} aligned • {job.missing || 0} missing
                    {job.missingSkills?.length ? ` • Missing: ${job.missingSkills.join(", ")}` : ""}
                </p>
                )}
            </CardContent>
            </Card>
        ))}
        </div>
    );
};
