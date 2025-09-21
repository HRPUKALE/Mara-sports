import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Plus, X, User, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

interface AddStudentToSportDialogProps {
  onClose: () => void;
  onSave: () => void;
  sportId?: string; // Optional sport ID for direct assignment
  sportName?: string; // Optional sport name for display
}

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  gender: string;
  institutionId: string;
}

interface Sport {
  id: string;
  name: string;
  type: string;
  categories: Array<{
    id: string;
    name: string;
    subCategories: Array<{
      id: string;
      name: string;
      gender: string;
      level: number;
    }>;
  }>;
}

interface SportAssignment {
  sportId: string;
  sportName: string;
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  ageGroup: string;
  gender: string;
}

const AddStudentToSportDialog = ({ onClose, onSave, sportId, sportName }: AddStudentToSportDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [selectedSport, setSelectedSport] = useState(sportId || "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [selectedGender, setSelectedGender] = useState("Open");
  
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  
  const [availableAgeGroups] = useState([
    "Under 12", "12-14", "15-17", "18-20", "21-23", "24-26", "27-29", "30-35", "36-40", "41-45", "46-50", "51+"
  ]);
  
  const genderOptions = ["Open", "Male", "Female"];

  useEffect(() => {
    loadDummyData();
  }, []);

  const loadDummyData = () => {
    const dummyStudents: Student[] = [
      {
        id: "stu1",
        studentId: "STU001",
        firstName: "John",
        lastName: "Doe",
        fullName: "John Doe",
        age: 19,
        gender: "Male",
        institutionId: "inst1"
      },
      {
        id: "stu2",
        studentId: "STU002",
        firstName: "Jane",
        lastName: "Smith",
        fullName: "Jane Smith",
        age: 17,
        gender: "Female",
        institutionId: "inst1"
      },
      {
        id: "stu3",
        studentId: "STU003",
        firstName: "Mike",
        lastName: "Johnson",
        fullName: "Mike Johnson",
        age: 18,
        gender: "Male",
        institutionId: "inst1"
      },
      {
        id: "stu4",
        studentId: "STU004",
        firstName: "Sarah",
        lastName: "Wilson",
        fullName: "Sarah Wilson",
        age: 20,
        gender: "Female",
        institutionId: "inst1"
      },
      {
        id: "stu5",
        studentId: "STU005",
        firstName: "David",
        lastName: "Brown",
        fullName: "David Brown",
        age: 22,
        gender: "Male",
        institutionId: "inst1"
      },
      {
        id: "stu6",
        studentId: "STU006",
        firstName: "Emma",
        lastName: "Davis",
        fullName: "Emma Davis",
        age: 16,
        gender: "Female",
        institutionId: "inst1"
      }
    ];

    const dummySports: Sport[] = [
      {
        id: "1",
        name: "Football",
        type: "Team",
        categories: [
          {
            id: "cat1",
            name: "Men's Football",
            subCategories: [
              { id: "sub1", name: "Under-18", gender: "Male", level: 1 },
              { id: "sub2", name: "Under-21", gender: "Male", level: 2 },
              { id: "sub3", name: "Senior", gender: "Male", level: 3 }
            ]
          },
          {
            id: "cat2",
            name: "Women's Football",
            subCategories: [
              { id: "sub4", name: "Under-18", gender: "Female", level: 1 },
              { id: "sub5", name: "Under-21", gender: "Female", level: 2 },
              { id: "sub6", name: "Senior", gender: "Female", level: 3 }
            ]
          }
        ]
      },
      {
        id: "2",
        name: "Basketball",
        type: "Team",
        categories: [
          {
            id: "cat3",
            name: "Men's Basketball",
            subCategories: [
              { id: "sub7", name: "Under-16", gender: "Male", level: 1 },
              { id: "sub8", name: "Under-19", gender: "Male", level: 2 },
              { id: "sub9", name: "Senior", gender: "Male", level: 3 }
            ]
          },
          {
            id: "cat4",
            name: "Women's Basketball",
            subCategories: [
              { id: "sub10", name: "Under-16", gender: "Female", level: 1 },
              { id: "sub11", name: "Under-19", gender: "Female", level: 2 },
              { id: "sub12", name: "Senior", gender: "Female", level: 3 }
            ]
          }
        ]
      },
      {
        id: "3",
        name: "Tennis",
        type: "Individual",
        categories: [
          {
            id: "cat5",
            name: "Singles",
            subCategories: [
              { id: "sub13", name: "Men's Singles", gender: "Male", level: 1 },
              { id: "sub14", name: "Women's Singles", gender: "Female", level: 1 },
              { id: "sub15", name: "Mixed Singles", gender: "Open", level: 1 }
            ]
          },
          {
            id: "cat6",
            name: "Doubles",
            subCategories: [
              { id: "sub16", name: "Men's Doubles", gender: "Male", level: 2 },
              { id: "sub17", name: "Women's Doubles", gender: "Female", level: 2 },
              { id: "sub18", name: "Mixed Doubles", gender: "Open", level: 2 }
            ]
          }
        ]
      },
      {
        id: "4",
        name: "Swimming",
        type: "Individual",
        categories: [
          {
            id: "cat7",
            name: "Freestyle",
            subCategories: [
              { id: "sub19", name: "50m Freestyle", gender: "Open", level: 1 },
              { id: "sub20", name: "100m Freestyle", gender: "Open", level: 2 },
              { id: "sub21", name: "200m Freestyle", gender: "Open", level: 3 }
            ]
          },
          {
            id: "cat8",
            name: "Backstroke",
            subCategories: [
              { id: "sub22", name: "50m Backstroke", gender: "Open", level: 1 },
              { id: "sub23", name: "100m Backstroke", gender: "Open", level: 2 }
            ]
          }
        ]
      }
    ];

    setStudents(dummyStudents);
    setSports(dummySports);
  };

  useEffect(() => {
    const filtered = students.filter(student =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  useEffect(() => {
    if (selectedSport) {
      const sport = sports.find(s => s.id === selectedSport);
      if (sport) {
        setCategories(sport.categories);
        setSelectedCategory("");
        setSelectedSubCategory("");
      }
    }
  }, [selectedSport, sports]);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        setSubCategories(category.subCategories);
        setSelectedSubCategory("");
      }
    }
  }, [selectedCategory, categories]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInstitutionStudents();
      setStudents(response.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSports = async () => {
    try {
      const response = await apiService.getInstitutionSports();
      setSports(response.data || []);
    } catch (error) {
      console.error("Error fetching sports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sports",
        variant: "destructive",
      });
    }
  };

  const handleStudentSelect = (student: Student) => {
    const isSelected = selectedStudents.some(s => s.id === student.id);
    if (isSelected) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const handleAssignStudents = async () => {
    try {
      setLoading(true);
      setErrors([]);

      if (selectedStudents.length === 0) {
        setErrors(["Please select at least one student"]);
        return;
      }

      if (!selectedSport || !selectedCategory || !selectedSubCategory || !selectedAgeGroup) {
        setErrors(["Please fill in all sport assignment details"]);
        return;
      }

      // Prepare assignment data for all selected students
      const assignments = selectedStudents.map(student => ({
        studentId: student.id,
        sportId: selectedSport,
        categoryId: selectedCategory,
        subCategoryId: selectedSubCategory,
        ageGroup: selectedAgeGroup,
        gender: selectedGender,
      }));

      // Assign sports to all selected students
      await apiService.assignStudentsToSport({
        assignments,
      });

      toast({
        title: "Success",
        description: `${selectedStudents.length} student(s) assigned to sport successfully`,
      });

      onSave();
      onClose();
    } catch (error) {
      console.error("Error assigning students:", error);
      toast({
        title: "Error",
        description: "Failed to assign students to sport",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const getGenderColor = (gender: string) => {
    switch (gender) {
      case "Male": return "bg-blue-100 text-blue-800";
      case "Female": return "bg-pink-100 text-pink-800";
      case "Open": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>
            {sportName ? `Add Students to ${sportName}` : "Add Students to Sport"}
          </DialogTitle>
        </DialogHeader>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Students</h3>
            {selectedStudents.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedStudents.length} student(s) selected
              </div>
            )}
            
            {/* Search Students */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Students List */}
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading students...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No students found</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedStudents.some(s => s.id === student.id);
                    return (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleStudentSelect(student)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border-2 ${
                            isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                          }`}>
                            {isSelected && (
                              <div className="w-full h-full flex items-center justify-center text-white text-xs">
                                ✓
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{student.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {student.studentId} • Age: {student.age} • 
                              <span className={`ml-1 px-2 py-0.5 rounded text-xs ${getGenderColor(student.gender)}`}>
                                {student.gender}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Students Info */}
            {selectedStudents.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <div className="font-medium">Selected Students ({selectedStudents.length})</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map((student) => (
                    <div key={student.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded text-sm">
                      <span className="font-medium">{student.fullName}</span>
                      <span className="text-muted-foreground">({student.studentId})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sport Assignment */}
          {selectedStudents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sport Details</h3>
              
              {/* Sport Selection Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {!sportId && (
                  <div className="space-y-2">
                    <Label htmlFor="sport">Sport *</Label>
                    <Select value={selectedSport} onValueChange={setSelectedSport}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name} ({sport.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {sportId && (
                  <div className="space-y-2">
                    <Label>Sport</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="font-medium">{sportName}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                    disabled={!selectedSport}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subCategory">Sub-Category *</Label>
                  <Select 
                    value={selectedSubCategory} 
                    onValueChange={setSelectedSubCategory}
                    disabled={!selectedCategory || subCategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((subCategory) => (
                        <SelectItem key={subCategory.id} value={subCategory.id}>
                          {subCategory.name} ({subCategory.gender})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group *</Label>
                  <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAgeGroups.map((ageGroup) => (
                        <SelectItem key={ageGroup} value={ageGroup}>
                          {ageGroup}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignStudents} 
            disabled={loading || selectedStudents.length === 0 || !selectedSport || !selectedCategory || !selectedSubCategory || !selectedAgeGroup}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Add {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentToSportDialog;