// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { BookOpen, TrendingUp, CheckCircle2 } from "lucide-react";

// interface Course {
//   id: string;
//   name: string;
//   code: string;
//   matchPercentage: number;
//   skills: string[];
// }

// interface Career {
//   id: string;
//   title: string;
//   matchPercentage: number;
//   matchedSkills: string[];
//   missingSkills: string[];
// }

// interface ResultsSectionProps {
//   type: "courses" | "careers" | null;
//   courses?: Course[];
//   careers?: Career[];
//   searchQuery: string;
// }

// export const ResultsSection = ({ type, courses, careers, searchQuery }: ResultsSectionProps) => {
//   if (!type) return null;

//   return (
//     <section className="py-12 bg-background">
//       <div className="container mx-auto px-4">
//         <div className="max-w-5xl mx-auto">
//           <div className="mb-8">
//             <h2 className="text-3xl font-bold mb-2">
//               {type === "courses" ? "Recommended Courses" : "Matching Careers"}
//             </h2>
//             <p className="text-muted-foreground">
//               {type === "courses"
//                 ? `Top courses to prepare for: ${searchQuery}`
//                 : `Careers matching your coursework`}
//             </p>
//           </div>

//           {type === "courses" && courses && (
//             <div className="space-y-4">
//               {courses.map((course) => (
//                 <Card key={course.id} className="hover:shadow-lg transition-shadow">
//                   <CardHeader>
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-2">
//                           <BookOpen className="h-5 w-5 text-primary" />
//                           <span className="text-sm font-medium text-muted-foreground">
//                             {course.code}
//                           </span>
//                         </div>
//                         <CardTitle className="text-xl">{course.name}</CardTitle>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-2xl font-bold text-success">
//                           {course.matchPercentage}%
//                         </div>
//                         <div className="text-xs text-muted-foreground">Match</div>
//                       </div>
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="mb-3">
//                       <Progress value={course.matchPercentage} className="h-2" />
//                     </div>
//                     {course.skills && course.skills.length > 0 && (
//                       <div>
//                         <p className="text-sm font-medium mb-2">Relevant Skills:</p>
//                         <div className="flex flex-wrap gap-2">
//                           {course.skills.map((skill: string) => (
//                             <Badge key={skill} variant="secondary">
//                               {skill}
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}

//           {type === "careers" && careers && (
//             <div className="space-y-4">
//               {careers.map((career) => (
//                 <Card key={career.id} className="hover:shadow-lg transition-shadow">
//                   <CardHeader>
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-2">
//                           <TrendingUp className="h-5 w-5 text-primary" />
//                           <span className="text-sm font-medium text-muted-foreground">
//                             Career Match
//                           </span>
//                         </div>
//                         <CardTitle className="text-xl">{career.title}</CardTitle>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-2xl font-bold text-success">
//                           {career.matchPercentage}%
//                         </div>
//                         <div className="text-xs text-muted-foreground">Match</div>
//                       </div>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="mb-3">
//                       <Progress value={career.matchPercentage} className="h-2" />
//                     </div>

//                     {career.matchedSkills && career.matchedSkills.length > 0 && (
//                       <div>
//                         <div className="flex items-center gap-2 mb-2">
//                           <CheckCircle2 className="h-4 w-4 text-success" />
//                           <p className="text-sm font-medium">Your Matching Skills:</p>
//                         </div>
//                         <div className="flex flex-wrap gap-2">
//                           {career.matchedSkills.map((skill: string) => (
//                             <Badge key={skill} className="bg-success/10 text-success hover:bg-success/20">
//                               {skill}
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {career.missingSkills && career.missingSkills.length > 0 && (
//                       <div>
//                         <p className="text-sm font-medium mb-2 text-muted-foreground">
//                           Skills to Develop:
//                         </p>
//                         <div className="flex flex-wrap gap-2">
//                           {career.missingSkills.map((skill: string) => (
//                             <Badge key={skill} variant="outline">
//                               {skill}
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Bookmark, BookmarkCheck } from "lucide-react";

interface Course {
  course_id?: number;
  subject: string;
  course_title: string;
  rating: number;
  level: string;
  inst_id?: number;
}

interface Career {
  job_id?: number;
  job_title: string;
  qualification: string;
  salary_min: number;
  salary_max: number;
  company_id?: number;
}

interface ResultsSectionProps {
  type: "courses" | "careers" | null;
  courses?: Course[];
  careers?: Career[];
  searchQuery: string;
  savedCourseIds?: Set<number>;
  onSaveCourse?: (courseId: number) => void;
  onRemoveCourse?: (courseId: number) => void;
  savedJobIds?: Set<number>;
  onSaveJob?: (jobId: number) => void;
  onRemoveJob?: (jobId: number) => void;
}

const ratingClass = (rating: number) => {
  if (rating == null) return "";
  if (rating < 4) return "text-red-500";
  if (rating < 4.5) return "text-yellow-500";
  return "text-green-500";
};

const levelClass = (level: string) => {
  if (!level) return "";
  switch (level) {
    case "Beginner":
      return "bg-green-400 text-white hover:bg-green-500";
    case "Intermediate":
      return "bg-teal-400 text-white hover:bg-teal-500";
    case "Mixed":
      return "bg-blue-500 text-white hover:bg-blue-600";
    case "Advanced":
      return "bg-red-400 text-white hover:bg-red-500";
    default:
      return "bg-gray-200 text-black hover:bg-gray-300";
  }
};

const qualificationJob = (qualification: string) => {
  if (!qualification) return "";
  switch (qualification) {
    case "BA":
      return "bg-pink-300 text-white hover:bg-green-400";
    case "B.Com":
      return "bg-purple-300 text-white hover:bg-green-400";
    case "M.Com":
      return "bg-purple-400 text-white hover:bg-green-500";
    case "BBA":
      return "bg-green-300 text-white hover:bg-green-400";
    case "MBA":
      return "bg-green-400 text-white hover:bg-green-500";
    case "B.Tech":
      return "bg-teal-300 text-white hover:bg-teal-400";
    case "M.Tech":
      return "bg-teal-400 text-white hover:bg-teal-500";
    case "BCA":
      return "bg-blue-400 text-white hover:bg-blue-500";
    case "MCA":
      return "bg-blue-500 text-white hover:bg-blue-600";
    case "PhD":
      return "bg-red-400 text-white hover:bg-red-500";
    default:
      return "bg-gray-200 text-black hover:bg-gray-300";
  }
};

export const ResultsSection = ({
  type,
  courses,
  careers,
  searchQuery,
  savedCourseIds = new Set(),
  onSaveCourse,
  onRemoveCourse,
  savedJobIds = new Set(),
  onSaveJob,
  onRemoveJob,
}: ResultsSectionProps) => {
  if (!type) return null;

  const handleSaveToggle = (courseId: number) => {
    if (savedCourseIds.has(courseId)) {
      onRemoveCourse?.(courseId);
    } else {
      onSaveCourse?.(courseId);
    }
  };

  const handleJobSaveToggle = (jobId: number) => {
    if (savedJobIds.has(jobId)) {
      onRemoveJob?.(jobId);
    } else {
      onSaveJob?.(jobId);
    }
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {type === "courses" ? "Recommended Courses" : "Matching Careers"}
            </h2>
            <p className="text-muted-foreground">
              {type === "courses"
                ? `Top courses to prepare for: ${searchQuery}`
                : `Careers matching your coursework`}
            </p>
          </div>

          {type === "courses" && courses && (
            <div className="space-y-4">
              {courses.map((course, index) => {
                const courseId = course.course_id || index;
                const isSaved = savedCourseIds.has(courseId);

                return (
                  <Card
                    key={courseId}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-muted-foreground">
                              {course.subject}
                            </span>
                          </div>
                          <CardTitle className="text-xl">
                            {course.course_title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            {course.rating && (
                              <>
                                <div
                                  className={`text-2xl font-bold ${ratingClass(
                                    course.rating
                                  )} w-9 text-center inline-block`}
                                >
                                  {course.rating}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Rating
                                </div>
                              </>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveToggle(courseId)}
                            className={isSaved ? "text-primary" : "text-muted-foreground hover:text-primary"}
                          >
                            {isSaved ? (
                              <BookmarkCheck className="h-5 w-5" />
                            ) : (
                              <Bookmark className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {course.level && (
                        <div className="flex items-center gap-2">
                          <Badge className={levelClass(course.level)}>
                            {course.level}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {type === "careers" && careers && (
            <div className="space-y-4">
              {careers.map((career, index) => {
                const jobId = career.job_id || index;
                const isSavedJob = savedJobIds.has(jobId);

                return (
                  <Card
                    key={jobId}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Career Opportunity
                            </span>
                          </div>
                          <CardTitle className="text-xl">
                            {career.job_title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                          {career.salary_min && career.salary_max && (
                            <div className="text-right">
                              <div className="text-xl font-bold text-teal-500">
                                ${career.salary_min.toLocaleString()} - $
                                {career.salary_max.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Salary Range
                              </div>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleJobSaveToggle(jobId)}
                            className={isSavedJob ? "text-primary" : "text-muted-foreground hover:text-primary"}
                          >
                            {isSavedJob ? (
                              <BookmarkCheck className="h-5 w-5" />
                            ) : (
                              <Bookmark className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {career.qualification && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Required Qualification:
                          </p>
                          <Badge className={qualificationJob(career.qualification)}>
                            {career.qualification}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
