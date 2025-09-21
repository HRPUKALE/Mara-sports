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
  FileText,
  Eye,
  CheckCircle,
  FileImage
} from "lucide-react";

const InstitutionStudentManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStudentDetailsDialog, setShowStudentDetailsDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    studentId: "",
    studentIdImage: null as File | null,
    ageProofDocument: null as File | null,
  });
  

  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    studentId: "",
    studentIdImage: null as File | null,
    ageProofDocument: null as File | null,
  });


  // Mock student data
  const students = [
    { 
      id: 1, 
      name: "John Smith", 
      age: 19, 
      gender: "Male", 
      email: "john@example.com", 
      phone: "9876543210", 
      studentId: "ST001", 
      sports: ["Football", "Tennis"], 
      status: "Active",
      studentIdImage: "https://example.com/documents/john-student-id.pdf",
      ageProofImage: "https://example.com/documents/john-birth-cert.pdf"
    },
    { 
      id: 2, 
      name: "Sarah Davis", 
      age: 18, 
      gender: "Female", 
      email: "sarah@example.com", 
      phone: "9876543211", 
      studentId: "ST002", 
      sports: ["Basketball"], 
      status: "Active",
      studentIdImage: "https://example.com/documents/sarah-student-id.pdf",
      ageProofImage: null
    },
    { 
      id: 3, 
      name: "Mike Johnson", 
      age: 20, 
      gender: "Male", 
      email: "mike@example.com", 
      phone: "9876543212", 
      studentId: "ST003", 
      sports: ["Swimming", "Athletics"], 
      status: "Pending",
      studentIdImage: null,
      ageProofImage: "https://example.com/documents/mike-birth-cert.pdf"
    },
    { 
      id: 4, 
      name: "Emily Brown", 
      age: 19, 
      gender: "Female", 
      email: "emily@example.com", 
      phone: "9876543213", 
      studentId: "ST004", 
      sports: ["Tennis"], 
      status: "Active",
      studentIdImage: null,
      ageProofImage: null
    },
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
      sport: "",
      subCategory: "",
    });
    setShowAddDialog(false);
  };

  const startEditStudent = (student: any) => {
    setEditingStudent(student);
    setShowEditDialog(true);
  };

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    setShowStudentDetailsDialog(true);
  };

  const handleEditFromModal = (student: any) => {
    setSelectedStudent(null);
    setShowStudentDetailsDialog(false);
    setEditingStudent(student);
    
    // Populate edit form with student data
    const nameParts = student.name.split(' ');
    setEditForm({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(' ') || "",
      email: student.email || "",
      phone: student.phone || "",
      dateOfBirth: student.dateOfBirth || "",
      gender: student.gender || "",
      studentId: student.studentId || "",
      studentIdImage: student.studentIdImage || null,
      ageProofDocument: student.ageProofDocument || null,
    });
    
    setShowEditDialog(true);
  };

  const handleDeleteFromModal = (student: any) => {
    // Handle delete logic here
    console.log("Deleting student:", student);
    toast({
      title: "Student Deleted",
      description: "Student has been successfully deleted.",
    });
    setShowStudentDetailsDialog(false);
    setSelectedStudent(null);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update the student data with form values
    if (editingStudent) {
      // Here you would typically update the student in your data store/API
      console.log("Updated student data:", editForm);
      
      toast({ 
        title: "Student updated", 
        description: `${editForm.firstName} ${editForm.lastName} has been updated successfully.` 
      });
    }
    
    setShowEditDialog(false);
    setEditingStudent(null);
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
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
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

                {/* Document Upload Fields */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-smooth">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {newStudent.studentIdImage ? (
                            <CheckCircle className="h-5 w-5 text-accent" />
                          ) : (
                            <Upload className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="studentIdImage" className="text-sm font-medium cursor-pointer">
                          Student ID Image *
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a clear photo of the student ID card
                        </p>
                        <Input
                          id="studentIdImage"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setNewStudent(prev => ({ ...prev, studentIdImage: e.target.files?.[0] || null }))}
                          className="mt-2"
                          required
                        />
                        {newStudent.studentIdImage && (
                          <div className="mt-2 flex items-center space-x-2 text-xs">
                            <FileImage className="h-3 w-3 text-accent" />
                            <span className="text-accent font-medium">{newStudent.studentIdImage.name}</span>
                            <span className="text-muted-foreground">({Math.round(newStudent.studentIdImage.size / 1024)}KB)</span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Accepted formats: JPG, PNG, PDF • Max size: 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-smooth">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {newStudent.ageProofDocument ? (
                            <CheckCircle className="h-5 w-5 text-accent" />
                          ) : (
                            <Upload className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="ageProofDocument" className="text-sm font-medium cursor-pointer">
                          Age Proof Document *
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload birth certificate or age verification document
                        </p>
                        <Input
                          id="ageProofDocument"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setNewStudent(prev => ({ ...prev, ageProofDocument: e.target.files?.[0] || null }))}
                          className="mt-2"
                          required
                        />
                        {newStudent.ageProofDocument && (
                          <div className="mt-2 flex items-center space-x-2 text-xs">
                            <FileImage className="h-3 w-3 text-accent" />
                            <span className="text-accent font-medium">{newStudent.ageProofDocument.name}</span>
                            <span className="text-muted-foreground">({Math.round(newStudent.ageProofDocument.size / 1024)}KB)</span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Accepted formats: JPG, PNG, PDF • Max size: 10MB
                        </p>
                      </div>
                    </div>
                  </div>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow 
                  key={student.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleStudentClick(student)}
                >
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student profile and sports category.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="editFirstName"
                    placeholder="Enter first name"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="editLastName"
                    placeholder="Enter last name"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={editForm.gender} onValueChange={(value) => setEditForm(prev => ({ ...prev, gender: value }))}>
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
                <Label htmlFor="editDob">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="editDob"
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="editEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="editPhone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStudentId">Student ID</Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="editStudentId"
                  placeholder="Enter student ID"
                  value={editForm.studentId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, studentId: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Document Upload Fields */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-smooth">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {editForm.studentIdImage ? (
                        <CheckCircle className="h-5 w-5 text-accent" />
                      ) : (
                        <Upload className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="editStudentIdImage" className="text-sm font-medium cursor-pointer">
                      Student ID Image
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a clear photo of the student ID card
                    </p>
                    <Input
                      id="editStudentIdImage"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setEditForm(prev => ({ ...prev, studentIdImage: e.target.files?.[0] || null }))}
                      className="mt-2"
                    />
                    {editForm.studentIdImage && (
                      <div className="mt-2 flex items-center space-x-2 text-xs">
                        <FileImage className="h-3 w-3 text-accent" />
                        <span className="text-accent font-medium">{editForm.studentIdImage.name}</span>
                        <span className="text-muted-foreground">({Math.round(editForm.studentIdImage.size / 1024)}KB)</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Accepted formats: JPG, PNG, PDF • Max size: 10MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-smooth">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {editForm.ageProofDocument ? (
                        <CheckCircle className="h-5 w-5 text-accent" />
                      ) : (
                        <Upload className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="editAgeProofDocument" className="text-sm font-medium cursor-pointer">
                      Age Proof Document
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload birth certificate or age verification document
                    </p>
                    <Input
                      id="editAgeProofDocument"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setEditForm(prev => ({ ...prev, ageProofDocument: e.target.files?.[0] || null }))}
                      className="mt-2"
                    />
                    {editForm.ageProofDocument && (
                      <div className="mt-2 flex items-center space-x-2 text-xs">
                        <FileImage className="h-3 w-3 text-accent" />
                        <span className="text-accent font-medium">{editForm.ageProofDocument.name}</span>
                        <span className="text-muted-foreground">({Math.round(editForm.ageProofDocument.size / 1024)}KB)</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Accepted formats: JPG, PNG, PDF • Max size: 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Details Modal */}
      <Dialog open={showStudentDetailsDialog} onOpenChange={setShowStudentDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              View and manage student information
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Profile Section */}
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {selectedStudent.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                  <p className="text-muted-foreground">Student ID: {selectedStudent.studentId}</p>
                  <Badge variant={selectedStudent.status === "Active" ? "default" : "secondary"}>
                    {selectedStudent.status}
                  </Badge>
                </div>
              </div>

              {/* Student Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Personal Information</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedStudent.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedStudent.age} years old</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Gender:</span>
                        <span className="text-sm">{selectedStudent.gender}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contact Information</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedStudent.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Sports Registration</Label>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.sports.map((sport: string) => (
                          <Badge key={sport} variant="secondary" className="text-xs">
                            {sport}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Registration Status</Label>
                    <div className="mt-2">
                      <Badge variant={selectedStudent.status === "Active" ? "default" : "secondary"}>
                        {selectedStudent.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-muted-foreground">Uploaded Documents</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student ID Document */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Student ID Document</h4>
                    {selectedStudent.studentIdImage ? (
                      <div className="border-2 border-dashed border-green-200 bg-green-50 rounded-lg p-4 text-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-xs text-green-700 mb-3 font-medium">
                          Student ID uploaded successfully
                        </p>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(selectedStudent.studentIdImage, '_blank')}
                            className="w-full"
                          >
                            <Eye className="h-3 w-3 mr-2" />
                            View Document
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = selectedStudent.studentIdImage;
                              link.download = `student-id-${selectedStudent.studentId}.pdf`;
                              link.click();
                            }}
                            className="w-full"
                          >
                            <Download className="h-3 w-3 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">
                          No Student ID document uploaded
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Student has not uploaded this document
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Age Proof Document */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Age Proof Document</h4>
                    {selectedStudent.ageProofImage ? (
                      <div className="border-2 border-dashed border-green-200 bg-green-50 rounded-lg p-4 text-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-xs text-green-700 mb-3 font-medium">
                          Age proof uploaded successfully
                        </p>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(selectedStudent.ageProofImage, '_blank')}
                            className="w-full"
                          >
                            <Eye className="h-3 w-3 mr-2" />
                            View Document
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = selectedStudent.ageProofImage;
                              link.download = `age-proof-${selectedStudent.studentId}.pdf`;
                              link.click();
                            }}
                            className="w-full"
                          >
                            <Download className="h-3 w-3 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">
                          No Age Proof document uploaded
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Student has not uploaded this document
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowStudentDetailsDialog(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleEditFromModal(selectedStudent)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteFromModal(selectedStudent)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionStudentManagement;