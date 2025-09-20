import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Calendar, School, IdCard, Phone } from "lucide-react";

interface PersonalDetailsStepProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack?: () => void;
}

const institutes = [
  "University of Technology",
  "State College of Engineering", 
  "National Institute of Sports",
  "City University",
  "Technical Institute",
  "Other"
];

export const PersonalDetailsStep = ({ initialData, onComplete, onBack }: PersonalDetailsStepProps) => {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    middleName: initialData?.middleName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    dateOfBirth: initialData?.dateOfBirth || "",
    gender: initialData?.gender || "",
    instituteName: initialData?.instituteName || "",
    otherInstitute: initialData?.otherInstitute || "",
    studentId: initialData?.studentId || "",
    phoneNumber: initialData?.phoneNumber || "",
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.firstName) newErrors.push("First Name is required");
    if (!formData.lastName) newErrors.push("Last Name is required");
    if (!formData.email) newErrors.push("Email is required");
    if (!formData.dateOfBirth) newErrors.push("Date of Birth is required");
    if (!formData.gender) newErrors.push("Gender is required");
    if (!formData.instituteName) newErrors.push("Institution is required");
    if (formData.instituteName === "Other" && !formData.otherInstitute) {
      newErrors.push("Please specify institution name");
    }
    if (!formData.studentId) newErrors.push("Student ID is required");
    if (!formData.phoneNumber) newErrors.push("Phone Number is required");
    
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onComplete(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Personal Details</CardTitle>
          <CardDescription>
            Please fill in your basic information accurately
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="middleName"
                  placeholder="Middle Name (Optional)"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange("middleName", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="Email (pre-filled)"
                value={formData.email}
                readOnly
                className="pl-10 bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Institution *</Label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Select value={formData.instituteName} onValueChange={(value) => handleInputChange("instituteName", value)}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select Institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutes.map((institute) => (
                    <SelectItem key={institute} value={institute}>
                      {institute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.instituteName === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="otherInstitute">Institution Name *</Label>
              <Input
                id="otherInstitute"
                placeholder="Enter Institution Name"
                value={formData.otherInstitute}
                onChange={(e) => handleInputChange("otherInstitute", e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID *</Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="studentId"
                placeholder="Student ID / Roll Number"
                value={formData.studentId}
                onChange={(e) => handleInputChange("studentId", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            <Button onClick={handleSubmit} className="bg-gradient-primary ml-auto">
              Save and Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};