import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Download, ChevronDown, ChevronRight, Trophy, Users, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const AdminSports = () => {
  const { toast } = useToast();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<any>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<any>(null);
  const [isEditSubCategoryOpen, setIsEditSubCategoryOpen] = useState(false);
  const [newSport, setNewSport] = useState({ 
    name: "", 
    type: "Individual", 
    minTeamMembers: "", 
    maxTeamMembers: "",
    fees: "",
    gender: "Both"
  });
  const [newSubCategory, setNewSubCategory] = useState({ 
    parentSport: "", 
    name: "", 
    fee: "", 
    gender: "Both",
    level: 1
  });
  const [subCategories, setSubCategories] = useState<any[]>([]);
  
  // State for API data
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sports data
  const fetchSports = async () => {
    try {
      const response = await apiService.getAdminSports();
      setSports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching sports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sports data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddSport = async () => {
    try {
      // Validate required fields
      if (!newSport.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Sport name is required",
          variant: "destructive",
        });
        return;
      }

      if (newSport.type === "Team") {
        if (!newSport.minTeamMembers || !newSport.maxTeamMembers) {
          toast({
            title: "Validation Error",
            description: "Min and Max team members are required for team sports",
            variant: "destructive",
          });
          return;
        }
      }

      // Prepare sport data
      const sportData = {
        name: newSport.name,
        type: newSport.type,
        fees: parseFloat(newSport.fees) || 0,
        gender: newSport.gender,
        minTeamMembers: newSport.type === "Team" ? parseInt(newSport.minTeamMembers) : null,
        maxTeamMembers: newSport.type === "Team" ? parseInt(newSport.maxTeamMembers) : null,
        subCategories: (subCategories || []).filter(sub => sub.name.trim())
      };

      // Create sport via API
      const response = await apiService.createSport(sportData);
      
      toast({
        title: "Success",
        description: "Sport created successfully!",
      });
      
      setIsAddFormOpen(false);
      setNewSport({ name: "", type: "Individual", minTeamMembers: "", maxTeamMembers: "", fees: "", gender: "Both" });
      setSubCategories([]);
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error creating sport:', error);
      toast({
        title: "Error",
        description: "Failed to create sport",
        variant: "destructive",
      });
    }
  };

  const handleEditSport = (sport: any) => {
    setEditingSport(sport);
    setNewSport({
      name: sport.name || "",
      type: sport.type || "Individual",
      minTeamMembers: sport.minTeamMembers?.toString() || "",
      maxTeamMembers: sport.maxTeamMembers?.toString() || "",
      fees: sport.fees?.toString() || sport.fee?.toString() || "",
      gender: sport.gender || "Both"
    });
    setSubCategories(sport.categories || []);
    setIsEditFormOpen(true);
  };

  const handleUpdateSport = async () => {
    try {
      // Validate required fields
      if (!newSport.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Sport name is required",
          variant: "destructive",
        });
        return;
      }

      if (newSport.type === "Team") {
        if (!newSport.minTeamMembers || !newSport.maxTeamMembers) {
          toast({
            title: "Validation Error",
            description: "Min and Max team members are required for team sports",
            variant: "destructive",
          });
          return;
        }
      }

      // Prepare sport data
      const sportData = {
        name: newSport.name,
        type: newSport.type,
        fees: parseFloat(newSport.fees) || 0,
        gender: newSport.gender,
        minTeamMembers: newSport.type === "Team" ? parseInt(newSport.minTeamMembers) : null,
        maxTeamMembers: newSport.type === "Team" ? parseInt(newSport.maxTeamMembers) : null,
        subCategories: (subCategories || []).filter(sub => sub.name.trim())
      };

      // Update sport via API
      await apiService.updateSport(editingSport.id, sportData);
      
      toast({
        title: "Success",
        description: "Sport updated successfully!",
      });
      
      setIsEditFormOpen(false);
      setEditingSport(null);
      setNewSport({ name: "", type: "Individual", minTeamMembers: "", maxTeamMembers: "", fees: "", gender: "Both" });
      setSubCategories([]);
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error updating sport:', error);
      toast({
        title: "Error",
        description: "Failed to update sport",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSport = async (sportId: string) => {
    try {
      // Delete sport via API
      await apiService.deleteSport(sportId);
      
      toast({
        title: "Success",
        description: "Sport deleted successfully!",
      });
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error deleting sport:', error);
      toast({
        title: "Error",
        description: "Failed to delete sport",
        variant: "destructive",
      });
    }
  };

  const handleAddSubCategory = async (sportId: string) => {
    try {
      // Validate subcategory data
      if (!newSubCategory.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Sub-category name is required",
          variant: "destructive",
        });
        return;
      }

      // Add subcategory via API
      await apiService.addSubCategory(sportId, newSubCategory);
      
      toast({
        title: "Success",
        description: "Sub-category added successfully!",
      });
      
      setNewSubCategory({ parentSport: "", name: "", fee: "", gender: "Both", level: 1 });
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to add sub-category",
        variant: "destructive",
      });
    }
  };

  const handleEditSubCategory = (subCategory: any) => {
    setEditingSubCategory(subCategory);
    setNewSubCategory({
      parentSport: subCategory.sportId || "",
      name: subCategory.name || "",
      fee: subCategory.fee?.toString() || subCategory.fees?.toString() || "",
      gender: subCategory.gender || subCategory.gender_allowed || "Both",
      level: subCategory.level || 1
    });
    setIsEditSubCategoryOpen(true);
  };

  const handleUpdateSubCategory = async () => {
    try {
      // Validate subcategory data
      if (!newSubCategory.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Sub-category name is required",
          variant: "destructive",
        });
        return;
      }

      // Update subcategory via API
      await apiService.updateSubCategory(editingSubCategory.id, newSubCategory);
      
      toast({
        title: "Success",
        description: "Sub-category updated successfully!",
      });
      
      setIsEditSubCategoryOpen(false);
      setEditingSubCategory(null);
      setNewSubCategory({ parentSport: "", name: "", fee: "", gender: "Both", level: 1 });
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error updating subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to update sub-category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: string) => {
    try {
      // Delete subcategory via API
      await apiService.deleteSubCategory(subCategoryId);
      
      toast({
        title: "Success",
        description: "Sub-category deleted successfully!",
      });
      
      // Refresh sports list
      fetchSports();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to delete sub-category",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    // TODO: Implement export functionality
    toast({
      title: "Feature Coming Soon",
      description: "Export functionality will be implemented soon.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sports data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Sports Management</h1>
          <p className="text-muted-foreground">Manage sports categories and subcategories</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={exportData} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Sport
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Sport</DialogTitle>
                <DialogDescription>
                  Create a new sport with basic information and sub-categories.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Sport Type Selection */}
                <div>
                  <Label htmlFor="sportType">Type</Label>
                  <Select value={newSport.type} onValueChange={(value) => setNewSport({...newSport, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Team">Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sport Name */}
                <div>
                  <Label htmlFor="sportName">Sport Name</Label>
                  <Input
                    id="sportName"
                    value={newSport.name}
                    onChange={(e) => setNewSport({...newSport, name: e.target.value})}
                    placeholder="e.g., Football, Basketball, Swimming"
                  />
                </div>

                {/* Team-specific fields */}
                {newSport.type === "Team" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minTeamMembers">Min Team Members</Label>
                      <Input
                        id="minTeamMembers"
                        type="number"
                        value={newSport.minTeamMembers}
                        onChange={(e) => setNewSport({...newSport, minTeamMembers: e.target.value})}
                        placeholder="2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxTeamMembers">Max Team Members</Label>
                      <Input
                        id="maxTeamMembers"
                        type="number"
                        value={newSport.maxTeamMembers}
                        onChange={(e) => setNewSport({...newSport, maxTeamMembers: e.target.value})}
                        placeholder="11"
                      />
                    </div>
                  </div>
                )}

                {/* Fees */}
                <div>
                  <Label htmlFor="fees">Fees (₹)</Label>
                  <Input
                    id="fees"
                    type="number"
                    value={newSport.fees}
                    onChange={(e) => setNewSport({...newSport, fees: e.target.value})}
                    placeholder="500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={newSport.gender} onValueChange={(value) => setNewSport({...newSport, gender: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub-categories Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Sub-categories</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSubCategories([...(subCategories || []), { name: "", fee: "", gender: "Both", level: 1 }])}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sub-category
                    </Button>
                  </div>
                  
                  {(subCategories || []).map((subCat, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Sub-category Level {subCat.level}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSubCategories((subCategories || []).filter((_, i) => i !== index))}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Name</Label>
                          <Input
                            placeholder="Sub-category name"
                            value={subCat.name}
                            onChange={(e) => {
                              const updated = [...subCategories];
                              updated[index].name = e.target.value;
                              setSubCategories(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Fee (₹)</Label>
                          <Input
                            type="number"
                            placeholder="Fee (₹)"
                            value={subCat.fee}
                            onChange={(e) => {
                              const updated = [...subCategories];
                              updated[index].fee = e.target.value;
                              setSubCategories(updated);
                            }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Gender</Label>
                          <Select
                            value={subCat.gender}
                            onValueChange={(value) => {
                              const updated = [...subCategories];
                              updated[index].gender = value;
                              setSubCategories(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Level</Label>
                          <Select
                            value={(subCat.level || 1).toString()}
                            onValueChange={(value) => {
                              const updated = [...subCategories];
                              updated[index].level = parseInt(value);
                              setSubCategories(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Level 1</SelectItem>
                              <SelectItem value="2">Level 2</SelectItem>
                              <SelectItem value="3">Level 3</SelectItem>
                              <SelectItem value="4">Level 4</SelectItem>
                              <SelectItem value="5">Level 5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsAddFormOpen(false);
                    setNewSport({ name: "", type: "Individual", minTeamMembers: "", maxTeamMembers: "", fees: "", gender: "Both" });
                    setSubCategories([]);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSport}>
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Sport Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sport</DialogTitle>
            <DialogDescription>
              Update sport information and sub-categories.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Sport Type Selection */}
            <div>
              <Label htmlFor="editSportType">Type</Label>
              <Select value={newSport.type} onValueChange={(value) => setNewSport({...newSport, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sport Name */}
            <div>
              <Label htmlFor="editSportName">Sport Name</Label>
              <Input
                id="editSportName"
                value={newSport.name}
                onChange={(e) => setNewSport({...newSport, name: e.target.value})}
                placeholder="e.g., Football, Basketball, Swimming"
              />
            </div>

            {/* Team-specific fields */}
            {newSport.type === "Team" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editMinTeamMembers">Min Team Members</Label>
                  <Input
                    id="editMinTeamMembers"
                    type="number"
                    value={newSport.minTeamMembers}
                    onChange={(e) => setNewSport({...newSport, minTeamMembers: e.target.value})}
                    placeholder="2"
                  />
                </div>
                <div>
                  <Label htmlFor="editMaxTeamMembers">Max Team Members</Label>
                  <Input
                    id="editMaxTeamMembers"
                    type="number"
                    value={newSport.maxTeamMembers}
                    onChange={(e) => setNewSport({...newSport, maxTeamMembers: e.target.value})}
                    placeholder="11"
                  />
                </div>
              </div>
            )}

            {/* Fees */}
            <div>
              <Label htmlFor="editFees">Fees (₹)</Label>
              <Input
                id="editFees"
                type="number"
                value={newSport.fees}
                onChange={(e) => setNewSport({...newSport, fees: e.target.value})}
                placeholder="500"
              />
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="editGender">Gender</Label>
              <Select value={newSport.gender} onValueChange={(value) => setNewSport({...newSport, gender: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sub-categories Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Sub-categories</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSubCategories([...(subCategories || []), { name: "", fee: "", gender: "Both", level: 1 }])}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-category
                </Button>
              </div>
              
              {(subCategories || []).map((subCat, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Sub-category Level {subCat.level}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSubCategories(subCategories.filter((_, i) => i !== index))}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <Input
                        placeholder="Sub-category name"
                        value={subCat.name}
                        onChange={(e) => {
                          const updated = [...subCategories];
                          updated[index].name = e.target.value;
                          setSubCategories(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Fee (₹)</Label>
                      <Input
                        type="number"
                        placeholder="Fee (₹)"
                        value={subCat.fee}
                        onChange={(e) => {
                          const updated = [...subCategories];
                          updated[index].fee = e.target.value;
                          setSubCategories(updated);
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Gender</Label>
                      <Select
                        value={subCat.gender}
                        onValueChange={(value) => {
                          const updated = [...subCategories];
                          updated[index].gender = value;
                          setSubCategories(updated);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Level</Label>
                      <Select
                        value={(subCat.level || 1).toString()}
                        onValueChange={(value) => {
                          const updated = [...subCategories];
                          updated[index].level = parseInt(value);
                          setSubCategories(updated);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Level 1</SelectItem>
                          <SelectItem value="2">Level 2</SelectItem>
                          <SelectItem value="3">Level 3</SelectItem>
                          <SelectItem value="4">Level 4</SelectItem>
                          <SelectItem value="5">Level 5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditFormOpen(false);
                setEditingSport(null);
                setNewSport({ name: "", type: "Individual", minTeamMembers: "", maxTeamMembers: "", fees: "", gender: "Both" });
                setSubCategories([]);
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSport}>
                Update Sport
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Sub-category Dialog */}
      <Dialog open={isEditSubCategoryOpen} onOpenChange={setIsEditSubCategoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Sub-category</DialogTitle>
            <DialogDescription>
              Update sub-category information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editSubCategoryName">Sub-category Name</Label>
              <Input
                id="editSubCategoryName"
                value={newSubCategory.name}
                onChange={(e) => setNewSubCategory({...newSubCategory, name: e.target.value})}
                placeholder="e.g., Under 16 Boys"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editSubCategoryFee">Fee (₹)</Label>
                <Input
                  id="editSubCategoryFee"
                  type="number"
                  value={newSubCategory.fee}
                  onChange={(e) => setNewSubCategory({...newSubCategory, fee: e.target.value})}
                  placeholder="500"
                />
              </div>
              <div>
                <Label htmlFor="editSubCategoryLevel">Level</Label>
                <Select 
                  value={(newSubCategory.level || 1).toString()} 
                  onValueChange={(value) => setNewSubCategory({...newSubCategory, level: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editSubCategoryGender">Gender Allowed</Label>
              <Select 
                value={newSubCategory.gender} 
                onValueChange={(value) => setNewSubCategory({...newSubCategory, gender: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditSubCategoryOpen(false);
                setEditingSubCategory(null);
                setNewSubCategory({ parentSport: "", name: "", fee: "", gender: "Both", level: 1 });
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSubCategory}>
                Update Sub-category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sports Categories */}
      <div className="space-y-4">
        {sports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sports found</h3>
              <p className="text-muted-foreground text-center">
                No sports have been configured yet. Add your first sport category to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          sports.map((sport) => (
            <Card key={sport.id}>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleCategory(sport.id)}
                  >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {expandedCategories.includes(sport.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <Trophy className="h-5 w-5 text-primary" />
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg">{sport.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {sport.type} Sport | Gender: {sport.gender || 'Both'} | Fee: ₹{sport.fees || sport.fee || 0}
                              {sport.type === 'Team' && sport.minTeamMembers && sport.maxTeamMembers && 
                                ` | Team Size: ${sport.minTeamMembers}-${sport.maxTeamMembers}`
                              }
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">
                          {sport.categories?.length || 0} categories
                        </Badge>
                        <Badge variant={sport.is_active ? "default" : "secondary"}>
                          {sport.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSport(sport);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Sport Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{sport.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSport(sport.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Subcategories */}
                      {(!sport.categories || sport.categories.length === 0) ? (
                        <div className="text-center py-4 text-muted-foreground">
                          No subcategories available
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {sport.categories.map((category: any) => (
                            <Card key={category.id} className="bg-muted/30">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <h4 className="font-medium">{category.name}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {category.age_from && category.age_to ? `Age: ${category.age_from}-${category.age_to} | ` : ''}
                                        Gender: {category.gender_allowed || category.gender || 'Both'} | 
                                        Fee: ₹{category.fee || category.fees || 0}
                                        {(category.level || 0) > 0 && ` | Level: ${category.level}`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      <Users className="h-3 w-3 mr-1" />
                                      {category.participants || 0} participants
                                    </Badge>
                                    {category.max_participants && (
                                      <Badge variant="secondary">
                                        Max: {category.max_participants}
                                      </Badge>
                                    )}
                                    {(category.level || 0) > 0 && (
                                      <Badge variant="outline">
                                        Level {category.level}
                                      </Badge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditSubCategory(category)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteSubCategory(category.id)}>
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
                      
                      {/* Add Subcategory Button */}
                      <div className="pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Subcategory
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Add Subcategory to {sport.name}</DialogTitle>
                              <DialogDescription>
                                Create a new subcategory for this sport.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="subCategoryName">Subcategory Name</Label>
                                <Input
                                  id="subCategoryName"
                                  value={newSubCategory.name}
                                  onChange={(e) => setNewSubCategory({...newSubCategory, name: e.target.value})}
                                  placeholder="e.g., Under 16 Boys"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="subCategoryFee">Fee (₹)</Label>
                                  <Input
                                    id="subCategoryFee"
                                    type="number"
                                    value={newSubCategory.fee}
                                    onChange={(e) => setNewSubCategory({...newSubCategory, fee: e.target.value})}
                                    placeholder="500"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="subCategoryLevel">Level</Label>
                                  <Select 
                                    value={(newSubCategory.level || 1).toString()} 
                                    onValueChange={(value) => setNewSubCategory({...newSubCategory, level: parseInt(value)})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">Level 1</SelectItem>
                                      <SelectItem value="2">Level 2</SelectItem>
                                      <SelectItem value="3">Level 3</SelectItem>
                                      <SelectItem value="4">Level 4</SelectItem>
                                      <SelectItem value="5">Level 5</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="subCategoryGender">Gender Allowed</Label>
                                <Select 
                                  value={newSubCategory.gender} 
                                  onValueChange={(value) => setNewSubCategory({...newSubCategory, gender: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Both">Both</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex flex-col sm:flex-row justify-end gap-2">
                                <Button variant="outline" onClick={() => setNewSubCategory({ parentSport: "", name: "", fee: "", gender: "Both", level: 1 })} className="w-full sm:w-auto">
                                  Cancel
                                </Button>
                                <Button onClick={() => handleAddSubCategory(sport.id)} className="w-full sm:w-auto">
                                  Add Subcategory
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminSports;