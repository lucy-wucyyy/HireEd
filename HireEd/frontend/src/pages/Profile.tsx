import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSavedCourses } from "@/hooks/useSavedCourses";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { SavedCoursesSection } from "@/components/SavedCoursesSection";
import { apiMe, apiSignOut } from "@/lib/auth";
import { RecommendedJobs } from "@/components/RecommendedJobs";
import { SavedJobsSection } from "@/components/SavedJobsSection";

type AppUser = {
  user_id: number;
  email: string;
  user_name?: string;
  major?: string;
  degree?: string;
  bio?: string;
};

const Profile = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [major, setMajor] = useState("");
  const [degree, setDegree] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    savedCourses,
    completedCourses,
    loading: loadingSavedCourses,
    removeCourse,
    refreshSavedCourses,
  } = useSavedCourses(user?.user_id);
  const {
    savedJobs,
    savedJobIds,
    loading: loadingSavedJobs,
    saveJob,
    applyJob,
    removeJob,
    refreshSavedJobs,
  } = useSavedJobs(user?.user_id);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const me = await apiMe();
        setUser(me);
        setFullName(me.user_name || "");
        setBio(me.bio || "");
        setMajor(me.major || "");
        setDegree(me.degree || "");
      } catch (err) {
        navigate("/auth");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: user.user_id,
          user_name: fullName,
          major,
          degree,
          bio,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: user.user_id }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({
        title: "Account deleted",
        description: "Your profile has been removed.",
      });
      await apiSignOut();
      navigate("/");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await apiSignOut();
    navigate("/");
  };

  const handleRemoveCourse = async (courseId: number) => {
    await removeCourse(courseId);
    refreshSavedCourses();
  };

  const handleSaveJob = async (jobId: number) => {
    await saveJob(jobId);
    refreshSavedJobs();
  };

  const handleApplyJob = async (jobId: number) => {
    await applyJob(jobId);
    refreshSavedJobs();
  };

  const handleRemoveJob = async (jobId: number) => {
    await removeJob(jobId);
    refreshSavedJobs();
    // Re-fetch recommendations so removed jobs can reappear if applicable
    await fetchRecommendedJobs();
  };

  const handleToggleCourse = async (course_id: number) => {
    if (!user) return;
    try {
      await fetch("http://localhost:3000/jobs/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({user_id: user.user_id, course_id: course_id })
      });
      await refreshSavedCourses();
      await fetchRecommendedJobs();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };


  const fetchRecommendedJobs = async (course_id: number = 0) => {
    if (!user) return;
    setLoadingJobs(true);

    try {
      const res = await fetch("http://localhost:3000/jobs/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          user_id: user.user_id, 
          course_id: course_id 
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json(); // { skillAlignment, topJobs }
      const { skillAlignment = [], topJobs = [] } = data;

      const grouped = skillAlignment.reduce((acc: any, row: any) => {
        if (!acc[row.job_id]) acc[row.job_id] = { aligned: 0, missing: 0, missingSkills: [] };
        if (row.skill_status === "aligned") acc[row.job_id].aligned += 1;
        else acc[row.job_id].missing += 1;
        if (row.skill_status === "missing" && acc[row.job_id].missingSkills.length < 3) {
          acc[row.job_id].missingSkills.push(row.skill_name);
        }
        return acc;
      }, {});

      const merged = topJobs.map((job: any) => ({
        ...job,
        aligned: grouped[job.job_id]?.aligned || 0,
        missing: grouped[job.job_id]?.missing || 0,
        missingSkills: grouped[job.job_id]?.missingSkills || [],
      }));

      setJobs(merged);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecommendedJobs(); // defaults to course_id = 0
    }
  }, [user]);

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1
            onClick={() => navigate("/")}
            className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent cursor-pointer"
          >
            HireEd
          </h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Manage your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  type="text"
                  placeholder="Enter your major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  type="text"
                  placeholder="Enter your degree (e.g., Bachelor's, Master's)"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={handleDeleteProfile}
                disabled={loading}
              >
                Delete Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Courses</CardTitle>
            <CardDescription>
              Courses you've bookmarked for later
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SavedCoursesSection
              courses={savedCourses}
              onRemove={handleRemoveCourse}
              onComplete={handleToggleCourse}
              loading={loadingSavedCourses}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Courses</CardTitle>
            <CardDescription>Courses you've completed</CardDescription>
          </CardHeader>
          <CardContent>
            <SavedCoursesSection
              courses={completedCourses}
              onRemove={handleRemoveCourse}
              loading={loadingSavedCourses}
              disableComplete
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Jobs</CardTitle>
            <CardDescription>
              Job recommendations based on your completed courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecommendedJobs
              jobs={jobs}
              loading={loadingJobs}
              savedJobIds={savedJobIds}
              onSaveJob={handleSaveJob}
              onRemoveJob={handleRemoveJob}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Jobs</CardTitle>
            <CardDescription>Jobs you've bookmarked</CardDescription>
          </CardHeader>
          <CardContent>
            <SavedJobsSection
              jobs={savedJobs}
              onRemove={handleRemoveJob}
              onApply={handleApplyJob}
              loading={loadingSavedJobs}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
