import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Mail, Lock, User, ArrowRight, Users, Heart, Compass, Shield, AlertTriangle, RefreshCw } from "lucide-react";
import { z } from "zod";
import { requestOTP, verifyOTP, getRemainingAttempts } from "@/lib/otp";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  
  // OTP verification states
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [hourlyAttemptsRemaining, setHourlyAttemptsRemaining] = useState(5);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (showOTPVerification && otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, [showOTPVerification]);

  const validateForm = (isSignUp: boolean) => {
    const newErrors: { email?: string; password?: string; name?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (isSignUp) {
      const nameResult = nameSchema.safeParse(name);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid email or password. Please try again."
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back! 🙏",
        description: "You've successfully signed in.",
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    
    setIsLoading(true);
    
    // Request OTP instead of directly signing up
    const otpResponse = await requestOTP(email);
    setIsLoading(false);

    if (otpResponse.success) {
      setShowOTPVerification(true);
      setResendCooldown(60);
      setRemainingAttempts(5);
      if (otpResponse.remainingAttempts !== undefined) {
        setHourlyAttemptsRemaining(otpResponse.remainingAttempts);
      }
      toast({
        title: "Verification code sent!",
        description: "Please check your email for the 6-digit code.",
      });
    } else {
      toast({
        title: "Failed to send code",
        description: otpResponse.message,
        variant: "destructive",
      });
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOTP = [...otpCode];
    newOTP[index] = value;
    setOtpCode(newOTP);
    setOtpError("");

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newOTP.every(digit => digit !== "") && newOTP.join("").length === 6) {
      handleVerifyOTP(newOTP.join(""));
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOTP = pastedData.split("");
      setOtpCode(newOTP);
      setOtpError("");
      // Auto-verify
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    setIsVerifying(true);
    setOtpError("");

    try {
      const result = await verifyOTP(email, code);
      
      if (result.success) {
        // OTP verified, now create the account
        const { error } = await signUp(email, password, name);
        
        if (error) {
          let errorMessage = error.message;
          
          if (error.message.includes("already registered") || 
              error.message.includes("User already registered") ||
              error.message.includes("already exists") ||
              error.message.toLowerCase().includes("duplicate")) {
            errorMessage = "This email is already registered. Please sign in instead.";
          }
          
          setOtpError(errorMessage);
          toast({
            title: "Sign up failed",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          // Account created and verified, sign them in
          const { error: signInError } = await signIn(email, password);
          
          if (signInError) {
            toast({
              title: "Account created!",
              description: "Please sign in with your credentials.",
            });
          } else {
            toast({
              title: "Welcome to EventzX! 🎉",
              description: "Your account has been created successfully.",
            });
          }
          setShowOTPVerification(false);
        }
      } else {
        setOtpError(result.message);
        setOtpCode(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
        
        if (result.remainingAttempts !== undefined) {
          setRemainingAttempts(result.remainingAttempts);
        }

        // Update hourly attempts
        const attempts = await getRemainingAttempts(email);
        setHourlyAttemptsRemaining(attempts.hourly);
      }
    } catch (error: any) {
      setOtpError(error.message || "Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    const otpResponse = await requestOTP(email);
    setIsLoading(false);

    if (otpResponse.success) {
      setResendCooldown(60);
      setOtpCode(["", "", "", "", "", ""]);
      setOtpError("");
      if (otpResponse.remainingAttempts !== undefined) {
        setHourlyAttemptsRemaining(otpResponse.remainingAttempts);
      }
      toast({
        title: "New code sent!",
        description: "Check your email for the new verification code.",
      });
      otpInputRefs.current[0]?.focus();
    } else {
      toast({
        title: "Failed to resend code",
        description: otpResponse.message,
        variant: "destructive",
      });
    }
  };

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
            <div className="w-12 h-12 rounded-xl overflow-hidden glow-primary">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display text-3xl font-bold text-gradient">
              EventzX
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 max-w-lg mx-auto leading-tight">
            Discover {" "}
            <span className="text-gradient">events</span>{" "}
             heppening in your college and city
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
Hackathons, competitions, clubs, workshops, sports, and everything happening around you.          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">College Events</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
              <Heart className="w-4 h-4 text-secondary" />
              <span className="text-sm text-foreground">City Events</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
              <Compass className="w-4 h-4 text-accent" />
              <span className="text-sm text-foreground">All Activities</span>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="w-full max-w-md border-border/50 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Welcome</CardTitle>
            <CardDescription>
              Sign in or create an account with your college email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="font-display">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="font-display">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your.email@college.edu"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>

                  <Button 
                    type="submit" 
                    variant="glow" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                {showOTPVerification ? (
                  <div className="space-y-6 py-4 animate-fade-up">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        Enter Verification Code
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We've sent a 6-digit code to
                      </p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Code expires in 30 minutes • Check spam folder if not received
                      </p>
                    </div>

                    {/* OTP Input */}
                    <div className="flex justify-center gap-2">
                      {otpCode.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOTPChange(index, e.target.value)}
                          onKeyDown={(e) => handleOTPKeyDown(index, e)}
                          onPaste={index === 0 ? handleOTPPaste : undefined}
                          className="w-12 h-12 text-center text-lg font-semibold"
                          disabled={isVerifying}
                        />
                      ))}
                    </div>

                    {/* Error Message */}
                    {otpError && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{otpError}</AlertDescription>
                      </Alert>
                    )}

                    {/* Attempts Warning */}
                    {remainingAttempts <= 2 && remainingAttempts > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          ⚠️ {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining for this code
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Hourly Limit Warning */}
                    {hourlyAttemptsRemaining <= 2 && hourlyAttemptsRemaining > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          ⚠️ {hourlyAttemptsRemaining} code request{hourlyAttemptsRemaining !== 1 ? 's' : ''} remaining this hour
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Verify Button */}
                    <Button
                      onClick={() => handleVerifyOTP(otpCode.join(""))}
                      variant="glow"
                      className="w-full"
                      disabled={isVerifying || otpCode.some(d => !d)}
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>

                    {/* Resend Section */}
                    <div className="text-center pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">
                        Didn't receive the code?
                      </p>
                      {resendCooldown > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Resend available in {resendCooldown}s
                        </p>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleResendOTP}
                          disabled={isLoading || hourlyAttemptsRemaining === 0}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Resend Code
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowOTPVerification(false);
                          setOtpCode(["", "", "", "", "", ""]);
                          setOtpError("");
                        }}
                        className="ml-2"
                      >
                        Change Email
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your Name"
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">College Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your.email@college.edu"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>

                  <Button 
                    type="submit" 
                    variant="glow" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Join EventzX"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
                )}
              </TabsContent>
            </Tabs>
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
