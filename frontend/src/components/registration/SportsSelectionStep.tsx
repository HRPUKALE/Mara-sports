import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Users, Target, Plus, X } from "lucide-react";

interface SportsSelectionStepProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

const individualSports = [
  "Badminton", "Chess", "Athletics", "Swimming", "Tennis", "Table Tennis",
  "Cycling", "Boxing", "Wrestling", "Archery", "Golf", "Gymnastics"
];

const teamSports = [
  "Football", "Basketball", "Volleyball", "Cricket", "Hockey", "Rugby",
  "Handball", "Baseball", "Water Polo", "Kabaddi", "Softball"
];

const categories = [
  "Under-12", "Under-15", "Under-17", "Under-19", "Open Category"
];

export const SportsSelectionStep = ({ initialData, onComplete, onBack }: SportsSelectionStepProps) => {
  const [formData, setFormData] = useState({
    participationType: initialData?.participationType || "",
    selectedSports: initialData?.selectedSports || [] as { sport: string; category: string }[],
  });

  const [currentSport, setCurrentSport] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      participationType: value, 
      selectedSports: [] // Reset sports when type changes
    }));
    setCurrentSport("");
    setCurrentCategory("");
    setErrors([]);
  };

  const addSport = () => {
    if (!currentSport || !currentCategory) {
      setErrors(["Please select both sport and category"]);
      return;
    }

    // Check if sport already exists
    const exists = formData.selectedSports.some(
      item => item.sport === currentSport && item.category === currentCategory
    );

    if (exists) {
      setErrors(["This sport and category combination already exists"]);
      return;
    }

    setFormData(prev => ({
      ...prev,
      selectedSports: [...prev.selectedSports, { sport: currentSport, category: currentCategory }]
    }));

    setCurrentSport("");
    setCurrentCategory("");
    setErrors([]);
  };

  const removeSport = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selectedSports: prev.selectedSports.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.participationType) newErrors.push("Please select participation type");
    if (formData.selectedSports.length === 0) newErrors.push("Please add at least one sport");
    
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

  const availableSports = formData.participationType === "individual" ? individualSports : teamSports;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Sports Selection</CardTitle>
          <CardDescription>
            Choose your participation type and select the sports you want to participate in
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

          {/* Participation Type Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Select Type</h3>
            </div>
            
            <RadioGroup 
              value={formData.participationType} 
              onValueChange={handleTypeChange}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
                <RadioGroupItem value="team" id="team" />
                <Label htmlFor="team" className="flex items-center space-x-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  <span>Team Sports</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="flex items-center space-x-2 cursor-pointer">
                  <Target className="h-4 w-4" />
                  <span>Individual Sports</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sport Selection */}
          {formData.participationType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add Sports</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label>Select Sport</Label>
                  <Select value={currentSport} onValueChange={setCurrentSport}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSports.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Sub-category</Label>
                  <Select value={currentCategory} onValueChange={setCurrentCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button 
                    onClick={addSport}
                    disabled={!currentSport || !currentCategory}
                    className="w-full bg-gradient-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sport
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Selected Sports Display */}
          {formData.selectedSports.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Selected Sports</h3>
              
              <div className="space-y-3">
                {formData.selectedSports.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-4 w-4 text-accent" />
                      <div>
                        <div className="font-medium text-foreground">{item.sport}</div>
                        <div className="text-sm text-muted-foreground">{item.category}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSport(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-sm text-primary font-medium">
                  Registration Fee Summary:
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Base Fee: $50 + Sports Fee: ${formData.selectedSports.length * 25} = 
                  <span className="font-medium text-primary ml-1">
                    ${50 + (formData.selectedSports.length * 25)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Alert>
            <Trophy className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> You can participate in multiple sports. Each additional sport incurs a $25 registration fee. Please ensure you can commit to the training and competition schedules for all selected sports.
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