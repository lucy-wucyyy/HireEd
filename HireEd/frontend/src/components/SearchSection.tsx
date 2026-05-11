import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchSectionProps {
  onCareerSearch: (career: string) => void;
  onCourseSearch: (courses: string[]) => void;
}

export const SearchSection = ({ onCareerSearch, onCourseSearch }: SearchSectionProps) => {
  const [careerInput, setCareerInput] = useState("");
  const [courseInput, setCourseInput] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const handleCareerSearch = async () => {
    if (!careerInput.trim()) return;

    try {
      const res = await fetch (`http://localhost:3000/jobs?career=${encodeURIComponent(careerInput)}`);
      const data = await res.json();
      onCareerSearch(careerInput);
    } catch (err) {
      console.error("error:", err);
    }
  };

  const handleAddCourse = () => {
    if (courseInput.trim() && !selectedCourses.includes(courseInput.trim())) {
      setSelectedCourses([...selectedCourses, courseInput.trim()]);
      setCourseInput("");
    }
  };

  const handleRemoveCourse = (course: string) => {
    setSelectedCourses(selectedCourses.filter(c => c !== course));
  };

  const handleCourseSearch = () => {
    if (selectedCourses.length > 0) {
      onCourseSearch(selectedCourses);
    }
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="career" className="max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="career" className="gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Career to Courses
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <GraduationCap className="h-4 w-4 text-secondary" />
              Courses to Career
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="career" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 shadow-lg border">
              <h3 className="text-xl font-semibold mb-4">Find Courses for Your Dream Career</h3>
              <p className="text-muted-foreground mb-4">
                Enter a job title to see which courses will help you develop the most in-demand skills.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Data Scientist, UX Designer, Software Engineer"
                  value={careerInput}
                  onChange={(e) => setCareerInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCareerSearch()}
                  className="flex-1"
                />
                <Button onClick={handleCareerSearch} className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="courses" className="space-y-4">
            <div className="bg-card rounded-2xl p-6 shadow-lg border">
              <h3 className="text-xl font-semibold mb-4">Discover Careers Based on Your Courses</h3>
              <p className="text-muted-foreground mb-4">
                Add courses you've completed to see matching careers and identify skill gaps.
              </p>
              
              {selectedCourses.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCourses.map((course) => (
                    <Badge key={course} variant="secondary" className="gap-1">
                      {course}
                      <button
                        onClick={() => handleRemoveCourse(course)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Introduction to Python, Data Structures"
                    value={courseInput}
                    onChange={(e) => setCourseInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCourse()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddCourse} variant="outline">
                    Add Course
                  </Button>
                </div>
                <Button 
                  onClick={handleCourseSearch} 
                  disabled={selectedCourses.length === 0}
                  className="w-full gap-2"
                >
                  <Search className="h-4 w-4" />
                  Find Matching Careers
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
