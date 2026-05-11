import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, CircleCheckBig } from "lucide-react";

interface SavedCourse {
  id: number;
  course_id: number;
  saved_at: string;
  subject: string;
  course_title: string;
  rating?: number;
  level?: string;
}

interface SavedCoursesSectionProps {
  courses: SavedCourse[];
  onRemove: (courseId: number) => void;
  onComplete?: (courseId: number) => void;
  loading?: boolean;
  disableComplete?: boolean;
}

export const SavedCoursesSection = ({
  courses,
  onRemove,
  onComplete,
  loading,
  disableComplete = false,
}: SavedCoursesSectionProps) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading saved courses...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No saved courses yet.</p>
        <p className="text-sm text-muted-foreground">
          Browse courses and click the bookmark icon to save them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <Card key={course.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {course.subject}
                  </span>
                </div>
                <CardTitle className="text-lg">{course.course_title}</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                {course.rating && (
                  <div className="text-right">
                    <div className="text-xl font-bold text-success">
                      {course.rating}/5
                    </div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                )}
                
                {/* Mark Complete Button */}
                {!disableComplete && onComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onComplete(course.course_id)}
                    className="text-primary hover:bg-primary/10"
                  >
                    Complete
                  </Button>
                )}

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(course.course_id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {course.level && (
            <CardContent className="pt-0">
              <Badge variant="secondary">{course.level}</Badge>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
