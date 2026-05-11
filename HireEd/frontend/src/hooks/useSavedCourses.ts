import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface SavedCourse {
  id: number;
  course_id: number;
  saved_at: string;
  subject: string;
  course_title: string;
  rating?: number;
  level?: string;
  status?: "saved" | "completed";
}

export const useSavedCourses = (userId: string | number | undefined) => {
  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>([]);
  const [completedCourses, setCompletedCourses] = useState<SavedCourse[]>([]);
  const [savedCourseIds, setSavedCourseIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSavedCourses = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/user-courses/${userId}`);
      const data = await res.json();
      const courses: SavedCourse[] = data.savedCourses || [];

      setSavedCourses(courses.filter(c => c.status === "saved"));
      setCompletedCourses(courses.filter(c => c.status === "completed"));
      setSavedCourseIds(new Set(courses.filter(c => c.status === "saved").map(c => c.course_id)));
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCourse = async (courseId: number) => {
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save courses.",
        variant: "destructive",
      });
      return false;
    }

    try {
      await fetch("http://localhost:3000/user-courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, courseId }),
      });

      setSavedCourseIds(prev => new Set([...prev, courseId]));
      toast({ title: "Course saved!", description: "Added to your saved courses." });
      fetchSavedCourses();
      return true;
    } catch (error) {
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: "Failed to save course.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeCourse = async (courseId: number) => {
    if (!userId) return false;

    try {
      await fetch("http://localhost:3000/user-courses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, courseId }),
      });

      fetchSavedCourses();
      toast({ title: "Course removed", description: "Removed from your courses." });
      return true;
    } catch (error) {
      console.error("Error removing course:", error);
      toast({
        title: "Error",
        description: "Failed to remove course.",
        variant: "destructive",
      });
      return false;
    }
  };

  // const completeCourse = async (courseId: number) => {
  //   if (!userId) return false;

  //   try {
  //     const res = await fetch(`http://localhost:3000/user-courses/completed`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ userId, courseId }),
  //     });

  //     if (!res.ok) throw new Error("Failed to mark as completed");

  //     fetchSavedCourses();
  //     toast({ title: "Completed!", description: "Course marked as completed." });
  //     return true;
  //   } catch (err) {
  //     console.error(err);
  //     toast({
  //       title: "Error",
  //       description: "Could not mark course completed.",
  //       variant: "destructive",
  //     });
  //     return false;
  //   }
  // };

  useEffect(() => {
    fetchSavedCourses();
  }, [userId]);

  return {
    savedCourses,
    completedCourses,
    savedCourseIds,
    loading,
    saveCourse,
    removeCourse,
    refreshSavedCourses: fetchSavedCourses,
  };
};
