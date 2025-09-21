import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Plus, Trash2, Users, Trophy, Target } from "lucide-react";
import { 
  SPORT_TYPES, 
  TEAM_SPORTS, 
  INDIVIDUAL_SPORTS,
  getSportsByType,
  getCategoriesForSport,
  getSubCategoriesForSportAndCategory,
  getAgeGroupsForSport
} from "@/lib/sportsData";

interface SportStudentAddStepProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

interface Student {
  firstName: string;
  middleName: string;
  lastName: string;
  studentId: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
}

interface SportTeam {
  id: string;
  sportType: string;
  sport: string;
  category: string;
  subCategory: string;
  ageFrom: string;
  ageTo: string;
  gender: string;
  students: Student[];
  maxStudents: number;
}

const genderOptions = ["Male", "Female", "Other"];

export const SportStudentAddStep = ({ initialData, onComplete, onBack }: SportStudentAddStepProps) => {
  const [sportTeams, setSportTeams] = useState<SportTeam[]>(initialData?.sportTeams || []);
  const [currentSportType, setCurrentSportType] = useState("Individual");
  const [currentSport, setCurrentSport] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentSubCategory, setCurrentSubCategory] = useState("");
  const [currentAgeFrom, setCurrentAgeFrom] = useState("");
  const [currentAgeTo, setCurrentAgeTo] = useState("");
  const [currentGender, setCurrentGender] = useState("Open");
  
  const [currentStudent, setCurrentStudent] = useState<Student>({
    firstName: "",
    middleName: "",
    lastName: "",
    studentId: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
  });
  
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  // Get available data based on selections
  const availableSports = getSportsByType(currentSportType);
  const availableCategories = currentSport ? getCategoriesForSport(currentSport) : [];
  const availableSubCategories = currentSport && currentCategory ? getSubCategoriesForSportAndCategory(currentSport, currentCategory) : [];
  const availableAgeGroups = currentSport ? getAgeGroupsForSport(currentSport, currentSportType) : [];

  // Get sport details for validation
  const getSportDetails = (sportName: string, sportType: string) => {
    if (sportType === "Team") {
      return TEAM_SPORTS[sportName as keyof typeof TEAM_SPORTS];
    } else if (sportType === "Individual") {
      return INDIVIDUAL_SPORTS[sportName as keyof typeof INDIVIDUAL_SPORTS];
    }
    return null;
  };

  // Get maximum students allowed for a sport
  const getMaxStudents = (sportName: string, sportType: string, subCategory: string) => {
    const sportDetails = getSportDetails(sportName, sportType);
    if (!sportDetails) return 1;

    if (sportType === "Individual") {
      // Individual sports typically allow 1 student per sub-category
      // Exception: Some individual sports like Tennis Team allow 4 players
      if (sportName === "Tennis" && subCategory === "Team") return 4;
      if (sportName === "Badminton" && subCategory === "Team") return 4;
      if (sportName === "Table Tennis" && subCategory === "Team") return 4;
      if (sportName === "Padel" && subCategory === "Team") return 4;
      return 1;
    } else if (sportType === "Team") {
      // Team sports have specific player counts
      if (sportName === "Football") return 7;
      if (sportName === "Basketball") return 5;
      if (sportName === "Volleyball") return 6;
      if (sportName === "Hockey") return 7;
      if (sportName === "Netball") return 7;
      if (sportName === "Rugby (7s)") return 7;
      if (sportName === "Handball") return 7;
      if (sportName === "Cricket") return 11; // Standard cricket team
      return 7; // Default for team sports
    }
    return 1;
  };

  const addSportTeam = () => {
    const newErrors: string[] = [];
    
    if (!currentSport) newErrors.push("Please select a sport");
    if (!currentAgeFrom) newErrors.push("Please select age from");
    if (!currentAgeTo) newErrors.push("Please select age to");
    if (!currentGender) newErrors.push("Please select gender");
    
    // Validate age range
    if (currentAgeFrom && currentAgeTo) {
      const ageFromIndex = availableAgeGroups.indexOf(currentAgeFrom);
      const ageToIndex = availableAgeGroups.indexOf(currentAgeTo);
      if (ageFromIndex > ageToIndex) {
        newErrors.push("Age 'From' must be less than or equal to Age 'To'");
      }
    }
    
    // Check for duplicates
    const duplicate = sportTeams.find(
      team => team.sport === currentSport && 
              team.category === currentCategory && 
              team.subCategory === currentSubCategory &&
              team.ageFrom === currentAgeFrom &&
              team.ageTo === currentAgeTo &&
              team.gender === currentGender
    );
    if (duplicate) newErrors.push("This sport combination is already added");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const maxStudents = getMaxStudents(currentSport, currentSportType, currentSubCategory);
    const newTeam: SportTeam = {
      id: `team_${Date.now()}`,
      sportType: currentSportType,
      sport: currentSport,
      category: currentCategory || "",
      subCategory: currentSubCategory || "",
      ageFrom: currentAgeFrom,
      ageTo: currentAgeTo,
      gender: currentGender,
      students: [],
      maxStudents
    };

    setSportTeams(prev => [...prev, newTeam]);
    
    // Reset form
    setCurrentSport("");
    setCurrentCategory("");
    setCurrentSubCategory("");
    setCurrentAgeFrom("");
    setCurrentAgeTo("");
    setCurrentGender("Open");
    setErrors([]);
  };

  const removeSportTeam = (teamId: string) => {
    setSportTeams(prev => prev.filter(team => team.id !== teamId));
  };

  const handleStudentInputChange = (field: keyof Student, value: string) => {
    setCurrentStudent(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateStudentForm = () => {
    const newErrors: string[] = [];
    
    if (!currentStudent.firstName) newErrors.push("First Name is required");
    if (!currentStudent.lastName) newErrors.push("Last Name is required");
    if (!currentStudent.studentId) newErrors.push("Student ID is required");
    if (!currentStudent.email) newErrors.push("Email is required");
    if (!currentStudent.dateOfBirth) newErrors.push("Date of Birth is required");
    if (!currentStudent.gender) newErrors.push("Gender is required");
    if (!currentStudent.phoneNumber) newErrors.push("Phone Number is required");
    
    if (!selectedTeamId) newErrors.push("Please select a sport team");
    
    // Check for duplicate student ID across all teams
    const duplicateId = sportTeams.some(team => 
      team.students.some(student => student.studentId === currentStudent.studentId)
    );
    if (duplicateId) newErrors.push("Student ID already exists");
    
    // Check for duplicate email across all teams
    const duplicateEmail = sportTeams.some(team => 
      team.students.some(student => student.email === currentStudent.email)
    );
    if (duplicateEmail) newErrors.push("Email address already exists");

    return newErrors;
  };

  const addStudentToTeam = () => {
    const validationErrors = validateStudentForm();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const selectedTeam = sportTeams.find(team => team.id === selectedTeamId);
    if (!selectedTeam) {
      setErrors(["Selected team not found"]);
      return;
    }

    if (selectedTeam.students.length >= selectedTeam.maxStudents) {
      setErrors([`Maximum ${selectedTeam.maxStudents} students allowed for ${selectedTeam.sport}`]);
      return;
    }

    setSportTeams(prev => prev.map(team => 
      team.id === selectedTeamId 
        ? { ...team, students: [...team.students, currentStudent] }
        : team
    ));

    setCurrentStudent({
      firstName: "",
      middleName: "",
      lastName: "",
      studentId: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      phoneNumber: "",
    });
    setSelectedTeamId("");
    setErrors([]);
  };

  const removeStudentFromTeam = (teamId: string, studentIndex: number) => {
    setSportTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, students: team.students.filter((_, index) => index !== studentIndex) }
        : team
    ));
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (sportTeams.length === 0) {
      newErrors.push("Please add at least one sport team");
    }

    // Check if all teams have the required number of students
    for (const team of sportTeams) {
      if (team.students.length === 0) {
        newErrors.push(`${team.sport} team must have at least one student`);
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete({ sportTeams });
    }
  };

  const getTotalStudents = () => {
    return sportTeams.reduce((total, team) => total + team.students.length, 0);
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

      {/* Sport Team Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Select Sport & Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sportType">Sport Type *</Label>
              <Select 
                value={currentSportType} 
                onValueChange={(value) => {
                  setCurrentSportType(value);
                  setCurrentSport("");
                  setCurrentCategory("");
                  setCurrentSubCategory("");
                  setCurrentAgeFrom("");
                  setCurrentAgeTo("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport type" />
                </SelectTrigger>
                <SelectContent>
                  {SPORT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Sport *</Label>
              <Select 
                value={currentSport} 
                onValueChange={(value) => {
                  setCurrentSport(value);
                  setCurrentCategory("");
                  setCurrentSubCategory("");
                  setCurrentAgeFrom("");
                  setCurrentAgeTo("");
                }}
                disabled={!currentSportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  {availableSports.map((sport) => (
                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={currentCategory} 
                onValueChange={(value) => {
                  setCurrentCategory(value);
                  setCurrentSubCategory("");
                }}
                disabled={!currentSport}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategory">Sub-Category</Label>
              <Select 
                value={currentSubCategory} 
                onValueChange={setCurrentSubCategory}
                disabled={!currentCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-category" />
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

            <div className="space-y-2">
              <Label htmlFor="ageFrom">Age From *</Label>
              <Select 
                value={currentAgeFrom} 
                onValueChange={setCurrentAgeFrom}
                disabled={!currentSport}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age from" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgeGroups.map((age) => (
                    <SelectItem key={age} value={age}>{age}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageTo">Age To *</Label>
              <Select 
                value={currentAgeTo} 
                onValueChange={setCurrentAgeTo}
                disabled={!currentSport}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age to" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgeGroups.map((age) => (
                    <SelectItem key={age} value={age}>{age}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select 
                value={currentGender} 
                onValueChange={setCurrentGender}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentSport && currentAgeFrom && currentAgeTo && currentGender && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Sport Info:</strong> {currentSport} ({currentSportType}) - 
                Maximum {getMaxStudents(currentSport, currentSportType, currentSubCategory)} student(s) allowed
                {currentSubCategory && ` for ${currentSubCategory}`}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={addSportTeam}
              disabled={!currentSport || !currentAgeFrom || !currentAgeTo || !currentGender}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sport Team
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Addition */}
      {sportTeams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Students to Teams
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamSelect">Select Team *</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team to add students" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.sport} - {team.subCategory || team.category} ({team.students.length}/{team.maxStudents})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={currentStudent.firstName}
                  onChange={(e) => handleStudentInputChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={currentStudent.middleName}
                  onChange={(e) => handleStudentInputChange("middleName", e.target.value)}
                  placeholder="Enter middle name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={currentStudent.lastName}
                  onChange={(e) => handleStudentInputChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  value={currentStudent.studentId}
                  onChange={(e) => handleStudentInputChange("studentId", e.target.value)}
                  placeholder="Enter student ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentStudent.email}
                  onChange={(e) => handleStudentInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={currentStudent.dateOfBirth}
                  onChange={(e) => handleStudentInputChange("dateOfBirth", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={currentStudent.gender} onValueChange={(value) => handleStudentInputChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={currentStudent.phoneNumber}
                  onChange={(e) => handleStudentInputChange("phoneNumber", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={addStudentToTeam}
                disabled={!selectedTeamId || !currentStudent.firstName || !currentStudent.lastName || !currentStudent.studentId || !currentStudent.email || !currentStudent.dateOfBirth || !currentStudent.gender || !currentStudent.phoneNumber}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student to Team
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sport Teams Overview */}
      {sportTeams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sport Teams ({sportTeams.length}) - Total Students: {getTotalStudents()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sportTeams.map((team) => (
              <div key={team.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <h3 className="font-semibold">{team.sport}</h3>
                    <Badge variant="outline">{team.sportType}</Badge>
                    {team.category && <Badge variant="secondary">{team.category}</Badge>}
                    {team.subCategory && <Badge variant="default">{team.subCategory}</Badge>}
                    <span className="text-sm text-muted-foreground">
                      {team.ageFrom} - {team.ageTo} | {team.gender}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {team.students.length}/{team.maxStudents} students
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSportTeam(team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {team.students.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Date of Birth</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead className="w-16">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team.students.map((student, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {`${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`}
                            </TableCell>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.dateOfBirth}</TableCell>
                            <TableCell>{student.gender}</TableCell>
                            <TableCell>{student.phoneNumber}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeStudentFromTeam(team.id, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={sportTeams.length === 0 || getTotalStudents() === 0}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
};
