import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UserTypeSelection } from "@/components/registration/UserTypeSelection";
import { EmailOtpStep } from "@/components/registration/EmailOtpStep";
import { InstitutionDetailsStep } from "@/components/institution-registration/InstitutionDetailsStep";
import { SportsSubCategoriesStep } from "@/components/institution-registration/SportsSubCategoriesStep";
import { ManualStudentAddStep } from "@/components/institution-registration/ManualStudentAddStep";
import { InstitutionPaymentStep } from "@/components/institution-registration/InstitutionPaymentStep";
import { InstitutionRegistrationSidebar } from "@/components/registration/InstitutionRegistrationSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

export const NewInstitutionRegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<"userType" | "email" | 1 | 2 | 3 | 4>("userType");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [registrationData, setRegistrationData] = useState({
    userType: "institution",
    email: "",
    password: "",
    institutionDetails: null,
    selectedSports: null,
    students: null,
    payment: null,
  });

  const [verificationStatus, setVerificationStatus] = useState({
    institutionEmailVerified: false,
    contactPersonEmailVerified: false,
  });

  const handleUserTypeSelect = (type: "student" | "institution") => {
    if (type === "student") {
      // Redirect to student registration
      navigate("/register");
      return;
    }
    
    setRegistrationData(prev => ({ ...prev, userType: type }));
    setCurrentStep("email");
  };

  const handleEmailComplete = (email: string) => {
    setRegistrationData(prev => ({ ...prev, email }));
    setCurrentStep(1);
    toast({
      title: "Email Verified Successfully",
      description: "Please complete your institution details.",
    });
  };

  const handleStepComplete = (step: number, data: any) => {
    const stepKey = step === 1 ? "institutionDetails" :
                   step === 2 ? "selectedSports" :
                   step === 3 ? "students" :
                   step === 4 ? "payment" : null;

    if (stepKey) {
      setRegistrationData(prev => ({ 
        ...prev, 
        [stepKey]: data,
        // Pre-fill email in institution details if it's the first step
        ...(step === 1 && { 
          institutionDetails: { 
            ...data, 
            institutionEmail: data.institutionEmail || prev.email 
          } 
        })
      }));
    }

    // Mark step as completed
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }

    // Move to next step
    if (step < 4) {
      setCurrentStep((step + 1) as any);
    }
  };

  const handleBack = (step: number) => {
    if (step === 1) {
      setCurrentStep("email");
    } else {
      setCurrentStep((step - 1) as any);
    }
  };

  const handleEmailBack = () => {
    setCurrentStep("userType");
  };

  const handleFinalComplete = async (paymentData: any) => {
    const finalData = {
      ...registrationData,
      payment: paymentData,
    };

    // Generate Institution ID
    const institutionId = `INST${Date.now().toString().slice(-6)}`;
    
    // Save registration data to localStorage for demo
    localStorage.setItem('institutionRegistrationData', JSON.stringify({
      ...finalData,
      institutionId,
      registrationDate: new Date().toISOString(),
    }));
    
    toast({
      title: "Institution Registration Complete! 🎉",
      description: `Your Institution ID is: ${institutionId}`,
    });
    
    // Navigate to institution dashboard
    navigate("/institution");
  };

  if (currentStep === "userType") {
    return <UserTypeSelection onTypeSelect={handleUserTypeSelect} />;
  }

  if (currentStep === "email") {
    return <EmailOtpStep onComplete={handleEmailComplete} onBack={handleEmailBack} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile steps trigger */}
      <div className="md:hidden sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
        <div className="flex items-center justify-between p-3">
          <div className="text-sm font-medium">Institution Registration</div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <PanelLeft className="h-4 w-4" /> Steps
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 max-w-[85vw]">
              <InstitutionRegistrationSidebar showOnMobile currentStep={currentStep as number} completedSteps={completedSteps} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <InstitutionRegistrationSidebar 
        currentStep={currentStep as number} 
        completedSteps={completedSteps} 
      />
      
      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <InstitutionDetailsStep
              initialData={{ 
                institutionEmail: registrationData.email, 
                ...registrationData.institutionDetails 
              }}
              verificationStatus={verificationStatus}
              onComplete={(data) => handleStepComplete(1, data)}
              onVerificationChange={setVerificationStatus}
              onBack={() => handleBack(1)}
            />
          )}
          
          {currentStep === 2 && (
            <SportsSubCategoriesStep
              initialData={registrationData.selectedSports}
              onComplete={(data) => handleStepComplete(2, data)}
              onBack={() => handleBack(2)}
            />
          )}
          
          {currentStep === 3 && (
            <ManualStudentAddStep
              initialData={registrationData.students}
              onComplete={(data) => handleStepComplete(3, data)}
              onBack={() => handleBack(3)}
            />
          )}
          
          {currentStep === 4 && (
            <InstitutionPaymentStep
              institutionData={{
                ...registrationData.institutionDetails,
                selectedSports: registrationData.selectedSports?.selectedSports || [],
                students: registrationData.students?.students || [],
              }}
              onComplete={handleFinalComplete}
              onBack={() => handleBack(4)}
              loading={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};