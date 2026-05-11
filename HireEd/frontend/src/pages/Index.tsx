import { useState, useRef, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { SearchSection } from "@/components/SearchSection";
import { ResultsSection } from "@/components/ResultsSection";
import { useSavedCourses } from "@/hooks/useSavedCourses";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { apiMe } from "@/lib/auth";

interface User {
  user_id: number;
  email: string;
  user_name?: string;
  major?: string;
  degree?: string;
  bio?: string;
}

const Index = () => {
  const [resultType, setResultType] = useState<"courses" | "careers" | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch saved courses only when user is available
  const { savedCourseIds, saveCourse, removeCourse } = useSavedCourses(user?.user_id);
  const { savedJobIds, saveJob, removeJob } = useSavedJobs(user?.user_id);

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  useEffect(() => {
    apiMe()
      .then((me) => setUser(me))
      .catch(() => setUser(null));
  }, []);

  const handleCareerSearch = async (career: string) => {
    setSearchQuery(career);

    try {
      const res = await fetch(
        `http://localhost:3000/courses?job_title=${encodeURIComponent(career)}&user_id=${user?.user_id ?? 0}`,
        { credentials: "include" }
      );
      const data = await res.json();

      setCourses(data.courses || []);
      setResultType("courses");
      scrollToResults();
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleCourseSearch = async (selectedCourses: string[]) => {
    setSearchQuery(selectedCourses.join(", "));

    try {
      const res = await fetch(`http://localhost:3000/jobs?career=${encodeURIComponent(selectedCourses.join(","))}`);
      const data = await res.json();

      const mappedCareers = data.map((job: any) => ({
        job_id: job.job_id,
        job_title: job.job_title,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        qualification: job.qualification,
        company_id: job.company_id,
      }));

      setCareers(mappedCareers);
      setResultType("careers");
      scrollToResults();
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleGetStarted = () => {
    document.querySelector('[role="tablist"]')?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero onGetStarted={handleGetStarted} />
      <SearchSection
        onCareerSearch={handleCareerSearch}
        onCourseSearch={handleCourseSearch}
      />
      <div ref={resultsRef}>
        <ResultsSection
          type={resultType}
          courses={courses}
          careers={careers}
          searchQuery={searchQuery}
          savedCourseIds={savedCourseIds}
          onSaveCourse={saveCourse}
          onRemoveCourse={removeCourse}
          savedJobIds={savedJobIds}
          onSaveJob={saveJob}
          onRemoveJob={removeJob}
        />
      </div>
    </div>
  );
};

export default Index;
