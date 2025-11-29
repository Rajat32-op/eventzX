import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, ArrowRight, Users, Heart, Compass } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { colleges, interests } from "@/data/colleges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Auth() {
  const [step, setStep] = useState<"login" | "signup" | "onboarding">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For MVP, skip auth and go to home
    navigate("/");
    toast({
      title: "Welcome back! 🙏",
      description: "You've joined your campus spiritual circle.",
    });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("onboarding");
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((i) => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleComplete = () => {
    navigate("/");
    toast({
      title: "Welcome to InnerCircle! ✨",
      description: "You're now part of your campus spiritual community.",
    });
  };

  if (step === "onboarding") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-2xl relative z-10 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-gradient mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground">
              Help us connect you with like-minded souls
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* College Selection */}
              <div className="space-y-2">
                <Label>Your Campus</Label>
                <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your college/university" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        <span className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {college.type}
                          </Badge>
                          {college.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <Label>Your Spiritual Interests</Label>
                <p className="text-sm text-muted-foreground">
                  Select what resonates with you (at least 3)
                </p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge
                      key={interest.id}
                      variant={
                        selectedInterests.includes(interest.id)
                          ? "default"
                          : "interest"
                      }
                      className="cursor-pointer text-sm py-2 px-3"
                      onClick={() => toggleInterest(interest.id)}
                    >
                      <span className="mr-1.5">{interest.emoji}</span>
                      {interest.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                variant="glow"
                size="lg"
                className="w-full"
                onClick={handleComplete}
                disabled={!name || !selectedCollege || selectedInterests.length < 3}
              >
                Join Your Circle
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          {/* Logo */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center glow-primary">
              <Sparkles className="w-6 h-6 text-foreground" />
            </div>
            <span className="font-display text-3xl font-bold text-gradient">
              InnerCircle
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 max-w-lg mx-auto leading-tight">
            Find Your{" "}
            <span className="text-gradient">Spiritual Tribe</span>{" "}
            on Campus
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Connect with like-minded students. Meditate together. Grow together.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Campus Communities</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
              <Heart className="w-4 h-4 text-secondary" />
              <span className="text-sm text-foreground">Spiritual Meetups</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
              <Compass className="w-4 h-4 text-accent" />
              <span className="text-sm text-foreground">Temple Trips</span>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="w-full max-w-md border-border/50 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              {step === "login" ? "Welcome Back" : "Join InnerCircle"}
            </CardTitle>
            <CardDescription>
              {step === "login"
                ? "Sign in with your college email"
                : "Create account with your institute email"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={step === "login" ? handleLogin : handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">College Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="yourname@iith.ac.in"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button variant="glow" size="lg" className="w-full" type="submit">
                {step === "login" ? "Sign In" : "Create Account"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setStep(step === "login" ? "signup" : "login")}
              >
                {step === "login"
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* College badge */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <p className="text-sm text-muted-foreground mb-3">Trusted by students from</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["IITs", "NITs", "IIITs", "IIMs", "IISERs"].map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
