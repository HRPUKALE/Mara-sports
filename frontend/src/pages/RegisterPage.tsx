import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { 
  User, Mail, Calendar, School, IdCard, Phone, Upload, Users, Heart, 
  AlertTriangle, Trophy, Shield, FileText, CheckCircle, UserCheck, 
  Activity, Award, UsersIcon as Team, Target
} from "lucide-react";
import sportsHero from "@/assets/sports-hero.jpg";

const institutes = [
  "University of Technology",
  "State College of Engineering",
  "National Institute of Sports",
  "City University",
  "Technical Institute",
  "Other"
];

const individualSports = [
  "Badminton", "Chess", "Athletics", "Swimming", "Tennis", "Table Tennis",
  "Cycling", "Boxing", "Wrestling", "Archery", "Golf"
];

const teamSports = [
  "Football", "Basketball", "Volleyball", "Cricket", "Hockey", "Rugby",
  "Handball", "Baseball", "Water Polo", "Kabaddi"
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpId, setOtpId] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const totalSteps = 10;
  const stepTitles = [
    "Personal Information",
    "Academic Information",
    "Contact Information",
    "Address Information",
    "Emergency Contact",
    "Medical Information",
    "Sports Experience",
    "Social Media & References",
    "Additional Information",
    "Final Declaration"
  ];

  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    instituteName: "",
    otherInstitute: "",
    studentId: "",
    phone: "",
    
    // Step 2: Academic Information
    currentClass: "",
    academicYear: "",
    stream: "",
    subjects: "",
    previousInstitution: "",
    previousClass: "",
    academicAchievements: "",
    extracurricularActivities: "",
    
    // Step 3: Contact Information
    parentGuardianName: "",
    parentPhone: "",
    parentEmail: "",
    parentOccupation: "",
    parentDesignation: "",
    parentWorkplace: "",
    
    // Step 4: Address Information
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    landmark: "",
    
    // Step 5: Emergency Contact
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    emergencyContactEmail: "",
    emergencyContactAddress: "",
    
    // Step 6: Medical Information
    medicalQuestion1: "",
    medicalQuestion2: "",
    hasAllergies: false,
    allergiesDetails: "",
    bloodGroup: "",
    medicalConditions: "",
    medications: "",
    doctorName: "",
    doctorPhone: "",
    insuranceProvider: "",
    insuranceNumber: "",
    
    // Step 7: Sports Experience
    participationType: "",
    selectedSports: [] as string[],
    previousSportsExperience: "",
    sportsAchievements: "",
    currentTrainingLevel: "",
    trainingHoursPerWeek: "",
    coachName: "",
    coachPhone: "",
    preferredTrainingTime: "",
    sportsGoals: "",
    
    // Step 8: Social Media & References
    instagramHandle: "",
    facebookProfile: "",
    twitterHandle: "",
    linkedinProfile: "",
    reference1Name: "",
    reference1Relation: "",
    reference1Phone: "",
    reference2Name: "",
    reference2Relation: "",
    reference2Phone: "",
    
    // Step 9: Additional Information
    hobbies: "",
    languages: "",
    specialSkills: "",
    volunteerExperience: "",
    leadershipExperience: "",
    whyJoinSports: "",
    additionalInfo: "",
    
    // Login credentials
    password: "",
    confirmPassword: "",
  });

  const [files, setFiles] = useState({
    studentIdImage: null as File | null,
    ageProofImage: null as File | null,
    profilePicture: null as File | null,
    academicCertificate: null as File | null,
    sportsCertificate: null as File | null,
    medicalCertificate: null as File | null,
    parentIdProof: null as File | null,
    addressProof: null as File | null,
  });

  const [agreements, setAgreements] = useState({
    waiver: false,
    privacy: false,
    declaration: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
    setErrors([]);
  };

  const handleSportSelection = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSports: prev.selectedSports.includes(sport)
        ? prev.selectedSports.filter(s => s !== sport)
        : [...prev.selectedSports, sport]
    }));
  };

  const validateStep = (step: number): string[] => {
    const stepErrors: string[] = [];
    
    switch (step) {
      case 1:
        if (!formData.firstName) stepErrors.push("First Name is required");
        if (!formData.lastName) stepErrors.push("Last Name is required");
        if (!formData.email) stepErrors.push("Email Address is required");
        if (!formData.dateOfBirth) stepErrors.push("Date of Birth is required");
        if (!formData.gender) stepErrors.push("Gender is required");
        if (!formData.instituteName) stepErrors.push("Institute is required");
        if (!formData.studentId) stepErrors.push("Student ID is required");
        if (!formData.phone) stepErrors.push("Phone Number is required");
        if (!phoneVerified) stepErrors.push("Phone number must be verified");
        break;
      case 2:
        if (!files.studentIdImage) stepErrors.push("Student ID Image is required");
        if (!files.ageProofImage) stepErrors.push("Age Proof Image is required");
        break;
      case 3:
        if (!formData.parentGuardianName) stepErrors.push("Parent/Guardian Name is required");
        if (!formData.parentPhone) stepErrors.push("Parent/Guardian Phone is required");
        if (!formData.parentEmail) stepErrors.push("Parent/Guardian Email is required");
        break;
      case 4:
        if (!formData.emergencyContactName) stepErrors.push("Emergency Contact Name is required");
        if (!formData.emergencyContactRelation) stepErrors.push("Relationship is required");
        if (!formData.emergencyContactPhone) stepErrors.push("Emergency Contact Phone is required");
        break;
      case 5:
        if (!formData.medicalQuestion1) stepErrors.push("Medical Question 1 is required");
        if (!formData.medicalQuestion2) stepErrors.push("Medical Question 2 is required");
        break;
      case 6:
        if (!formData.participationType) stepErrors.push("Participation Type is required");
        if (formData.selectedSports.length === 0) stepErrors.push("At least one sport must be selected");
        break;
      case 7:
        if (!agreements.waiver) stepErrors.push("Waiver agreement is required");
        break;
      case 8:
        if (!agreements.privacy) stepErrors.push("Privacy policy agreement is required");
        break;
      case 9:
        if (!agreements.declaration) stepErrors.push("Declaration agreement is required");
        break;
    }
    
    return stepErrors;
  };

  const nextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (stepErrors.length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setErrors([]);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setErrors([]);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiService.sendOTP(formData.email, "student");
      const data = response.data as any;
      
      setOtpId(data.otp_id);
      setOtpSent(true);
      
      toast({
        title: "OTP Sent! 📧",
        description: `Verification code sent to ${formData.email}. Please check your email inbox.`,
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
      
      setPhoneVerified(true);
      setOtpSent(false);
      
      toast({
        title: "Phone Verified ✅",
        description: "Your phone number has been successfully verified.",
      });
    } catch (error) {
      toast({
        title: "Invalid OTP",
        description: "Please check the OTP code and try again.",
        variant: "destructive",
      });
    }
  };

  const calculateFees = () => {
    const baseFee = 50;
    const sportFee = formData.selectedSports.length * 25;
    return baseFee + sportFee;
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(currentStep);
    if (stepErrors.length > 0) {
      setErrors(stepErrors);
      return;
    }

    setLoading(true);
    try {
      const finalInstitute = formData.instituteName === "Other" ? formData.otherInstitute : formData.instituteName;
      
      // Prepare student data for backend
      const studentData = {
        first_name: formData.firstName,
        middle_name: formData.middleName || null,
        last_name: formData.lastName,
        email: formData.email,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        institution_name: finalInstitute,
        student_id: formData.studentId,
        parent_guardian_name: formData.parentGuardianName,
        parent_phone: formData.parentPhone,
        parent_email: formData.parentEmail,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_relation: formData.emergencyContactRelation,
        emergency_contact_phone: formData.emergencyContactPhone,
        emergency_contact_email: formData.emergencyContactEmail,
        medical_question_1: formData.medicalQuestion1,
        medical_question_2: formData.medicalQuestion2,
        has_allergies: formData.hasAllergies,
        allergies_details: formData.allergiesDetails || null,
        participation_type: formData.participationType,
        selected_sports: formData.selectedSports,
        password: "defaultPassword123", // In a real app, collect this in step 1
        // Note: File uploads would need to be handled separately
        student_id_image: null,
        age_proof_image: null,
        address: null,
        medical_info: null,
        guardian: null,
        profile_picture: null
      };

      // Register student with backend
      const response = await apiService.registerStudent(studentData);
      
      if (response.success) {
        toast({
          title: "🎉 Registration Complete!",
          description: "Your account has been created successfully. Please log in to access your dashboard.",
        });
        
        navigate("/login");
      } else {
        throw new Error(response.message || "Registration failed");
      }
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">First Name *</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="pl-12 h-12 text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Middle Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Enter your middle name (optional)"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange("middleName", e.target.value)}
                    className="pl-12 h-12 text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Last Name *</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="pl-12 h-12 text-base"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Date of Birth *</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="date"
                    placeholder="Select your date of birth"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="pl-12 h-12 text-base"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Student ID *</Label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Enter your student ID"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange("studentId", e.target.value)}
                    className="pl-12 h-12 text-base"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Institution *</Label>
                <div className="relative">
                  <School className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Select value={formData.instituteName} onValueChange={(value) => handleInputChange("instituteName", value)}>
                    <SelectTrigger className="pl-12 h-12 text-base">
                      <SelectValue placeholder="Select your institution" />
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

              <div className="space-y-2">
                <Label className="text-base font-semibold">Phone Number *</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pl-12 h-12 text-base"
                    />
                  </div>
                  <Button
                    type="button"
                    variant={phoneVerified ? "default" : "outline"}
                    onClick={otpSent ? handleOtpVerification : handleSendOTP}
                    disabled={phoneVerified || !formData.phone}
                    className="min-w-[120px] h-12 text-base"
                  >
                    {phoneVerified ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </>
                    ) : otpSent ? (
                      "Verify"
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {formData.instituteName === "Other" && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">Institution Name *</Label>
                <Input
                  placeholder="Enter your institution name"
                  value={formData.otherInstitute}
                  onChange={(e) => handleInputChange("otherInstitute", e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            )}

            {otpSent && !phoneVerified && (
              <div className="space-y-4 p-6 border rounded-lg bg-muted/30">
                <Label className="text-base font-semibold">Enter OTP Code</Label>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter the OTP code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="flex-1 h-12 text-base"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOtpVerification}
                    disabled={!otpCode}
                    className="h-12 text-base"
                  >
                    Verify
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  OTP sent to {formData.email}
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Class/Year *</Label>
                <Input
                  placeholder="e.g., 12th Grade, 2nd Year"
                  value={formData.currentClass}
                  onChange={(e) => handleInputChange("currentClass", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Academic Year *</Label>
                <Input
                  placeholder="e.g., 2024-25"
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange("academicYear", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stream/Field of Study</Label>
                <Input
                  placeholder="e.g., Science, Commerce, Arts, Engineering"
                  value={formData.stream}
                  onChange={(e) => handleInputChange("stream", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Subjects</Label>
                <Input
                  placeholder="e.g., Physics, Chemistry, Mathematics"
                  value={formData.subjects}
                  onChange={(e) => handleInputChange("subjects", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Previous Institution</Label>
                <Input
                  placeholder="Name of previous school/college"
                  value={formData.previousInstitution}
                  onChange={(e) => handleInputChange("previousInstitution", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Previous Class</Label>
                <Input
                  placeholder="e.g., 11th Grade, 1st Year"
                  value={formData.previousClass}
                  onChange={(e) => handleInputChange("previousClass", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Academic Achievements</Label>
              <Textarea
                placeholder="List your academic achievements, awards, scholarships, etc."
                value={formData.academicAchievements}
                onChange={(e) => handleInputChange("academicAchievements", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Extracurricular Activities</Label>
              <Textarea
                placeholder="List your extracurricular activities, clubs, societies, etc."
                value={formData.extracurricularActivities}
                onChange={(e) => handleInputChange("extracurricularActivities", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parent/Guardian Name *</Label>
                <Input
                  placeholder="Full Name"
                  value={formData.parentGuardianName}
                  onChange={(e) => handleInputChange("parentGuardianName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input
                  placeholder="e.g., Engineer, Teacher, Doctor"
                  value={formData.parentOccupation}
                  onChange={(e) => handleInputChange("parentOccupation", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input
                  placeholder="e.g., Senior Manager, Principal"
                  value={formData.parentDesignation}
                  onChange={(e) => handleInputChange("parentDesignation", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Workplace</Label>
                <Input
                  placeholder="Company/Organization Name"
                  value={formData.parentWorkplace}
                  onChange={(e) => handleInputChange("parentWorkplace", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  placeholder="+91 9876543210"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  placeholder="parent@email.com"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Street Address *</Label>
              <Textarea
                placeholder="Complete street address"
                value={formData.streetAddress}
                onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  placeholder="New Delhi"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input
                  placeholder="Delhi"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Postal Code *</Label>
                <Input
                  placeholder="110001"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Input
                  placeholder="India"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Landmark</Label>
                <Input
                  placeholder="Near Metro Station"
                  value={formData.landmark}
                  onChange={(e) => handleInputChange("landmark", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Parent/Guardian Full Name *"
                value={formData.parentGuardianName}
                onChange={(e) => handleInputChange("parentGuardianName", e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Parent/Guardian Phone Number *"
                value={formData.parentPhone}
                onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="email"
                placeholder="Parent/Guardian Email Address *"
                value={formData.parentEmail}
                onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Emergency Contact Full Name *"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={formData.emergencyContactRelation} onValueChange={(value) => handleInputChange("emergencyContactRelation", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Relationship with Student *" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Guardian">Guardian</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Relative">Relative</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Emergency Contact Phone Number *"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="email"
                placeholder="Emergency Contact Email (Optional)"
                value={formData.emergencyContactEmail}
                onChange={(e) => handleInputChange("emergencyContactEmail", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Medical Question 1 *</Label>
              <Textarea
                placeholder="Do you have any existing medical conditions?"
                value={formData.medicalQuestion1}
                onChange={(e) => handleInputChange("medicalQuestion1", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Medical Question 2 *</Label>
              <Textarea
                placeholder="Are you currently taking any medications?"
                value={formData.medicalQuestion2}
                onChange={(e) => handleInputChange("medicalQuestion2", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allergies"
                  checked={formData.hasAllergies}
                  onCheckedChange={(checked) => handleInputChange("hasAllergies", !!checked)}
                />
                <Label htmlFor="allergies" className="cursor-pointer">
                  Any Allergies/Health Conditions?
                </Label>
              </div>

              {formData.hasAllergies && (
                <Textarea
                  placeholder="Please provide details about allergies or health conditions"
                  value={formData.allergiesDetails}
                  onChange={(e) => handleInputChange("allergiesDetails", e.target.value)}
                  rows={3}
                />
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Participation Type *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.participationType === "Individual" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                  }`}
                  onClick={() => handleInputChange("participationType", "Individual")}
                >
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5" />
                    <div>
                      <h3 className="font-medium">Individual</h3>
                      <p className="text-sm text-muted-foreground">Compete individually</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.participationType === "Team" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                  }`}
                  onClick={() => handleInputChange("participationType", "Team")}
                >
                  <div className="flex items-center space-x-3">
                    <Team className="h-5 w-5" />
                    <div>
                      <h3 className="font-medium">Team</h3>
                      <p className="text-sm text-muted-foreground">Compete in team events</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {formData.participationType && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Select {formData.participationType} Sports *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(formData.participationType === "Individual" ? individualSports : teamSports).map((sport) => (
                    <div
                      key={sport}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.selectedSports.includes(sport) 
                          ? "border-primary bg-primary/5" 
                          : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() => handleSportSelection(sport)}
                    >
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span className="text-sm font-medium">{sport}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.selectedSports.length > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Selected Sports:</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.selectedSports.map((sport) => (
                    <Badge key={sport} variant="secondary">{sport}</Badge>
                  ))}
                </div>
                <div className="text-lg font-bold text-primary">
                  Final Fees: ₹{calculateFees()}
                </div>
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-3">Waiver & Release of Liability</h3>
              <p className="text-sm text-muted-foreground mb-4">
                I understand that participation in sports activities involves inherent risks, including but not limited to the risk of injury, disability, or death. I voluntarily assume all risks associated with participation and hereby release and hold harmless the event organizers, sponsors, and all associated parties from any and all claims, demands, or causes of action arising out of or related to any loss, damage, or injury that may be sustained by the participant.
              </p>
              <p className="text-sm text-muted-foreground">
                I acknowledge that I have read and understand this waiver, and I voluntarily agree to its terms and conditions.
              </p>
            </div>

            <div className="flex items-start space-x-2 p-4 border rounded-lg">
              <Checkbox
                id="waiver"
                checked={agreements.waiver}
                onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, waiver: !!checked }))}
              />
              <div>
                <Label htmlFor="waiver" className="cursor-pointer font-medium">
                  I agree to the Waiver & Release of Liability *
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  By checking this box, I acknowledge that I have read, understood, and agree to the terms.
                </p>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-3">Data Protection & Privacy Notice</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We collect and process your personal data to facilitate your participation in sports events. This includes your contact information, medical details, and performance data. Your information will be used for event management, emergency contact purposes, and improving our services.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                We implement appropriate security measures to protect your data and will not share your information with third parties without your consent, except as required by law or for event safety purposes.
              </p>
              <p className="text-sm text-muted-foreground">
                You have the right to access, correct, or delete your personal data at any time by contacting our support team.
              </p>
            </div>

            <div className="flex items-start space-x-2 p-4 border rounded-lg">
              <Checkbox
                id="privacy"
                checked={agreements.privacy}
                onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, privacy: !!checked }))}
              />
              <div>
                <Label htmlFor="privacy" className="cursor-pointer font-medium">
                  I agree to the Data Protection & Privacy Policy *
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  I consent to the collection and processing of my personal data as described.
                </p>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-3">Final Declaration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                I hereby declare that all information provided in this registration form is true, accurate, and complete to the best of my knowledge. I understand that any false or misleading information may result in disqualification from the event.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                I acknowledge that I have read and understood all the terms, conditions, and policies associated with this event registration. I agree to abide by all rules and regulations set forth by the event organizers.
              </p>
              <p className="text-sm text-muted-foreground">
                By submitting this registration, I confirm my commitment to participate in the selected events and understand the associated responsibilities.
              </p>
            </div>

            <div className="flex items-start space-x-2 p-4 border rounded-lg">
              <Checkbox
                id="declaration"
                checked={agreements.declaration}
                onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, declaration: !!checked }))}
              />
              <div>
                <Label htmlFor="declaration" className="cursor-pointer font-medium">
                  I hereby declare that the information provided is true *
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  I confirm the accuracy of all information and my commitment to participate.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Hero Section */}
          <div className="text-center md:text-left space-y-6 md:sticky md:top-8">
            <div className="relative">
              <img 
                src={sportsHero} 
                alt="Sports Event Management" 
                className="rounded-2xl shadow-large w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                <div className="text-white text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4" />
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Join Sports Events</h1>
                  <p className="text-xl opacity-90">Complete registration to participate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <Card className="shadow-large border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center pb-8 px-8">
              <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Student Registration
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8 px-8 pb-8">
              {/* Step Progress */}
              <div className="flex items-center justify-between mb-8">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      i + 1 <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                    {i < totalSteps - 1 && (
                      <div className={`w-6 h-1 ml-2 ${
                        i + 1 < currentStep ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <Alert variant="destructive" className="p-6">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertDescription className="text-base">
                    <ul className="list-disc list-inside space-y-2">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Step Content */}
              <div className="space-y-8">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="h-12 px-8 text-base"
                >
                  Back
                </Button>
                
                {currentStep === totalSteps ? (
                  <Button 
                    onClick={handleSubmit} 
                    className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-12 px-8 text-base"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Registration"}
                  </Button>
                ) : (
                  <Button 
                    onClick={nextStep}
                    className="bg-gradient-primary h-12 px-8 text-base"
                  >
                    Save & Continue
                  </Button>
                )}
              </div>

              {/* Login Link */}
              <div className="text-center text-sm pt-4 border-t">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;