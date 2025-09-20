import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Mail, Phone, User, Globe, UserCheck, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { INSTITUTE_TYPES, getInstituteOptions } from "@/lib/institutionData";

interface InstitutionDetailsStepProps {
  initialData?: any;
  verificationStatus: {
    institutionEmailVerified: boolean;
    contactPersonEmailVerified: boolean;
  };
  onComplete: (data: any) => void;
  onVerificationChange: (status: any) => void;
  onBack?: () => void;
}

// Institution types are now imported from shared constants

export const InstitutionDetailsStep = ({ 
  initialData, 
  verificationStatus,
  onComplete,
  onVerificationChange,
  onBack 
}: InstitutionDetailsStepProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    institutionName: initialData?.institutionName || "",
    institutionEmail: initialData?.institutionEmail || "",
    institutionType: initialData?.institutionType || "",
    phoneNumber: initialData?.phoneNumber || "",
    website: initialData?.website || "",
    principalName: initialData?.principalName || "",
    principalContact: initialData?.principalContact || "",
    contactPersonName: initialData?.contactPersonName || "",
    contactPersonDesignation: initialData?.contactPersonDesignation || "",
    contactPersonPhone: initialData?.contactPersonPhone || "",
    contactPersonEmail: initialData?.contactPersonEmail || "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [otpStates, setOtpStates] = useState({
    institutionEmail: { sent: false, otp: "", verified: verificationStatus.institutionEmailVerified },
    contactPersonEmail: { sent: false, otp: "", verified: verificationStatus.contactPersonEmailVerified },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const sendOTP = async (emailType: 'institutionEmail' | 'contactPersonEmail') => {
    const email = emailType === 'institutionEmail' ? formData.institutionEmail : formData.contactPersonEmail;
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address first.",
        variant: "destructive",
      });
      return;
    }

    // Simulate OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOtpStates(prev => ({
      ...prev,
      [emailType]: { ...prev[emailType], sent: true }
    }));

    toast({
      title: "OTP Sent",
      description: `Verification code sent to ${email}`,
    });
  };

  const verifyOTP = async (emailType: 'institutionEmail' | 'contactPersonEmail') => {
    const otp = otpStates[emailType].otp;
    
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOtpStates(prev => ({
      ...prev,
      [emailType]: { ...prev[emailType], verified: true }
    }));

    const newVerificationStatus = {
      ...verificationStatus,
      [emailType === 'institutionEmail' ? 'institutionEmailVerified' : 'contactPersonEmailVerified']: true
    };
    
    onVerificationChange(newVerificationStatus);

    toast({
      title: "Email Verified",
      description: "Email verification successful!",
    });
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.institutionName) newErrors.push("Institution Name is required");
    if (!formData.institutionEmail) newErrors.push("Institution Email is required");
    if (!formData.institutionType) newErrors.push("Institution Type is required");
    if (!formData.phoneNumber) newErrors.push("Phone Number is required");
    if (!formData.principalName) newErrors.push("Principal Name is required");
    if (!formData.principalContact) newErrors.push("Principal Contact is required");
    if (!formData.contactPersonName) newErrors.push("Contact Person Name is required");
    if (!formData.contactPersonDesignation) newErrors.push("Contact Person Designation is required");
    if (!formData.contactPersonPhone) newErrors.push("Contact Person Phone is required");
    if (!formData.contactPersonEmail) newErrors.push("Contact Person Email is required");
    
    if (!verificationStatus.institutionEmailVerified) {
      newErrors.push("Institution email must be verified");
    }
    if (!verificationStatus.contactPersonEmailVerified) {
      newErrors.push("Contact person email must be verified");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(formData);
    }
  };

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Institution Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Institution Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institutionName">Institute Name *</Label>
              {formData.institutionType === "Other" ? (
                <Input
                  id="institutionName"
                  value={formData.institutionName}
                  onChange={(e) => handleInputChange("institutionName", e.target.value)}
                  placeholder="Enter institute name"
                />
              ) : (
                <Select 
                  value={formData.institutionName} 
                  onValueChange={(value) => handleInputChange("institutionName", value)}
                  disabled={!formData.institutionType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select institute name" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {getInstituteOptions(formData.institutionType).map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionType">Institute Type *</Label>
              <Select 
                value={formData.institutionType} 
                onValueChange={(value) => {
                  handleInputChange("institutionType", value);
                  // Reset institution name when type changes
                  handleInputChange("institutionName", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select institute type" />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="institutionEmail">Institution Email *</Label>
            <div className="flex gap-2">
              <Input
                id="institutionEmail"
                type="email"
                value={formData.institutionEmail}
                onChange={(e) => handleInputChange("institutionEmail", e.target.value)}
                placeholder="Enter institution email"
                disabled={otpStates.institutionEmail.verified}
              />
              {!otpStates.institutionEmail.verified && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => sendOTP('institutionEmail')}
                  disabled={otpStates.institutionEmail.sent}
                >
                  {otpStates.institutionEmail.sent ? "Sent" : "Verify"}
                </Button>
              )}
              {otpStates.institutionEmail.verified && (
                <Button variant="outline" disabled className="text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {otpStates.institutionEmail.sent && !otpStates.institutionEmail.verified && (
            <div className="space-y-2">
              <Label htmlFor="institutionEmailOtp">Enter OTP</Label>
              <div className="flex gap-2">
                <Input
                  id="institutionEmailOtp"
                  value={otpStates.institutionEmail.otp}
                  onChange={(e) => setOtpStates(prev => ({
                    ...prev,
                    institutionEmail: { ...prev.institutionEmail, otp: e.target.value }
                  }))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
                <Button onClick={() => verifyOTP('institutionEmail')}>
                  Verify
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="Enter website URL"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principalName">Principal Name *</Label>
              <Input
                id="principalName"
                value={formData.principalName}
                onChange={(e) => handleInputChange("principalName", e.target.value)}
                placeholder="Enter principal name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="principalContact">Principal Contact Number *</Label>
              <Input
                id="principalContact"
                type="tel"
                value={formData.principalContact}
                onChange={(e) => handleInputChange("principalContact", e.target.value)}
                placeholder="Enter principal contact"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Person Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Contact Person Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPersonName">Name *</Label>
              <Input
                id="contactPersonName"
                value={formData.contactPersonName}
                onChange={(e) => handleInputChange("contactPersonName", e.target.value)}
                placeholder="Enter contact person name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPersonDesignation">Designation *</Label>
              <Input
                id="contactPersonDesignation"
                value={formData.contactPersonDesignation}
                onChange={(e) => handleInputChange("contactPersonDesignation", e.target.value)}
                placeholder="Enter designation"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPersonPhone">Contact Number *</Label>
            <Input
              id="contactPersonPhone"
              type="tel"
              value={formData.contactPersonPhone}
              onChange={(e) => handleInputChange("contactPersonPhone", e.target.value)}
              placeholder="Enter contact number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPersonEmail">Email *</Label>
            <div className="flex gap-2">
              <Input
                id="contactPersonEmail"
                type="email"
                value={formData.contactPersonEmail}
                onChange={(e) => handleInputChange("contactPersonEmail", e.target.value)}
                placeholder="Enter contact person email"
                disabled={otpStates.contactPersonEmail.verified}
              />
              {!otpStates.contactPersonEmail.verified && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => sendOTP('contactPersonEmail')}
                  disabled={otpStates.contactPersonEmail.sent}
                >
                  {otpStates.contactPersonEmail.sent ? "Sent" : "Verify"}
                </Button>
              )}
              {otpStates.contactPersonEmail.verified && (
                <Button variant="outline" disabled className="text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {otpStates.contactPersonEmail.sent && !otpStates.contactPersonEmail.verified && (
            <div className="space-y-2">
              <Label htmlFor="contactPersonEmailOtp">Enter OTP</Label>
              <div className="flex gap-2">
                <Input
                  id="contactPersonEmailOtp"
                  value={otpStates.contactPersonEmail.otp}
                  onChange={(e) => setOtpStates(prev => ({
                    ...prev,
                    contactPersonEmail: { ...prev.contactPersonEmail, otp: e.target.value }
                  }))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
                <Button onClick={() => verifyOTP('contactPersonEmail')}>
                  Verify
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button onClick={handleSubmit} className={!onBack ? "w-full" : ""}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
};