import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  UserPlus, 
  Upload, 
  Search, 
  Filter, 
  Download,
  Edit,
  Trash2,
  Mail,
  User,
  Calendar,
  Phone,
  IdCard,
  FileText
} from "lucide-react";

const InstitutionStudentManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  

  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    studentId: "",
    sports: [] as string[],
  });

  // Mock student data
  const students = [
    { id: 1, name: "John Smith", age: 19, gender: "Male", email: "john@example.com", phone: "9876543210", studentId: "ST001", sports: ["Football", "Tennis"], status: "Active" },
    { id: 2, name: "Sarah Davis", age: 18, gender: "Female", email: "sarah@example.com", phone: "9876543211", studentId: "ST002", sports: ["Basketball"], status: "Active" },
    { id: 3, name: "Mike Johnson", age: 20, gender: "Male", email: "mike@example.com", phone: "9876543212", studentId: "ST003", sports: ["Swimming", "Athletics"], status: "Pending" },
    { id: 4, name: "Emily Brown", age: 19, gender: "Female", email: "emily@example.com", phone: "9876543213", studentId: "ST004", sports: ["Tennis"], status: "Active" },
  ];

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Student Added Successfully",
      description: `${newStudent.firstName} ${newStudent.lastName} has been added to the system.`,
    });
    setNewStudent({
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      studentId: "",
      sports: [],
    });
    setShowAddDialog(false);
  };


  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterSport === "all" || filterSport === "" || student.sports.some(sport => sport.toLowerCase().includes(filterSport.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground">Add and manage student registrations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter student details for sports registration
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={newStudent.firstName}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, firstName: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={newStudent.lastName}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, lastName: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={newStudent.gender} onValueChange={(value) => setNewStudent(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="dob"
                        type="date"
                        value={newStudent.dateOfBirth}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="studentId"
                      placeholder="Enter student ID"
                      value={newStudent.studentId}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, studentId: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sports Information</Label>
                  <Select value={newStudent.sports[0] || ""} onValueChange={(value) => setNewStudent(prev => ({ ...prev, sports: [value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                      <SelectItem value="Tennis">Tennis</SelectItem>
                      <SelectItem value="Swimming">Swimming</SelectItem>
                      <SelectItem value="Athletics">Athletics</SelectItem>
                      <SelectItem value="Badminton">Badminton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-primary">
                    Add Student
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterSport} onValueChange={setFilterSport}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="swimming">Swimming</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            {filteredStudents.length} students found
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Student</TableHead>
                <TableHead className="min-w-[200px] hidden sm:table-cell">Contact</TableHead>
                <TableHead className="min-w-[150px]">Sports</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm sm:text-base">{student.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {student.age} years • {student.gender} • {student.studentId}
                      </p>
                      <div className="sm:hidden mt-1">
                        <p className="text-xs">{student.email}</p>
                        <p className="text-xs text-muted-foreground">{student.phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div>
                      <p className="text-sm truncate max-w-[150px]">{student.email}</p>
                      <p className="text-sm text-muted-foreground">{student.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.sports.map((sport) => (
                        <Badge key={sport} variant="secondary" className="text-xs">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === "Active" ? "default" : "secondary"} className="text-xs">
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" title="Edit Student">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Delete Student" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstitutionStudentManagement;