import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Plus, Trash2 } from "lucide-react";

interface SportsSubCategoriesStepProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

const sportsList = [
  "Football", "Basketball", "Cricket", "Badminton", "Tennis", "Table Tennis",
  "Volleyball", "Hockey", "Athletics", "Swimming", "Chess", "Cycling"
];

const subCategoriesMap: Record<string, string[]> = {
  "Football": ["Under-12", "Under-15", "Under-18", "Senior"],
  "Basketball": ["Under-14", "Under-17", "Under-19", "Senior"],
  "Cricket": ["Under-13", "Under-16", "Under-19", "Senior"],
  "Badminton": ["Under-12", "Under-15", "Under-17", "Senior"],
  "Tennis": ["Under-12", "Under-14", "Under-16", "Under-18", "Senior"],
  "Table Tennis": ["Under-11", "Under-13", "Under-15", "Under-17", "Senior"],
  "Volleyball": ["Under-14", "Under-17", "Under-19", "Senior"],
  "Hockey": ["Under-13", "Under-16", "Under-18", "Senior"],
  "Athletics": ["Under-12", "Under-14", "Under-16", "Under-18", "Senior"],
  "Swimming": ["Under-10", "Under-12", "Under-14", "Under-16", "Senior"],
  "Chess": ["Under-8", "Under-10", "Under-12", "Under-14", "Under-16", "Senior"],
  "Cycling": ["Under-12", "Under-15", "Under-18", "Senior"]
};

export const SportsSubCategoriesStep = ({ initialData, onComplete, onBack }: SportsSubCategoriesStepProps) => {
  const [selectedSports, setSelectedSports] = useState<Array<{sport: string, subCategory: string}>>(
    initialData?.selectedSports || []
  );
  const [currentSport, setCurrentSport] = useState("");
  const [currentSubCategory, setCurrentSubCategory] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const availableSubCategories = currentSport ? subCategoriesMap[currentSport] || [] : [];

  const addSport = () => {
    const newErrors: string[] = [];
    
    if (!currentSport) newErrors.push("Please select a sport");
    if (!currentSubCategory) newErrors.push("Please select a sub-category");
    
    // Check for duplicates
    const duplicate = selectedSports.find(
      item => item.sport === currentSport && item.subCategory === currentSubCategory
    );
    if (duplicate) newErrors.push("This sport and sub-category combination is already added");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setSelectedSports(prev => [...prev, { sport: currentSport, subCategory: currentSubCategory }]);
    setCurrentSport("");
    setCurrentSubCategory("");
    setErrors([]);
  };

  const removeSport = (index: number) => {
    setSelectedSports(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (selectedSports.length === 0) {
      newErrors.push("Please add at least one sport and sub-category");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete({ selectedSports });
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Add Sports & Sub-Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sport">Sport</Label>
              <Select value={currentSport} onValueChange={(value) => {
                setCurrentSport(value);
                setCurrentSubCategory(""); // Reset sub-category when sport changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  {sportsList.map((sport) => (
                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategory">Sub-Category</Label>
              <Select 
                value={currentSubCategory} 
                onValueChange={setCurrentSubCategory}
                disabled={!currentSport}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={addSport}
                className="w-full"
                disabled={!currentSport || !currentSubCategory}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Sports & Sub-Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sport</TableHead>
                  <TableHead>Sub-Category</TableHead>
                  <TableHead className="w-16">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedSports.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.sport}</TableCell>
                    <TableCell>{item.subCategory}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSport(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
};