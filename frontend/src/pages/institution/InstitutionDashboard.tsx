import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExportButton } from "@/components/ui/export-button";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Users,
  DollarSign,
  Trophy,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Calendar,
  Phone,
  IdCard,
  FileText,
  Download,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const InstitutionDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
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
  
  // State for API data
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    paidStudents: 0,
    unpaidStudents: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });

  // Fetch students data
  const fetchStudents = async () => {
    try {
      const response = await apiService.getAdminStudents({
        search: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      });
      
      setStudents(response.data || []);
      
      // Calculate stats
      const totalStudents = response.data?.length || 0;
      const paidStudents = response.data?.filter((student: any) => student.payment_status === 'Paid').length || 0;
      const unpaidStudents = totalStudents - paidStudents;
      const totalAmount = response.data?.reduce((sum: number, student: any) => sum + (student.total_amount || 0), 0) || 0;
      const paidAmount = response.data?.filter((student: any) => student.payment_status === 'Paid')
        .reduce((sum: number, student: any) => sum + (student.paid_amount || 0), 0) || 0;
      const pendingAmount = totalAmount - paidAmount;
      
      setStats({
        totalStudents,
        paidStudents,
        unpaidStudents,
        totalAmount,
        paidAmount,
        pendingAmount,
      });
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
  }, [searchTerm, filterStatus]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      student.payment_status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowViewDialog(true);
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    
    // Populate edit form with student data
    const nameParts = student.full_name?.split(' ') || [];
    setEditForm({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(' ') || "",
      email: student.email || "",
      phone: student.phone || "",
      dateOfBirth: student.date_of_birth || "",
      gender: student.gender || "",
      studentId: student.student_id || "",
      studentIdImage: student.student_id_image || null,
      ageProofDocument: student.age_proof_image || null,
    });
    
    setShowEditDialog(true);
  };

  const handleEditSave = async () => {
    try {
      // TODO: Implement update student API call
      console.log("Updated student data:", editForm);
      
      toast({
        title: "Student Updated",
        description: `${editForm.firstName} ${editForm.lastName} has been updated successfully.`,
      });
      
      setShowEditDialog(false);
      setSelectedStudent(null);
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    // TODO: Implement delete student API call
    toast({
      title: "Feature Coming Soon",
      description: "Delete student functionality will be implemented soon.",
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Unpaid": return "bg-red-100 text-red-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Institution Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your students and track their registrations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Students</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paidStudents}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Students</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.unpaidStudents}</div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{stats.totalAmount}</div>
            <p className="text-xs text-muted-foreground">All registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/institution/students'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Student Management
            </CardTitle>
            <CardDescription>
              Manage student registrations and view their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Total registered students</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/institution/sports'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              Sports Management
            </CardTitle>
            <CardDescription>
              View and manage sports with enrolled students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">0</div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Sports enrolled</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/institution/payments'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Payment Management
            </CardTitle>
            <CardDescription>
              Track payments and financial transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">₹{stats.totalAmount}</div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Total amount collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <ExportButton 
                data={filteredStudents} 
                filename="students_list" 
                variant="outline"
                size="default"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
          <CardDescription>
            Manage and track your students' registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No students have been registered yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewStudent(student)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">{student.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ID: {student.student_id} • {student.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className={getPaymentStatusColor(student.payment_status || "Unpaid")}>
                          {student.payment_status || "Unpaid"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ₹{student.total_amount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
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
                  {selectedStudent.full_name?.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedStudent.full_name}</h3>
                  <p className="text-muted-foreground">Student ID: {selectedStudent.student_id}</p>
                  <Badge className={getPaymentStatusColor(selectedStudent.payment_status || "Unpaid")}>
                    {selectedStudent.payment_status || "Unpaid"}
                  </Badge>
                </div>
              </div>

              {/* Student Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Personal Information</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedStudent.full_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedStudent.age || "N/A"} years old</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Gender:</span>
                        <span className="text-sm">{selectedStudent.gender || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedStudent.phone || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Registration Details</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge className={getPaymentStatusColor(selectedStudent.payment_status || "Unpaid")}>
                          {selectedStudent.payment_status || "Unpaid"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Total: ₹{selectedStudent.total_amount || 0}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Paid: ₹{selectedStudent.paid_amount || 0}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Pending: ₹{(selectedStudent.total_amount || 0) - (selectedStudent.paid_amount || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Uploaded Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student ID Document */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Student ID Document</h5>
                    {selectedStudent.student_id_image ? (
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
                            onClick={() => window.open(selectedStudent.student_id_image, '_blank')}
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
                              link.href = selectedStudent.student_id_image;
                              link.download = `student-id-${selectedStudent.student_id}.pdf`;
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
                    <h5 className="font-medium text-sm">Age Proof Document</h5>
                    {selectedStudent.age_proof_image ? (
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
                            onClick={() => window.open(selectedStudent.age_proof_image, '_blank')}
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
                              link.href = selectedStudent.age_proof_image;
                              link.download = `age-proof-${selectedStudent.student_id}.pdf`;
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
                  onClick={() => setShowViewDialog(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowViewDialog(false);
                    handleEditStudent(selectedStudent);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setShowViewDialog(false);
                    handleDeleteStudent(selectedStudent.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student profile and information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleEditSave(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Enter first name"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
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
                <label className="text-sm font-medium">Gender</label>
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
                <label className="text-sm font-medium">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
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
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
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
              <label className="text-sm font-medium">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
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
              <label className="text-sm font-medium">Student ID</label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
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
                    <label className="text-sm font-medium cursor-pointer">
                      Student ID Image
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a clear photo of the student ID card
                    </p>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setEditForm(prev => ({ ...prev, studentIdImage: e.target.files?.[0] || null }))}
                      className="mt-2"
                    />
                    {editForm.studentIdImage && (
                      <div className="mt-2 flex items-center space-x-2 text-xs">
                        <FileText className="h-3 w-3 text-accent" />
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
                    <label className="text-sm font-medium cursor-pointer">
                      Age Proof Document
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload birth certificate or age verification document
                    </p>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setEditForm(prev => ({ ...prev, ageProofDocument: e.target.files?.[0] || null }))}
                      className="mt-2"
                    />
                    {editForm.ageProofDocument && (
                      <div className="mt-2 flex items-center space-x-2 text-xs">
                        <FileText className="h-3 w-3 text-accent" />
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
    </div>
  );
};

export default InstitutionDashboard;