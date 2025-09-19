import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Building2, Mail, Phone, Globe, User, MapPin, GraduationCap, CheckCircle } from "lucide-react";
import sportsHero from "@/assets/sports-hero.jpg";

const InstitutionRegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpId, setOtpId] = useState("");
  
  const [formData, setFormData] = useState({
    institutionName: "",
    customInstitutionName: "",
    institutionType: "",
    address: "",
    phone: "",
    website: "",
    contactPersonName: "",
    contactPersonDesignation: "",
    contactPersonPhone: "",
    contactPersonEmail: "",
    description: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendOTP = async () => {
    if (!formData.contactPersonEmail) {
      toast({
        title: "Email Required",
        description: "Please enter contact person email first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiService.sendOTP(formData.contactPersonEmail, "institute");
      const data = response.data as any;
      
      setOtpId(data.otp_id);
      setOtpSent(true);
      
      toast({
        title: "OTP Sent! 📧",
        description: `Verification code sent to ${formData.contactPersonEmail}. Please check your email inbox.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Send OTP",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleOtpVerification = async () => {
    if (!otpCode) {
      toast({
        title: "OTP Required",
        description: "Please enter the OTP code.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiService.verifyOTP(otpId, otpCode);
      const data = response.data as any;
      
      setEmailVerified(true);
      setOtpSent(false);
      
      toast({
        title: "Email Verified ✅",
        description: "Your email has been successfully verified.",
      });
    } catch (error) {
      toast({
        title: "Invalid OTP",
        description: "Please check the OTP code and try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Registration Successful!",
        description: "Your institution has been registered. Please verify your email to continue.",
      });
      
      navigate("/institution/login");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Hero Section */}
          <div className="text-center md:text-left space-y-6">
            <div className="relative">
              <img 
                src={sportsHero} 
                alt="Institution Registration" 
                className="rounded-2xl shadow-large w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                <div className="text-white text-center">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Register Your Institution</h1>
                  <p className="text-xl opacity-90">Join our sports management platform</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <Card className="shadow-large border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Institution Registration
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Create your institution account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Institution Information */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Institution Details</Label>
                  
                  <div className="space-y-2">
                    <Label>Institution Name</Label>
                    <Select value={formData.institutionName} onValueChange={(value) => handleInputChange("institutionName", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Institution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Delhi Public School">Delhi Public School</SelectItem>
                        <SelectItem value="Ryan International School">Ryan International School</SelectItem>
                        <SelectItem value="DAV Public School">DAV Public School</SelectItem>
                        <SelectItem value="Kendriya Vidyalaya">Kendriya Vidyalaya</SelectItem>
                        <SelectItem value="Amity University">Amity University</SelectItem>
                        <SelectItem value="Jamia Millia Islamia">Jamia Millia Islamia</SelectItem>
                        <SelectItem value="Other">Other (Enter Manually)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {formData.institutionName === "Other" && (
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Enter Institution Name"
                          value={formData.customInstitutionName || ""}
                          onChange={(e) => handleInputChange("customInstitutionName", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <Select value={formData.institutionType} onValueChange={(value) => handleInputChange("institutionType", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Institution Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="School">School</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                      <SelectItem value="University">University</SelectItem>
                      <SelectItem value="Academy">Academy</SelectItem>
                      <SelectItem value="Training Center">Training Center</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                    <Textarea
                      placeholder="Institution Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="pl-10 min-h-[80px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Website (optional)"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Person Information */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Contact Person Details</Label>
                  
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Contact Person Name"
                      value={formData.contactPersonName}
                      onChange={(e) => handleInputChange("contactPersonName", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>

                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Designation"
                      value={formData.contactPersonDesignation}
                      onChange={(e) => handleInputChange("contactPersonDesignation", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Contact Phone"
                        value={formData.contactPersonPhone}
                        onChange={(e) => handleInputChange("contactPersonPhone", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            type="email"
                            placeholder="Contact Email"
                            value={formData.contactPersonEmail}
                            onChange={(e) => handleInputChange("contactPersonEmail", e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        <Button
                          type="button"
                          variant={emailVerified ? "default" : "outline"}
                          onClick={otpSent ? handleOtpVerification : handleSendOTP}
                          disabled={emailVerified || !formData.contactPersonEmail}
                          className="min-w-[120px]"
                        >
                          {emailVerified ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Verified
                            </>
                          ) : otpSent ? (
                            "Verify OTP"
                          ) : (
                            "Send OTP"
                          )}
                        </Button>
                      </div>
                      
                      {otpSent && !emailVerified && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter OTP"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleOtpVerification}
                              disabled={!otpCode}
                            >
                              Verify
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            OTP sent to {formData.contactPersonEmail}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  disabled={loading || !emailVerified}
                >
                  {loading ? "Registering Institution..." : emailVerified ? "Register Institution" : "Verify Email First"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link to="/institution/login" className="text-primary hover:underline font-medium">
                    Sign In
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstitutionRegisterPage;