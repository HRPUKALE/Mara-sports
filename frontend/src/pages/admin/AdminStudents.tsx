import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Filter, Eye, Edit, Trash2, Download, User, Building2, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const AdminStudents = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState<any>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    student_id: "",
    institution_type: "",
    institution_name: "",
  });
  
  // State for API data
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch students data
  const fetchStudents = async () => {
    try {
      const response = await apiService.getAdminStudents({
        search: searchTerm || undefined,
        institution: selectedInstitution !== "all" ? selectedInstitution : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, selectedInstitution, selectedStatus]);

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowStudentDialog(true);
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setEditForm({
      first_name: student.first_name || "",
      middle_name: student.middle_name || "",
      last_name: student.last_name || "",
      email: student.email || "",
      student_id: student.student_id || "",
      institution_type: student.institution_type || "",
      institution_name: student.institution_name || "",
    });
    setShowEditDialog(true);
  };

  const handleSaveStudent = async () => {
    try {
      await apiService.updateStudent(selectedStudent.id, editForm);
      toast({ title: "Updated", description: "Student updated successfully" });
      setShowEditDialog(false);
      fetchStudents();
    } catch (e) {
      toast({ title: "Error", description: "Failed to update student", variant: "destructive" });
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    // TODO: Implement delete student functionality
    toast({
      title: "Feature Coming Soon",
      description: "Delete student functionality will be implemented soon.",
    });
  };

  const exportStudents = () => {
    // TODO: Implement export functionality
    toast({
      title: "Feature Coming Soon",
      description: "Export functionality will be implemented soon.",
    });
  };

  const handleAddStudent = async () => {
    try {
      const payload = {
        first_name: addForm.first_name,
        middle_name: addForm.middle_name,
        last_name: addForm.last_name,
        email: addForm.email,
        student_id: addForm.student_id,
        institution_name: addForm.institution_name,
        institution_type: addForm.institution_type,
      };
      await apiService.createStudent(payload);
      toast({ title: "Created", description: "Student added successfully" });
      setShowAddDialog(false);
      setAddForm({ first_name: "", middle_name: "", last_name: "", email: "", student_id: "", institution_type: "", institution_name: "" });
      fetchStudents();
    } catch (e) {
      toast({ title: "Error", description: "Failed to add student", variant: "destructive" });
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading students data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Manage student registrations and profiles</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportStudents} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <User className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Institutions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Institutions</SelectItem>
            {/* TODO: Add dynamic institution options */}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Students</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {students.length} students
            </span>
          </div>
        </div>

        {students.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || selectedInstitution !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No students have been registered yet."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{student.full_name}</h3>
                        <Badge className={getStatusColor(student.is_active)}>
                          {student.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>ID: {student.student_id || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{student.institution_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Joined: {new Date(student.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Email:</span> {student.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStudent(student)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStudent(student)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Student Details Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              View and manage student information
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedStudent.full_name}</p>
                    <p><span className="font-medium">Student ID:</span> {selectedStudent.student_id || "N/A"}</p>
                    <p><span className="font-medium">Email:</span> {selectedStudent.email}</p>
                    <p><span className="font-medium">Gender:</span> {selectedStudent.gender || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Institution Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Institution:</span> {selectedStudent.institution_name}</p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedStudent.is_active)}`}>
                        {selectedStudent.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Joined:</span> {new Date(selectedStudent.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="flex gap-2">
                  <Button onClick={() => handleEditStudent(selectedStudent)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Student
                  </Button>
                  <Button variant="outline" onClick={() => setShowStudentDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>Add a new student with basic details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>First Name</Label>
                <Input value={addForm.first_name} onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })} />
              </div>
              <div>
                <Label>Middle Name</Label>
                <Input value={addForm.middle_name} onChange={(e) => setAddForm({ ...addForm, middle_name: e.target.value })} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={addForm.last_name} onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
              </div>
              <div>
                <Label>Student ID</Label>
                <Input value={addForm.student_id} onChange={(e) => setAddForm({ ...addForm, student_id: e.target.value })} />
              </div>
              <div />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Institute Type</Label>
                <Select value={addForm.institution_type} onValueChange={(v) => setAddForm({ ...addForm, institution_type: v, institution_name: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kaiso School">Kaiso School</SelectItem>
                    <SelectItem value="Goverment School">Goverment School</SelectItem>
                    <SelectItem value="Academics">Academics</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Institute Name</Label>
                {addForm.institution_type === "Other" ? (
                  <Input value={addForm.institution_name} onChange={(e) => setAddForm({ ...addForm, institution_name: e.target.value })} />
                ) : (
                  <Select value={addForm.institution_name} onValueChange={(v) => setAddForm({ ...addForm, institution_name: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select name" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {(addForm.institution_type === "Kaiso School" ? [
                        "Aga Khan Academy",
                        "Braeburn Garden Estate - BGE",
                        "Braeburn Gitanga Road - BGR",
                        "Braeside School, Thika",
                        "Braeside School, Lavington",
                        "Brookhouse School, Karen",
                        "Brookhouse School, Runda",
                        "Brookhurst International, Lavington",
                        "Brookhurst International, Kiserian",
                        "Crawford International School",
                        "The Banda School",
                        "French School",
                        "German School",
                        "Jawabu School",
                        "Light International School",
                        "Makini Cambridge School",
                        "Nairobi Academy",
                        "Nairobi Jaffery Academy",
                        "Oshwal Academy U15 & U17",
                        "Oshwal Academy U17 & U19",
                        "Peponi School (overall)",
                        "Peponi School (Girls Sport)",
                        "Peponi School (Boys Sport)",
                        "Rosslyn Academy (overall)",
                        "Kenton College",
                        "Rusinga School",
                        "SABIS International School",
                        "St Austin's Academy",
                        "St. Christopher's School",
                        "Swedish School",
                        "Woodcreek School",
                        "West Nairobi School - WNS",
                        "ISK",
                        "Durham International School - DIS",
                      ] : addForm.institution_type === "Goverment School" ? [
                        "MBAGATHI ROAD PRIMARY",
                        "NEMBU PRIMARY",
                        "KAWANGWARE PRIMARY",
                        "TOI PRIMARY",
                        "RIRUTA HGM PRIMARY",
                      ] : addForm.institution_type === "Academics" ? [
                        "Talanta",
                        "JB Academy",
                        "Muqs",
                        "Bumble Bee Sports",
                        "Discovery Tennis",
                        "TY SPORTS",
                        "Terriffic Tennis",
                        "TY SPORTS",
                        "Next Gen Multi Sport Academu",
                      ] : []).map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddStudent}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student details including sports.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>First Name</Label>
                <Input value={editForm.first_name || ""} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
              </div>
              <div>
                <Label>Middle Name</Label>
                <Input value={editForm.middle_name || ""} onChange={(e) => setEditForm({ ...editForm, middle_name: e.target.value })} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={editForm.last_name || ""} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div />
              <div />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Student ID</Label>
                <Input value={editForm.student_id || ""} onChange={(e) => setEditForm({ ...editForm, student_id: e.target.value })} />
              </div>
              <div>
                <Label>Institute Type</Label>
                <Select value={editForm.institution_type || ""} onValueChange={(v) => setEditForm({ ...editForm, institution_type: v, institution_name: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kaiso School">Kaiso School</SelectItem>
                    <SelectItem value="Goverment School">Goverment School</SelectItem>
                    <SelectItem value="Academics">Academics</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Institute Name</Label>
                {editForm.institution_type === "Other" ? (
                  <Input value={editForm.institution_name || ""} onChange={(e) => setEditForm({ ...editForm, institution_name: e.target.value })} />
                ) : (
                  <Select value={editForm.institution_name || ""} onValueChange={(v) => setEditForm({ ...editForm, institution_name: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select name" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {(editForm.institution_type === "Kaiso School" ? [
                        "Aga Khan Academy",
                        "Braeburn Garden Estate - BGE",
                        "Braeburn Gitanga Road - BGR",
                        "Braeside School, Thika",
                        "Braeside School, Lavington",
                        "Brookhouse School, Karen",
                        "Brookhouse School, Runda",
                        "Brookhurst International, Lavington",
                        "Brookhurst International, Kiserian",
                        "Crawford International School",
                        "The Banda School",
                        "French School",
                        "German School",
                        "Jawabu School",
                        "Light International School",
                        "Makini Cambridge School",
                        "Nairobi Academy",
                        "Nairobi Jaffery Academy",
                        "Oshwal Academy U15 & U17",
                        "Oshwal Academy U17 & U19",
                        "Peponi School (overall)",
                        "Peponi School (Girls Sport)",
                        "Peponi School (Boys Sport)",
                        "Rosslyn Academy (overall)",
                        "Kenton College",
                        "Rusinga School",
                        "SABIS International School",
                        "St Austin's Academy",
                        "St. Christopher's School",
                        "Swedish School",
                        "Woodcreek School",
                        "West Nairobi School - WNS",
                        "ISK",
                        "Durham International School - DIS",
                      ] : editForm.institution_type === "Goverment School" ? [
                        "MBAGATHI ROAD PRIMARY",
                        "NEMBU PRIMARY",
                        "KAWANGWARE PRIMARY",
                        "TOI PRIMARY",
                        "RIRUTA HGM PRIMARY",
                      ] : editForm.institution_type === "Academics" ? [
                        "Talanta",
                        "JB Academy",
                        "Muqs",
                        "Bumble Bee Sports",
                        "Discovery Tennis",
                        "TY SPORTS",
                        "Terriffic Tennis",
                        "TY SPORTS",
                        "Next Gen Multi Sport Academu",
                      ] : []).map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveStudent}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudents;