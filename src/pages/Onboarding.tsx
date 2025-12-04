import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, GraduationCap, MapPin, Heart, ArrowRight, Check, Search } from "lucide-react";
import { colleges, interests as interestsData, cities } from "@/data/colleges";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isStudent, setIsStudent] = useState<boolean | null>(null);
  const [college, setCollege] = useState("");
  const [city, setCity] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateProfile } = useAuth();

  // Filter colleges based on search
  const filteredColleges = useMemo(() => {
    if (!collegeSearch.trim()) return colleges;
    const searchLower = collegeSearch.toLowerCase();
    return colleges.filter(c => 
      c.name.toLowerCase().includes(searchLower) || 
      c.city.toLowerCase().includes(searchLower) ||
      c.type.toLowerCase().includes(searchLower)
    );
  }, [collegeSearch]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const searchLower = citySearch.toLowerCase();
    return cities.filter(c => c.toLowerCase().includes(searchLower));
  }, [citySearch]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(i => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (isStudent && !college) {
        toast({
          title: "Please select your college",
          variant: "destructive",
        });
        return;
      }
      if (!isStudent && !city) {
        toast({
          title: "Please select your city",
          variant: "destructive",
        });
        return;
      }
      // Both students and non-students go to interests (step 3)
      setStep(3);
      return;
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    if (selectedInterests.length < 2) {
      toast({
        title: "Select at least 2 interests",
        description: "This helps us connect you with the right people.",
        variant: "destructive",
      });
      return;
    }

    // Get the selected college name and city from the colleges array
    const selectedCollege = colleges.find(c => c.id === college);
    const selectedInterestNames = selectedInterests.map(id => {
      const interest = interestsData.find(i => i.id === id);
      return interest?.name || id;
    });

    // For students, ALWAYS auto-populate city from college data
    // For non-students, use their manually entered city
    const finalCity = isStudent && selectedCollege ? selectedCollege.city : city;

    if (!finalCity) {
      toast({
        title: "City is required",
        description: "Please ensure a city is selected.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await updateProfile({
      college: isStudent ? (selectedCollege?.name || college) : null,
      city: finalCity,
      interests: selectedInterestNames,
      is_student: isStudent,
    } as any);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile complete! 🎉",
        description: "Welcome to your spiritual community.",
      });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md border-border/50 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden glow-primary mb-4">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <CardTitle className="font-display text-2xl">Complete Your Profile</CardTitle>
          <p className="text-muted-foreground text-sm">
            Step {step === 3 ? 2 : step} of 2
          </p>
          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-2">
            {[1, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  s === step
                    ? "w-6 bg-primary"
                    : s < step
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Student or Non-Student */}
          {step === 1 && isStudent === null && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-2 text-foreground">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold">Are you a student?</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                This helps us show you the most relevant spiritual communities.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => setIsStudent(true)}
                >
                  <GraduationCap className="w-8 h-8 text-primary" />
                  <span className="font-semibold">Yes, I'm a Student</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => setIsStudent(false)}
                >
                  <MapPin className="w-8 h-8 text-accent" />
                  <span className="font-semibold">Not a Student</span>
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: College (for students) */}
          {step === 1 && isStudent === true && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-2 text-foreground">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold">Select Your Campus</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                This helps us connect you with students from your college.
              </p>
              <Select value={college} onValueChange={setCollege}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your college..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <div className="sticky top-0 bg-background p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search college, city or type..."
                        value={collegeSearch}
                        onChange={(e) => setCollegeSearch(e.target.value)}
                        className="pl-9 h-10"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredColleges.length > 0 ? (
                      filteredColleges.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {c.type}
                            </Badge>
                            {c.name}
                          </span>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                        No colleges found
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsStudent(null)} className="flex-1">
                  Back
                </Button>
                <Button 
                  variant="glow" 
                  className="flex-1" 
                  onClick={handleNext}
                  disabled={!college}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: City (for non-students) */}
          {step === 1 && isStudent === false && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="font-display font-semibold">Select Your City</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect with spiritual communities in your city.
              </p>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your city..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <div className="sticky top-0 bg-background p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search city..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="pl-9 h-10"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                        No cities found
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsStudent(null)} className="flex-1">
                  Back
                </Button>
                <Button 
                  variant="glow" 
                  className="flex-1" 
                  onClick={handleNext}
                  disabled={!city}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}



          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-2 text-foreground">
                <Heart className="w-5 h-5 text-secondary" />
                <h3 className="font-display font-semibold">Your Interests</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Select at least 2 interests to find your community.
              </p>
              <div className="flex flex-wrap gap-2">
                {interestsData.map((interest) => (
                  <Badge
                    key={interest.id}
                    variant={selectedInterests.includes(interest.id) ? "default" : "interest"}
                    className="cursor-pointer text-sm py-2 px-3 transition-all"
                    onClick={() => toggleInterest(interest.id)}
                  >
                    {selectedInterests.includes(interest.id) && (
                      <Check className="w-3 h-3 mr-1" />
                    )}
                    <span className="mr-1">{interest.emoji}</span>
                    {interest.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {selectedInterests.length} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  variant="glow" 
                  className="flex-1" 
                  onClick={handleComplete}
                  disabled={isLoading || selectedInterests.length < 2}
                >
                  {isLoading ? "Saving..." : "Complete"}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
