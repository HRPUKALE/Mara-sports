import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Users, Target, Plus, X } from "lucide-react";
import { 
  AGE_CATEGORIES, 
  GENDER_OPTIONS, 
  SPORT_TYPES, 
  TEAM_SPORTS, 
  INDIVIDUAL_SPORTS,
  getSportsByType,
  getCategoriesForSport,
  getSubCategoriesForSportAndCategory,
  getAgeGroupsForSport
} from "@/lib/sportsData";

interface SportsSelectionStepProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

// Using the new sports data structure

export const SportsSelectionStep = ({ initialData, onComplete, onBack }: SportsSelectionStepProps) => {
  const [formData, setFormData] = useState({
    participationType: initialData?.participationType || "",
    selectedSports: initialData?.selectedSports || [] as { 
      sport: string; 
      category: string; 
      subCategory: string;
      ageFrom: string;
      ageTo: string;
      gender: string;
    }[],
  });

  const [currentSport, setCurrentSport] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentSubCategory, setCurrentSubCategory] = useState("");
  const [currentAgeFrom, setCurrentAgeFrom] = useState("");
  const [currentAgeTo, setCurrentAgeTo] = useState("");
  const [currentGender, setCurrentGender] = useState("Open");
  const [errors, setErrors] = useState<string[]>([]);

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      participationType: value, 
      selectedSports: [] // Reset sports when type changes
    }));
    setCurrentSport("");
    setCurrentCategory("");
    setCurrentSubCategory("");
    setCurrentAgeFrom("");
    setCurrentAgeTo("");
    setCurrentGender("Open");
    setErrors([]);
  };

  const addSport = () => {
    if (!currentSport) {
      setErrors(["Please select a sport"]);
      return;
    }

    if (formData.participationType === "individual" && !currentCategory) {
      setErrors(["Please select a category for individual sports"]);
      return;
    }

    if (!currentAgeFrom || !currentAgeTo) {
      setErrors(["Please select age range"]);
      return;
    }

    // Check if sport already exists with same details
    const exists = formData.selectedSports.some(
      item => item.sport === currentSport && 
              item.category === currentCategory && 
              item.subCategory === currentSubCategory &&
              item.ageFrom === currentAgeFrom &&
              item.ageTo === currentAgeTo
    );

    if (exists) {
      setErrors(["This sport combination already exists"]);
      return;
    }

    setFormData(prev => ({
      ...prev,
      selectedSports: [...prev.selectedSports, { 
        sport: currentSport, 
        category: currentCategory || "",
        subCategory: currentSubCategory || "",
        ageFrom: currentAgeFrom,
        ageTo: currentAgeTo,
        gender: currentGender
      }]
    }));

    setCurrentSport("");
    setCurrentCategory("");
    setCurrentSubCategory("");
    setCurrentAgeFrom("");
    setCurrentAgeTo("");
    setCurrentGender("Open");
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

  const availableSports = getSportsByType(formData.participationType === "individual" ? "Individual" : "Team");
  const availableCategories = formData.participationType === "individual" && currentSport ? getCategoriesForSport(currentSport) : [];
  const availableSubCategories = formData.participationType === "individual" && currentSport && currentCategory ? getSubCategoriesForSportAndCategory(currentSport, currentCategory) : [];
  const availableAgeGroups = currentSport ? getAgeGroupsForSport(currentSport, formData.participationType === "individual" ? "Individual" : "Team") : AGE_CATEGORIES;

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
              
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                {/* Sport Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Sport *</Label>
                    <Select value={currentSport} onValueChange={(value) => {
                      setCurrentSport(value);
                      setCurrentCategory("");
                      setCurrentSubCategory("");
                    }}>
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
                    <Label>Gender *</Label>
                    <Select value={currentGender} onValueChange={setCurrentGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age From *</Label>
                    <Select value={currentAgeFrom} onValueChange={setCurrentAgeFrom}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose age from" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAgeGroups.map((age) => (
                          <SelectItem key={age} value={age}>
                            {age}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Age To *</Label>
                    <Select value={currentAgeTo} onValueChange={setCurrentAgeTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose age to" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAgeGroups.map((age) => (
                          <SelectItem key={age} value={age}>
                            {age}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category and Sub-Category for Individual Sports */}
                {formData.participationType === "individual" && currentSport && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={currentCategory} onValueChange={(value) => {
                        setCurrentCategory(value);
                        setCurrentSubCategory("");
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose category" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Sub-Category</Label>
                      <Select value={currentSubCategory} onValueChange={setCurrentSubCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose sub-category" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubCategories.map((subCategory) => (
                            <SelectItem key={subCategory.name} value={subCategory.name}>
                              {subCategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button 
                    onClick={addSport}
                    disabled={!currentSport || !currentAgeFrom || !currentAgeTo}
                    className="bg-gradient-primary"
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
                  <div key={index} className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="flex items-center space-x-3 flex-1">
                      <Trophy className="h-4 w-4 text-accent" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{item.sport}</div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {item.category && <div>Category: {item.category}</div>}
                          {item.subCategory && <div>Sub-Category: {item.subCategory}</div>}
                          <div>Age: {item.ageFrom} - {item.ageTo}</div>
                          <div>Gender: {item.gender}</div>
                        </div>
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