import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Building2, Users, CreditCard, HandHeart, Trophy, Clock, Search, Filter, Eye, AlertCircle, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  
  // State for API data
  const [stats, setStats] = useState({
    total_institutions: 0,
    active_institutions: 0,
    verified_institutions: 0,
    total_students: 0,
    total_sports: 0,
    total_sponsorships: 0,
    total_payments: 0,
    pending_payments: 0,
  });
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await apiService.getAdminDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    }
  };

  // Fetch institutions
  const fetchInstitutions = async () => {
    setInstitutionsLoading(true);
    try {
      const response = await apiService.getAdminInstitutions({
        search: searchTerm || undefined,
        status: selectedPaymentStatus !== "all" ? selectedPaymentStatus : undefined,
      });
      setInstitutions(response.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch institutions",
        variant: "destructive",
      });
    } finally {
      setInstitutionsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchInstitutions()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Refetch institutions when filters change
  useEffect(() => {
    fetchInstitutions();
  }, [searchTerm, selectedPaymentStatus]);

  const handlePendingPaymentsClick = () => {
    setShowPendingOnly(!showPendingOnly);
    setSelectedPaymentStatus(showPendingOnly ? "all" : "pending");
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
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-primary shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_institutions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_institutions} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_students}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sports</CardTitle>
            <Trophy className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_sports}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Institutions</CardTitle>
            <HandHeart className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified_institutions}</div>
            <p className="text-xs text-muted-foreground">Verified</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.total_payments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total collected</p>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-warning shadow-soft cursor-pointer hover:shadow-md transition-shadow"
          onClick={handlePendingPaymentsClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_payments}</div>
            <p className="text-xs text-muted-foreground">Click to filter</p>
          </CardContent>
        </Card>
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
        <Select value={selectedSport} onValueChange={setSelectedSport}>
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
        <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Institutions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Institutions</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {institutions.length} institutions
            </span>
          </div>
        </div>

        {institutionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading institutions...</span>
          </div>
        ) : institutions.length === 0 ? (
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
                    <div className="space-y-2 flex-1">
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
                          <span className="font-medium">Contact Person:</span> {institution.contact_person}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {institution.email}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {institution.institution_type || "N/A"}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Sports Enrolled:</span> {institution.sports_enrolled}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Total Amount:</span> ₹{institution.total_amount.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Paid Amount:</span> ₹{institution.paid_amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px]">
                          <SheetHeader>
                            <SheetTitle>{institution.name}</SheetTitle>
                            <SheetDescription>
                              Institution details and management
                            </SheetDescription>
                          </SheetHeader>
                          <div className="space-y-4 mt-6">
                            <div>
                              <h4 className="font-medium mb-2">Contact Information</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Contact Person:</span> {institution.contact_person}</p>
                                <p><span className="font-medium">Email:</span> {institution.email}</p>
                                <p><span className="font-medium">Phone:</span> {institution.phone || "N/A"}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Status</h4>
                              <div className="flex gap-2">
                                <Badge className={getVerificationStatusColor(institution.verified)}>
                                  {institution.verified ? "Verified" : "Pending Verification"}
                                </Badge>
                                <Badge className={getPaymentStatusColor(institution.payment_status)}>
                                  {institution.payment_status}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Financial Information</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Total Amount:</span> ₹{institution.total_amount.toLocaleString()}</p>
                                <p><span className="font-medium">Paid Amount:</span> ₹{institution.paid_amount.toLocaleString()}</p>
                                <p><span className="font-medium">Pending Amount:</span> ₹{(institution.total_amount - institution.paid_amount).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;