import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Function to process the OAuth/email confirmation
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL hash/fragment
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          navigate("/auth?error=auth_failed");
          return;
        }

        if (session) {
          // Session established successfully
          console.log("Email confirmed, session created");
          
          // Wait a moment for AuthContext to update
          setTimeout(() => {
            navigate("/onboarding");
          }, 500);
        } else {
          // No session yet, wait and retry
          setTimeout(handleAuthCallback, 1000);
        }
      } catch (err) {
        console.error("Callback error:", err);
        navigate("/auth");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // Optional: If user is already logged in, redirect to onboarding
  useEffect(() => {
    if (user) {
      navigate("/onboarding");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Completing your sign up...</p>
        <p className="text-sm text-muted-foreground">
          Please wait while we confirm your email address.
        </p>
      </div>
    </div>
  );
}