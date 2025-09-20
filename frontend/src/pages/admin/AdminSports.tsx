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
import { 
  AGE_CATEGORIES, 
  GENDER_OPTIONS, 
  SPORT_TYPES, 
  TEAM_SPORTS, 
  INDIVIDUAL_SPORTS,
  getSportsByType,
  getCategoriesForSport,
  getSubCategoriesForSportAndCategory,
  getAgeGroupsForSport
} from "@/lib/sportsData";

const AdminSports = () => {
  const { toast } = useToast();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<any>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<any>(null);
  const [isEditSubCategoryOpen, setIsEditSubCategoryOpen] = useState(false);
  const [newSport, setNewSport] = useState({ 
    sportType: "Individual",
    sportName: "",
    ageFrom: "",
    ageTo: "",
    gender: "Open",
    fees: "",
    participantLimit: ""
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [newSubCategory, setNewSubCategory] = useState({ 
    parentSport: "", 
    name: "", 
    fee: "", 
    gender: "Open",
    level: 1
  });
  
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
      if (!newSport.sportType) {
        toast({
          title: "Validation Error",
          description: "Sport type is required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.sportName.trim()) {
        toast({
          title: "Validation Error",
          description: "Sport name is required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.ageFrom || !newSport.ageTo) {
        toast({
          title: "Validation Error",
          description: "Age from and age to are required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.gender) {
        toast({
          title: "Validation Error",
          description: "Gender is required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.fees || parseFloat(newSport.fees) < 0) {
        toast({
          title: "Validation Error",
          description: "Valid fees amount is required",
          variant: "destructive",
        });
        return;
      }

      // Validate categories
      const validCategories = categories.filter(cat => cat.name.trim());
      for (const category of validCategories) {
        if (!category.name.trim()) {
          toast({
            title: "Validation Error",
            description: "Category name is required",
            variant: "destructive",
          });
          return;
        }

        // Validate sub-categories within this category
        const validSubCategories = (category.subCategories || []).filter(sub => sub.name.trim());
        for (const subCat of validSubCategories) {
          if (!subCat.name.trim()) {
            toast({
              title: "Validation Error",
              description: "Sub-category name is required",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Prepare sport data
      const sportData = {
        name: newSport.sportName,
        type: newSport.sportType,
        ageFrom: newSport.ageFrom,
        ageTo: newSport.ageTo,
        gender: newSport.gender,
        fees: parseFloat(newSport.fees),
        participantLimit: newSport.participantLimit ? parseInt(newSport.participantLimit) : null,
        categories: validCategories.map(category => ({
          name: category.name,
          ageFrom: category.ageFrom,
          ageTo: category.ageTo,
          limitPerInstitution: category.limitPerInstitution ? parseInt(category.limitPerInstitution) : null,
          subCategories: (category.subCategories || []).filter(sub => sub.name.trim()).map(sub => ({
            name: sub.name,
            ageFrom: sub.ageFrom,
            ageTo: sub.ageTo
          }))
        }))
      };

      // Create sport via API
      const response = await apiService.createSport(sportData);
      
      toast({
        title: "Success",
        description: "Sport created successfully!",
      });
      
      setIsAddFormOpen(false);
      setNewSport({ 
        sportType: "Individual",
        sportName: "",
        ageFrom: "",
        ageTo: "",
        gender: "Open",
        fees: "",
        participantLimit: ""
      });
      setCategories([]);
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
      sportType: sport.type || "Individual",
      sportName: sport.name || "",
      ageFrom: sport.ageFrom || "",
      ageTo: sport.ageTo || "",
      gender: sport.gender || "Open",
      fees: sport.fees || "",
      participantLimit: sport.participantLimit || ""
    });
    setCategories(sport.categories || []);
    setSubCategories([]);
    setIsEditFormOpen(true);
  };

  const handleUpdateSport = async () => {
    try {
      // Validate required fields
      if (!newSport.sportType) {
        toast({
          title: "Validation Error",
          description: "Sport type is required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.sportName) {
        toast({
          title: "Validation Error",
          description: "Sport name is required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.ageFrom || !newSport.ageTo) {
        toast({
          title: "Validation Error",
          description: "Age from and age to are required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.gender) {
        toast({
          title: "Validation Error",
          description: "Gender is required",
          variant: "destructive",
        });
        return;
      }

      if (!newSport.fees || parseFloat(newSport.fees) < 0) {
        toast({
          title: "Validation Error",
          description: "Valid fees amount is required",
          variant: "destructive",
        });
        return;
      }

      // Validate categories
      const validCategories = categories.filter(cat => cat.name.trim());
      for (const category of validCategories) {
        if (!category.name.trim()) {
          toast({
            title: "Validation Error",
            description: "Category name is required",
            variant: "destructive",
          });
          return;
        }

        // Validate sub-categories for this category
        const validSubCategories = (category.subCategories || []).filter(sub => sub.name.trim());
        for (const subCat of validSubCategories) {
          if (!subCat.name.trim()) {
            toast({
              title: "Validation Error",
              description: "Sub-category name is required",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Prepare sport data
      const sportData = {
        name: newSport.sportName,
        type: newSport.sportType,
        ageFrom: newSport.ageFrom,
        ageTo: newSport.ageTo,
        gender: newSport.gender,
        fees: parseFloat(newSport.fees),
        participantLimit: newSport.participantLimit ? parseInt(newSport.participantLimit) : null,
        categories: validCategories.map(category => ({
          name: category.name,
          ageFrom: category.ageFrom,
          ageTo: category.ageTo,
          limitPerInstitution: category.limitPerInstitution ? parseInt(category.limitPerInstitution) : null,
          subCategories: (category.subCategories || []).filter(sub => sub.name.trim()).map(sub => ({
            name: sub.name,
            ageFrom: sub.ageFrom,
            ageTo: sub.ageTo
          }))
        }))
      };

      // Update sport via API
      await apiService.updateSport(editingSport.id, sportData);
      
      toast({
        title: "Success",
        description: "Sport updated successfully!",
      });
      
      setIsEditFormOpen(false);
      setEditingSport(null);
      setNewSport({ 
        sportType: "Individual",
        sportName: "",
        ageFrom: "",
        ageTo: "",
        gender: "Open",
        fees: "",
        participantLimit: ""
      });
      setCategories([]);
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
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Sport</DialogTitle>
                <DialogDescription>
                  Create a new sport with age groups, categories, and sub-categories.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Sport Type Selection */}
                <div>
                  <Label htmlFor="sportType">Sport Type *</Label>
                  <Select 
                    value={newSport.sportType} 
                    onValueChange={(value) => {
                      setNewSport({
                        ...newSport, 
                        sportType: value,
                        sportName: "",
                        ageFrom: "",
                        ageTo: ""
                      });
                      setCategories([]);
                      setSubCategories([]);
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

                {/* Sport Name - Manual Input */}
                <div>
                  <Label htmlFor="sportName">Sport Name *</Label>
                  <Input
                    id="sportName"
                    value={newSport.sportName}
                    onChange={(e) => setNewSport({...newSport, sportName: e.target.value})}
                    placeholder="e.g., Football, Athletics, Swimming"
                  />
                </div>

                {/* Age Group Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ageFrom">Age From *</Label>
                    <Input
                      id="ageFrom"
                      value={newSport.ageFrom}
                      onChange={(e) => setNewSport({...newSport, ageFrom: e.target.value})}
                      placeholder="e.g., U9, U11, 12, 15"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ageTo">Age To *</Label>
                    <Input
                      id="ageTo"
                      value={newSport.ageTo}
                      onChange={(e) => setNewSport({...newSport, ageTo: e.target.value})}
                      placeholder="e.g., U19, U17, 18, 21"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select 
                    value={newSport.gender} 
                    onValueChange={(value) => setNewSport({...newSport, gender: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((gender) => (
                        <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fees and Participant Limit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fees">Fees (₹) *</Label>
                    <Input
                      id="fees"
                      type="number"
                      value={newSport.fees}
                      onChange={(e) => setNewSport({...newSport, fees: e.target.value})}
                      placeholder="e.g., 500, 1000, 1500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="participantLimit">Participant Limit</Label>
                    <Input
                      id="participantLimit"
                      type="number"
                      value={newSport.participantLimit}
                      onChange={(e) => setNewSport({...newSport, participantLimit: e.target.value})}
                      placeholder="e.g., 50, 100, 200"
                    />
                  </div>
                </div>

                {/* Categories Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Categories</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCategory = {
                          name: "",
                          ageFrom: "",
                          ageTo: "",
                          limitPerInstitution: "",
                          subCategories: []
                        };
                        setCategories([...categories, newCategory]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                  
                  {categories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Category {categoryIndex + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCategories(categories.filter((_, i) => i !== categoryIndex))}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Category Name *</Label>
                          <Input
                            placeholder="e.g., Track, Field, 1v1, Doubles"
                            value={category.name}
                            onChange={(e) => {
                              const updated = [...categories];
                              updated[categoryIndex].name = e.target.value;
                              setCategories(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Limit per Institution</Label>
                          <Input
                            type="number"
                            placeholder="Optional limit"
                            value={category.limitPerInstitution}
                            onChange={(e) => {
                              const updated = [...categories];
                              updated[categoryIndex].limitPerInstitution = e.target.value;
                              setCategories(updated);
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Age From</Label>
                          <Input
                            placeholder="e.g., U9, U11, 12, 15"
                            value={category.ageFrom}
                            onChange={(e) => {
                              const updated = [...categories];
                              updated[categoryIndex].ageFrom = e.target.value;
                              setCategories(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Age To</Label>
                          <Input
                            placeholder="e.g., U19, U17, 18, 21"
                            value={category.ageTo}
                            onChange={(e) => {
                              const updated = [...categories];
                              updated[categoryIndex].ageTo = e.target.value;
                              setCategories(updated);
                            }}
                          />
                        </div>
                      </div>

                      {/* Sub-Categories for this Category */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Sub-Categories</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSubCategory = {
                                name: "",
                                ageFrom: "",
                                ageTo: ""
                              };
                              const updated = [...categories];
                              updated[categoryIndex].subCategories = [...(updated[categoryIndex].subCategories || []), newSubCategory];
                              setCategories(updated);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Sub-Category
                          </Button>
                        </div>
                        
                        {(category.subCategories || []).map((subCat, subIndex) => (
                          <div key={subIndex} className="p-3 border rounded-lg space-y-3 bg-background">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-medium">Sub-Category {subIndex + 1}</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = [...categories];
                                  updated[categoryIndex].subCategories = updated[categoryIndex].subCategories.filter((_, i) => i !== subIndex);
                                  setCategories(updated);
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">Sub-Category Name *</Label>
                                <Input
                                  placeholder="e.g., 50m, 100m, Doubles"
                                  value={subCat.name}
                                  onChange={(e) => {
                                    const updated = [...categories];
                                    updated[categoryIndex].subCategories[subIndex].name = e.target.value;
                                    setCategories(updated);
                                  }}
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Age From</Label>
                                <Input
                                  placeholder="e.g., U9, U11, 12, 15"
                                  value={subCat.ageFrom}
                                  onChange={(e) => {
                                    const updated = [...categories];
                                    updated[categoryIndex].subCategories[subIndex].ageFrom = e.target.value;
                                    setCategories(updated);
                                  }}
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Age To</Label>
                                <Input
                                  placeholder="e.g., U19, U17, 18, 21"
                                  value={subCat.ageTo}
                                  onChange={(e) => {
                                    const updated = [...categories];
                                    updated[categoryIndex].subCategories[subIndex].ageTo = e.target.value;
                                    setCategories(updated);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setIsAddFormOpen(false);
                    setNewSport({ 
                      sportType: "Individual",
                      sportName: "",
                      ageFrom: "",
                      ageTo: "",
                      gender: "Open",
                      fees: "",
                      participantLimit: ""
                    });
                    setCategories([]);
                    setSubCategories([]);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSport}>
                    Save Sport
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Sport Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sport</DialogTitle>
            <DialogDescription>
              Update sport information, categories, and sub-categories.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Sport Type Selection */}
            <div>
              <Label htmlFor="editSportType">Sport Type *</Label>
              <Select 
                value={newSport.sportType} 
                onValueChange={(value) => setNewSport({...newSport, sportType: value})}
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

            {/* Sport Name */}
            <div>
              <Label htmlFor="editSportName">Sport Name *</Label>
              <Input
                id="editSportName"
                value={newSport.sportName}
                onChange={(e) => setNewSport({...newSport, sportName: e.target.value})}
                placeholder="e.g., Football, Basketball, Swimming, Badminton"
              />
            </div>

            {/* Age Group Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editAgeFrom">Age From *</Label>
                <Input
                  id="editAgeFrom"
                  value={newSport.ageFrom}
                  onChange={(e) => setNewSport({...newSport, ageFrom: e.target.value})}
                  placeholder="e.g., U9, U11, 12, 15"
                />
              </div>
              <div>
                <Label htmlFor="editAgeTo">Age To *</Label>
                <Input
                  id="editAgeTo"
                  value={newSport.ageTo}
                  onChange={(e) => setNewSport({...newSport, ageTo: e.target.value})}
                  placeholder="e.g., U19, U17, 18, 21"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="editGender">Gender *</Label>
              <Select 
                value={newSport.gender} 
                onValueChange={(value) => setNewSport({...newSport, gender: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((gender) => (
                    <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fees and Participant Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFees">Fees (₹) *</Label>
                <Input
                  id="editFees"
                  type="number"
                  value={newSport.fees}
                  onChange={(e) => setNewSport({...newSport, fees: e.target.value})}
                  placeholder="e.g., 500, 1000, 1500"
                />
              </div>
              <div>
                <Label htmlFor="editParticipantLimit">Participant Limit</Label>
                <Input
                  id="editParticipantLimit"
                  type="number"
                  value={newSport.participantLimit}
                  onChange={(e) => setNewSport({...newSport, participantLimit: e.target.value})}
                  placeholder="e.g., 50, 100, 200"
                />
              </div>
            </div>

            {/* Categories Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Categories</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newCategory = {
                      name: "",
                      ageFrom: "",
                      ageTo: "",
                      limitPerInstitution: "",
                      subCategories: []
                    };
                    setCategories([...categories, newCategory]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              
              {categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Category {categoryIndex + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCategories(categories.filter((_, i) => i !== categoryIndex))}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Category Name *</Label>
                      <Input
                        placeholder="e.g., Track, Field, 1v1, Doubles"
                        value={category.name}
                        onChange={(e) => {
                          const updated = [...categories];
                          updated[categoryIndex].name = e.target.value;
                          setCategories(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Limit per Institution</Label>
                      <Input
                        type="number"
                        placeholder="Optional limit"
                        value={category.limitPerInstitution}
                        onChange={(e) => {
                          const updated = [...categories];
                          updated[categoryIndex].limitPerInstitution = e.target.value;
                          setCategories(updated);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Age From</Label>
                      <Input
                        placeholder="e.g., U9, U11, 12, 15"
                        value={category.ageFrom}
                        onChange={(e) => {
                          const updated = [...categories];
                          updated[categoryIndex].ageFrom = e.target.value;
                          setCategories(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Age To</Label>
                      <Input
                        placeholder="e.g., U19, U17, 18, 21"
                        value={category.ageTo}
                        onChange={(e) => {
                          const updated = [...categories];
                          updated[categoryIndex].ageTo = e.target.value;
                          setCategories(updated);
                        }}
                      />
                    </div>
                  </div>

                  {/* Sub-Categories for this Category */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Sub-Categories</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSubCategory = {
                            name: "",
                            ageFrom: "",
                            ageTo: ""
                          };
                          const updated = [...categories];
                          updated[categoryIndex].subCategories = [...(updated[categoryIndex].subCategories || []), newSubCategory];
                          setCategories(updated);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Sub-Category
                      </Button>
                    </div>
                    
                    {(category.subCategories || []).map((subCat, subIndex) => (
                      <div key={subIndex} className="p-3 border rounded-lg space-y-3 bg-background">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Sub-Category {subIndex + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = [...categories];
                              updated[categoryIndex].subCategories = updated[categoryIndex].subCategories.filter((_, i) => i !== subIndex);
                              setCategories(updated);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Sub-Category Name *</Label>
                            <Input
                              placeholder="e.g., 50m, 100m, Doubles"
                              value={subCat.name}
                              onChange={(e) => {
                                const updated = [...categories];
                                updated[categoryIndex].subCategories[subIndex].name = e.target.value;
                                setCategories(updated);
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Age From</Label>
                            <Input
                              placeholder="e.g., U9, U11, 12, 15"
                              value={subCat.ageFrom}
                              onChange={(e) => {
                                const updated = [...categories];
                                updated[categoryIndex].subCategories[subIndex].ageFrom = e.target.value;
                                setCategories(updated);
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Age To</Label>
                            <Input
                              placeholder="e.g., U19, U17, 18, 21"
                              value={subCat.ageTo}
                              onChange={(e) => {
                                const updated = [...categories];
                                updated[categoryIndex].subCategories[subIndex].ageTo = e.target.value;
                                setCategories(updated);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setIsEditFormOpen(false);
                setEditingSport(null);
                setNewSport({ 
                  sportType: "Individual",
                  sportName: "",
                  ageFrom: "",
                  ageTo: "",
                  gender: "Open",
                  fees: "",
                  participantLimit: ""
                });
                setCategories([]);
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