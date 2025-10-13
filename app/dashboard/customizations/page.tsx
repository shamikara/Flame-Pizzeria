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
import { PlusCircle, Settings, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CustomizationForm } from "@/components/customization-form";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

type Customization = {
  id: number;
  name: string;
  price: number;
  foodItemId: number;
  foodItem: {
    id: number;
    name: string;
  };
};

async function getCustomizations(): Promise<Customization[]> {
  const res = await fetch("/api/customizations", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch customizations");
  return res.json();
}

export default function CustomizationsPage() {
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomization, setSelectedCustomization] = useState<Customization | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getCustomizations();
      setCustomizations(data);
    } catch (error) {
      console.error("Failed to fetch customizations:", error);
      toast({
        title: "Error",
        description: "Failed to load customizations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (customization: Customization) => {
    setSelectedCustomization(customization);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (customization: Customization) => {
    setSelectedCustomization(customization);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomization) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/customizations?id=${selectedCustomization.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete customization");
      }

      toast({
        title: "Success",
        description: `${selectedCustomization.name} has been deleted.`,
      });

      setDeleteDialogOpen(false);
      setSelectedCustomization(null);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = () => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedCustomization(null);
    fetchData();
  };

  // Group customizations by food item
  const groupedCustomizations = customizations.reduce((acc, custom) => {
    const foodName = custom.foodItem.name;
    if (!acc[foodName]) {
      acc[foodName] = [];
    }
    acc[foodName].push(custom);
    return acc;
  }, {} as Record<string, Customization[]>);

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Customization Management
          </h2>
          <p className="text-gray-400 mt-2">Manage add-ons and customizations for menu items</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Customization
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Customization</DialogTitle>
            </DialogHeader>
            <CustomizationForm onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-gray-800 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Customizations</CardTitle>
            <Settings className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{customizations.length}</div>
            <p className="text-xs text-gray-400 mt-1">Available add-ons</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-pink-500/10 to-pink-600/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Food Items</CardTitle>
            <Settings className="h-5 w-5 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Object.keys(groupedCustomizations).length}</div>
            <p className="text-xs text-gray-400 mt-1">With customizations</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg Price</CardTitle>
            <Settings className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              Rs. {customizations.length > 0 
                ? (customizations.reduce((sum, c) => sum + c.price, 0) / customizations.length).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-gray-400 mt-1">Per customization</p>
          </CardContent>
        </Card>
      </div>

      {/* Customizations Table */}
      <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <Settings className="w-10 h-10 mx-auto mb-3 opacity-60 animate-pulse" />
            <Spinner /> Loading customizations...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">Customization Name</TableHead>
                <TableHead className="text-gray-300">Food Item</TableHead>
                <TableHead className="text-right text-gray-300">Price</TableHead>
                <TableHead className="text-right text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                    <Settings className="w-10 h-10 mx-auto mb-3 opacity-60" />
                    No customizations found
                  </TableCell>
                </TableRow>
              ) : (
                customizations.map((customization) => (
                  <TableRow key={customization.id} className="border-gray-800 hover:bg-gray-800/40 transition-all">
                    <TableCell className="font-medium text-gray-200">{customization.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                        {customization.foodItem.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-200">
                      Rs. {customization.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(customization)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(customization)}
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
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Customization</DialogTitle>
          </DialogHeader>
          {selectedCustomization && (
            <CustomizationForm
              customization={selectedCustomization}
              onFormSubmit={handleFormSubmit}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{selectedCustomization?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Spinner /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}