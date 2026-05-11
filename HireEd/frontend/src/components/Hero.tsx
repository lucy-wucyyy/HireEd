import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, ArrowRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiMe } from "@/lib/auth";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    apiMe()
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-20 pb-16">
      <div className="absolute top-4 right-4">
        {isLoggedIn ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/profile")}
            className="gap-2"
          >
            <User className="w-4 h-4" />
            Profile
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
        )}
      </div>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <GraduationCap className="h-4 w-4" />
            <span>Bridge Education to Career</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Find Your Path from Classroom to Career
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect your academic journey with your dream career. Get personalized course recommendations 
            based on labor market skills, or discover which careers align with your completed coursework.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={onGetStarted} className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl p-6 shadow-lg border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Career to Courses</h3>
              <p className="text-muted-foreground">
                Enter your dream job and discover the courses that will equip you with in-demand skills.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl p-6 shadow-lg border">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Courses to Career</h3>
              <p className="text-muted-foreground">
                Input your completed courses to see matching careers and identify skill gaps to fill.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
