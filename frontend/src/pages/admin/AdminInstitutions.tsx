import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Eye, Edit, Trash2, Plus, UserPlus, Download, CreditCard, HandHeart, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { INSTITUTE_TYPES, getInstituteOptions } from "@/lib/institutionData";

const AdminInstitutions = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [selectedSportCategory, setSelectedSportCategory] = useState("all");
  const [showSponsorshipInfo, setShowSponsorshipInfo] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [formData, setFormData] = useState({
    institution_type: "",
    name: "",
    email: "",
  });
  
  // State for API data
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch institutions data
  const fetchInstitutions = async () => {
    try {
      const response = await apiService.getAdminInstitutions({
        search: searchTerm || undefined,
        status: selectedPaymentStatus !== "all" ? selectedPaymentStatus : undefined,
      });
      setInstitutions((response.data as any[]) || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch institutions data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [searchTerm, selectedPaymentStatus]);

  const handleViewInstitution = (institution: any) => {
    setSelectedInstitution(institution);
  };

  const handleEditInstitution = (institution: any) => {
    setSelectedInstitution(institution);
    setEditMode(true);
    setFormData({
      name: institution.name,
      email: institution.email,
      institution_type: institution.institution_type || "",
    });
  };

  const handleDeleteInstitution = (institutionId: string) => {
    // TODO: Implement delete institution API call
    toast({
      title: "Feature Coming Soon",
      description: "Delete institution functionality will be implemented soon.",
    });
  };

  const handleAddInstitution = () => {
    // TODO: Implement add institution API call
    toast({
      title: "Feature Coming Soon",
      description: "Add institution functionality will be implemented soon.",
    });
    setShowAddForm(false);
  };

  const handleUpdateInstitution = () => {
    // TODO: Implement update institution API call
    toast({
      title: "Feature Coming Soon",
      description: "Update institution functionality will be implemented soon.",
    });
    setEditMode(false);
    setSelectedInstitution(null);
  };

  const exportInstitutions = () => {
    // TODO: Implement export functionality
    toast({
      title: "Feature Coming Soon",
      description: "Export functionality will be implemented soon.",
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Partial": return "bg-yellow-100 text-yellow-800";
      case "Pending": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVerificationStatusColor = (verified: boolean) => {
    return verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading institutions data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Institution Management</h1>
          <p className="text-muted-foreground">Manage registered institutions and their details</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportInstitutions} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Institution
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Institution</DialogTitle>
                <DialogDescription>Provide institute type, name and email</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="institution_type">Institute Type</Label>
                  <Select value={formData.institution_type} onValueChange={(v) => setFormData({ ...formData, institution_type: v, name: "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select institute type" />
                    </SelectTrigger>
                    <SelectContent>
                  {INSTITUTE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Institute Name</Label>
                  {formData.institution_type === "Other" ? (
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter institute name" />
                  ) : (
                    <Select value={formData.name} onValueChange={(v) => setFormData({ ...formData, name: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select institute name" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {getInstituteOptions(formData.institution_type).map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Institute Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter institute email" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddInstitution}>
                    Add Institution
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search institutions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedSportCategory} onValueChange={setSelectedSportCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            <SelectItem value="football">Football</SelectItem>
            <SelectItem value="basketball">Basketball</SelectItem>
            <SelectItem value="cricket">Cricket</SelectItem>
            <SelectItem value="tennis">Tennis</SelectItem>
            <SelectItem value="badminton">Badminton</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Institution List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Institution List</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {institutions.length} institutions
            </span>
          </div>
        </div>

        {institutions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No institutions found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || selectedPaymentStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No institutions have been registered yet."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {institutions.map((institution) => (
              <Card key={institution.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{institution.name}</h3>
                        <Badge className={getVerificationStatusColor(institution.verified)}>
                          {institution.verified ? "Verified" : "Pending"}
                        </Badge>
                        <Badge className={getPaymentStatusColor(institution.payment_status)}>
                          {institution.payment_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Type:</span> {institution.institution_type || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Contact:</span> {institution.contact_person}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {institution.email}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Students:</span> {institution.sports_enrolled || 0}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Sports:</span> {institution.sports_enrolled || 0}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Total Amount:</span> ₹{institution.total_amount?.toLocaleString() || 0}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Paid Amount:</span> ₹{institution.paid_amount?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInstitution(institution)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInstitution(institution)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Institution</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{institution.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteInstitution(institution.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Institution Details Sheet */}
      <Sheet>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>
              {editMode ? "Edit Institution" : "Institution Details"}
            </SheetTitle>
            <SheetDescription>
              {editMode ? "Update institution information" : "View institution details and management"}
            </SheetDescription>
          </SheetHeader>
          {selectedInstitution && (
            <div className="space-y-6 mt-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="sponsorships">Sponsorships</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  {editMode ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="editName">Institution Name</Label>
                        <Input
                          id="editName"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editEmail">Email</Label>
                        <Input
                          id="editEmail"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      {/* Fields trimmed as per new minimal form */}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditMode(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateInstitution}>
                          Update Institution
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Basic Information</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Name:</span> {selectedInstitution.name}</p>
                          <p><span className="font-medium">Email:</span> {selectedInstitution.email}</p>
                          <p><span className="font-medium">Type:</span> {selectedInstitution.institution_type || "N/A"}</p>
                          <p><span className="font-medium">Contact Person:</span> {selectedInstitution.contact_person}</p>
                          <p><span className="font-medium">Phone:</span> {selectedInstitution.phone || "N/A"}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Status</h4>
                        <div className="flex gap-2">
                          <Badge className={getVerificationStatusColor(selectedInstitution.verified)}>
                            {selectedInstitution.verified ? "Verified" : "Pending Verification"}
                          </Badge>
                          <Badge className={getPaymentStatusColor(selectedInstitution.payment_status)}>
                            {selectedInstitution.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="payments" className="space-y-4">
                  <div className="text-center py-4 text-muted-foreground">
                    <CreditCard className="h-8 w-8 mx-auto mb-2" />
                    <p>Payment system coming soon</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="sponsorships" className="space-y-4">
                  <div className="text-center py-4 text-muted-foreground">
                    <HandHeart className="h-8 w-8 mx-auto mb-2" />
                    <p>Sponsorship system coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminInstitutions;