"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { PlusCircle, UtensilsCrossed, DollarSign, Pencil, Trash2, Salad, Search, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getImagePath } from "@/lib/image-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FoodForm } from "@/components/food-form";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";

type FoodItemWithCategory = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: number;
  category: {
    id: number;
    name: string;
  } | null;
};

async function getFoodItems(): Promise<FoodItemWithCategory[]> {
  const res = await fetch("/api/fooditems/list", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch food items");
  return res.json();
}

async function getMenuStats() {
  const res = await fetch("/api/fooditems/stats", { cache: "no-store" });
  if (!res.ok) {
    return { totalItems: 0, activeItems: 0, totalCategories: 0 };
  }
  return res.json();
}

export default function FoodsPage() {
  const [foods, setFoods] = useState<FoodItemWithCategory[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, activeItems: 0, totalCategories: 0 });
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItemWithCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showMarkInactiveOption, setShowMarkInactiveOption] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [foodsData, statsData] = await Promise.all([
        getFoodItems(),
        getMenuStats(),
      ]);
      setFoods(foodsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to load food items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (food: FoodItemWithCategory) => {
    setSelectedFood(food);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (food: FoodItemWithCategory) => {
    setSelectedFood(food);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFood) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/fooditems?id=${selectedFood.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 409 && errorData.code === 'FOODITEM_HAS_ORDERS') {
          setDeleteError(errorData.error);
          setShowMarkInactiveOption(true);
          return;
        }
        throw new Error(errorData.error || "Failed to delete food item");
      }

      toast({
        title: "Success",
        description: `${selectedFood.name} has been deleted.`,
      });

      setDeleteDialogOpen(false);
      setSelectedFood(null);
      setShowMarkInactiveOption(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete food item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkInactive = async () => {
    if (!selectedFood) return;

    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("name", selectedFood.name);
      formData.append("description", selectedFood.description || "");
      formData.append("price", selectedFood.price.toString());
      formData.append("categoryId", selectedFood.categoryId.toString());
      formData.append("isActive", "false");
      formData.append("foodType", "0");
      formData.append("nutrition", "null");
      formData.append("recipeIngredients", "[]");

      const res = await fetch(`/api/fooditems?id=${selectedFood.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to mark item as inactive");
      }

      toast({
        title: "Success",
        description: `${selectedFood.name} has been marked as inactive.`,
      });

      setDeleteDialogOpen(false);
      setSelectedFood(null);
      setShowMarkInactiveOption(false);
      setDeleteError(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark item as inactive. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditFormSubmit = () => {
    setEditDialogOpen(false);
    setSelectedFood(null);
    fetchData();
  };

  const handleForceDelete = async () => {
    if (!selectedFood) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/fooditems?id=${selectedFood.id}&force=true`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to force delete food item");
      }

      toast({
        title: "Force Delete Successful",
        description: `${selectedFood.name} and all related records have been deleted.`,
      });

      setDeleteDialogOpen(false);
      setSelectedFood(null);
      setShowMarkInactiveOption(false);
      setDeleteError(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Force Delete Failed",
        description: error.message || "Failed to force delete food item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFoods = foods.filter((food) => {
    if (!searchTerm.trim()) return true;
    const needle = searchTerm.trim().toLowerCase();
    return (
      food.name.toLowerCase().includes(needle) ||
      (food.description?.toLowerCase().includes(needle) ?? false) ||
      (food.category?.name.toLowerCase().includes(needle) ?? false)
    );
  });

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Menu Management
          </h2>
          <p className="text-gray-400 mt-2">Manage your food items and menu</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form
            onSubmit={(event) => {
              event.preventDefault();
            }}
            className="w-full sm:w-auto"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search foods..."
                className="pl-9 pr-9 min-w-[240px]"
              />
              {searchTerm && (
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-gray-400/20 text-gray-200 cursor-pointer"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-3 w-3" />
                </div>
              )}
            </div>
          </form>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
              <Link href="/dashboard/customizations">
                <Salad className="mr-2 h-4 w-4" /> Manage Extras ?
              </Link>
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Food ?
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Food Item</DialogTitle>
                </DialogHeader>
                <FoodForm onFormSubmit={handleEditFormSubmit} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-gray-800 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Items</CardTitle>
            <UtensilsCrossed className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalItems}</div>
            <p className="text-xs text-gray-400 mt-1">All menu items</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Items</CardTitle>
            <UtensilsCrossed className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeItems}</div>
            <p className="text-xs text-gray-400 mt-1">Currently available</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Categories</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalCategories}</div>
            <p className="text-xs text-gray-400 mt-1">Menu categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Food Items Table */}
      <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <UtensilsCrossed className="w-10 h-10 mb-3 opacity-60 animate-pulse" />
            <div className="flex items-center gap-2">
              <Spinner size="md" />
              <span>Loading menu items...</span>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/40">
                <TableHead className="hidden w-[100px] sm:table-cell text-gray-300">Image</TableHead>
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Category</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-right text-gray-300">Price</TableHead>
                <TableHead className="text-right text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFoods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-60" />
                    No menu items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFoods.map((food) => (
                  <TableRow key={food.id} className="border-gray-800 hover:bg-gray-800/40 transition-all">
                    <TableCell className="hidden sm:table-cell">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-700">
                        <Image
                          alt={food.name}
                          className="object-cover"
                          fill
                          src={getImagePath(food.imageUrl) || "/img/placeholder.jpg"}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-200">{food.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-700 text-gray-300">
                        {food.category?.name ?? "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={food.isActive ? "default" : "secondary"}
                        className={
                          food.isActive
                            ? "bg-green-500/20 text-green-400 border-green-500/50"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/50"
                        }
                      >
                        {food.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-200">
                      Rs. {food.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(food)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(food)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Food Item</DialogTitle>
          </DialogHeader>
          {selectedFood && <FoodForm foodItem={selectedFood as any} onFormSubmit={handleEditFormSubmit} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {showMarkInactiveOption ? "Cannot Delete Item" : "Confirm Deletion"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {showMarkInactiveOption ? (
                <div className="space-y-2">
                  <p className="text-red-400">{deleteError}</p>
                  <p>Would you like to mark this item as inactive instead? This will hide it from customers while preserving order history.</p>
                </div>
              ) : (
`Are you sure you want to delete "${selectedFood?.name}" ? This action cannot be undone.`              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteError(null);
                setShowMarkInactiveOption(false);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            {showMarkInactiveOption ? (
              <>
                <Button variant="secondary" onClick={handleMarkInactive} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Mark as Inactive"
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleForceDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Force Deleting...
                    </>
                  ) : (
                    "Force Delete"
                  )}
                </Button>
              </>
            ) : (
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}