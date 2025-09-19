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
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({ 
    name: "", 
    type: "Team", 
    minParticipants: "", 
    maxParticipants: "" 
  });
  const [newSubCategory, setNewSubCategory] = useState({ 
    parentCategory: "", 
    name: "", 
    fee: "", 
    category: "",
  });
  
  // State for API data
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sports data
  const fetchSports = async () => {
    try {
      const response = await apiService.getAdminSports();
      setSports(response.data);
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

  const handleAddCategory = () => {
    // TODO: Implement add category API call
    toast({
      title: "Feature Coming Soon",
      description: "Add category functionality will be implemented soon.",
    });
    setIsAddFormOpen(false);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    // TODO: Implement edit category functionality
  };

  const handleDeleteCategory = (categoryId: string) => {
    // TODO: Implement delete category API call
    toast({
      title: "Feature Coming Soon",
      description: "Delete category functionality will be implemented soon.",
    });
  };

  const handleAddSubCategory = () => {
    // TODO: Implement add subcategory API call
    toast({
      title: "Feature Coming Soon",
      description: "Add subcategory functionality will be implemented soon.",
    });
    setNewSubCategory({ parentCategory: "", name: "", fee: "", category: "" });
  };

  const handleEditSubCategory = (subCategory: any) => {
    // TODO: Implement edit subcategory functionality
    toast({
      title: "Feature Coming Soon",
      description: "Edit subcategory functionality will be implemented soon.",
    });
  };

  const handleDeleteSubCategory = (subCategoryId: string) => {
    // TODO: Implement delete subcategory API call
    toast({
      title: "Feature Coming Soon",
      description: "Delete subcategory functionality will be implemented soon.",
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sports Management</h1>
          <p className="text-muted-foreground">Manage sports categories and subcategories</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Sport Category</DialogTitle>
                <DialogDescription>
                  Create a new sport category with basic information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="e.g., Football"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryType">Type</Label>
                  <Select value={newCategory.type} onValueChange={(value) => setNewCategory({...newCategory, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Team">Team Sport</SelectItem>
                      <SelectItem value="Individual">Individual Sport</SelectItem>
                      <SelectItem value="Mixed">Mixed Sport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minParticipants">Min Participants</Label>
                    <Input
                      id="minParticipants"
                      type="number"
                      value={newCategory.minParticipants}
                      onChange={(e) => setNewCategory({...newCategory, minParticipants: e.target.value})}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={newCategory.maxParticipants}
                      onChange={(e) => setNewCategory({...newCategory, maxParticipants: e.target.value})}
                      placeholder="11"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>
                    Add Category
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedCategories.includes(sport.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Trophy className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{sport.name}</CardTitle>
                          <CardDescription>{sport.description || "No description available"}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {sport.categories.length} categories
                        </Badge>
                        <Badge variant={sport.is_active ? "default" : "secondary"}>
                          {sport.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(sport);
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
                              <AlertDialogAction onClick={() => handleDeleteCategory(sport.id)}>
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
                      {sport.categories.length === 0 ? (
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
                                        Age: {category.age_from}-{category.age_to} | 
                                        Gender: {category.gender_allowed} | 
                                        Fee: ₹{category.fee}
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
                          <DialogContent>
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
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="ageFrom">Age From</Label>
                                  <Input
                                    id="ageFrom"
                                    type="number"
                                    value={newSubCategory.category}
                                    onChange={(e) => setNewSubCategory({...newSubCategory, category: e.target.value})}
                                    placeholder="12"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="ageTo">Age To</Label>
                                  <Input
                                    id="ageTo"
                                    type="number"
                                    value={newSubCategory.fee}
                                    onChange={(e) => setNewSubCategory({...newSubCategory, fee: e.target.value})}
                                    placeholder="16"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="gender">Gender Allowed</Label>
                                <Select value={newSubCategory.parentCategory} onValueChange={(value) => setNewSubCategory({...newSubCategory, parentCategory: value})}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="mixed">Mixed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setNewSubCategory({ parentCategory: "", name: "", fee: "", category: "" })}>
                                  Cancel
                                </Button>
                                <Button onClick={handleAddSubCategory}>
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