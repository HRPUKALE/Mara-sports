import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileImage, CheckCircle } from "lucide-react";

interface DocumentUploadStepProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

export const DocumentUploadStep = ({ initialData, onComplete, onBack }: DocumentUploadStepProps) => {
  const [files, setFiles] = useState({
    studentIdImage: initialData?.studentIdImage || null as File | null,
    ageProofDocument: initialData?.ageProofDocument || null as File | null,
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
    setErrors([]);
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!files.studentIdImage) newErrors.push("Student ID Image is required");
    if (!files.ageProofDocument) newErrors.push("Age Proof Document is required");
    
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onComplete(files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Document Upload</CardTitle>
          <CardDescription>
            Please upload the required documents. Files should be clear and readable.
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

          {/* Adequate spacing between sign card and photo upload */}
          <div className="space-y-12 mt-8">
            <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-smooth">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {files.studentIdImage ? (
                      <CheckCircle className="h-6 w-6 text-accent" />
                    ) : (
                      <Upload className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <Label htmlFor="studentId" className="text-base font-medium cursor-pointer">
                    Student ID Image *
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a clear photo of your student ID card
                  </p>
                  <Input
                    id="studentId"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange("studentIdImage", e.target.files?.[0] || null)}
                    className="mt-3"
                  />
                  {files.studentIdImage && (
                    <div className="mt-2 flex items-center space-x-2 text-sm">
                      <FileImage className="h-4 w-4 text-accent" />
                      <span className="text-accent font-medium">{files.studentIdImage.name}</span>
                      <span className="text-muted-foreground">({formatFileSize(files.studentIdImage.size)})</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: JPG, PNG, PDF • Max size: 10MB
                  </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-smooth">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {files.ageProofDocument ? (
                      <CheckCircle className="h-6 w-6 text-accent" />
                    ) : (
                      <Upload className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <Label htmlFor="ageProof" className="text-base font-medium cursor-pointer">
                    Age Proof Document *
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Birth certificate, passport, or similar official document
                  </p>
                  <Input
                    id="ageProof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange("ageProofDocument", e.target.files?.[0] || null)}
                    className="mt-3"
                  />
                  {files.ageProofDocument && (
                    <div className="mt-2 flex items-center space-x-2 text-sm">
                      <FileImage className="h-4 w-4 text-accent" />
                      <span className="text-accent font-medium">{files.ageProofDocument.name}</span>
                      <span className="text-muted-foreground">({formatFileSize(files.ageProofDocument.size)})</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: JPG, PNG, PDF • Max size: 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <FileImage className="h-4 w-4" />
            <AlertDescription>
              <strong>Document Guidelines:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Ensure documents are clear and all text is readable</li>
                <li>• Photos should be well-lit with no shadows or glare</li>
                <li>• Full document should be visible in the image</li>
                <li>• Files will be securely stored and only used for verification</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-primary">
              Save and Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};