import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, GraduationCap, MapPin, Heart, ArrowRight, Check } from "lucide-react";
import { colleges, interests as interestsData, cities } from "@/data/colleges";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [college, setCollege] = useState("");
  const [city, setCity] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateProfile } = useAuth();

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(i => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    if (step === 1 && !college) {
      toast({
        title: "Please select your college",
        variant: "destructive",
      });
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

    // Get the selected college name from the colleges array
    const selectedCollege = colleges.find(c => c.id === college);
    const selectedInterestNames = selectedInterests.map(id => {
      const interest = interestsData.find(i => i.id === id);
      return interest?.name || id;
    });

    setIsLoading(true);
    const { error } = await updateProfile({
      college: selectedCollege?.name || college,
      city: city || null,
      interests: selectedInterestNames,
    });
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
          <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary mb-4">
            <Sparkles className="w-8 h-8 text-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Complete Your Profile</CardTitle>
          <p className="text-muted-foreground text-sm">
            Step {step} of 3
          </p>
          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
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
          {/* Step 1: College */}
          {step === 1 && (
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
                  {colleges.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {c.type}
                        </Badge>
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="glow" 
                className="w-full" 
                onClick={handleNext}
                disabled={!college}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: City */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="font-display font-semibold">Your City (Optional)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect with spiritual communities in your city.
              </p>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your city..." />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button variant="glow" className="flex-1" onClick={handleNext}>
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
                Select at least 2 interests to find your tribe.
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
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
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
