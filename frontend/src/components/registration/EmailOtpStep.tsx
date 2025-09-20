import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Mail, Lock, CheckCircle } from "lucide-react";

interface EmailOtpStepProps {
  onComplete: (email: string) => void;
  onBack?: () => void;
}

export const EmailOtpStep = ({ onComplete, onBack }: EmailOtpStepProps) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpId, setOtpId] = useState("");
  const { toast } = useToast();

  const handleSendOtp = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await apiService.sendOTP(email, "student");
      const data = response.data as any;
      
      setOtpId(data.otp_id);
      setStep("otp");
      
      toast({
        title: "OTP Sent! 📧",
        description: `Verification code sent to ${email}. Please check your email inbox.`,
      });
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("OTP is required");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await apiService.verifyOTP(otpId, otp);
      const data = response.data as any;
      
      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified.",
      });
      onComplete(email);
    } catch (error) {
      setError("Invalid OTP. Please try again.");
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Registration
          </CardTitle>
          <CardDescription>
            {step === "email" && "Enter your email to get started"}
            {step === "otp" && "Enter the OTP sent to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "email" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                {onBack && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button 
                  onClick={handleSendOtp} 
                  className="flex-1 bg-gradient-primary"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  OTP sent to {email}. Check your email for the verification code.
                </p>
              </div>
              <Button 
                onClick={handleVerifyOtp} 
                className="w-full bg-gradient-primary"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStep("email")}
                className="w-full"
              >
                Back to Email
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};