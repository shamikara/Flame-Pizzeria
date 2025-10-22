"use client";

import { useState, useEffect, useTransition } from 'react';
import type { recipe_status } from '@prisma/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import {
  approveRecipe,
  rejectRecipe,
  updateCommunityRecipe,
  deleteCommunityRecipe,
} from '@/app/actions/recipes';
import {
  Check,
  X,
  Users as UsersIcon,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Spinner } from "@/components/ui/spinner";
import { format } from 'date-fns';

const MODERATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const satisfies readonly recipe_status[];

type RecipeData = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  status: recipe_status;
  createdAt: string;
  updatedAt: string;
};

type UserWithRecipes = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  recipes: RecipeData[];
  _count: {
    recipes: number;
  };
};

async function getCustomersWithRecipes(): Promise<UserWithRecipes[]> {
  const res = await fetch('/api/users/with-recipes');
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export default function UsersPage() {
  const [customers, setCustomers] = useState<UserWithRecipes[]>([]);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [viewRecipe, setViewRecipe] = useState<RecipeData | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editRecipe, setEditRecipe] = useState<RecipeData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteRecipeTarget, setDeleteRecipeTarget] = useState<RecipeData | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    status: 'PENDING' as recipe_status,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getCustomersWithRecipes();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleApprove = (recipeId: number) => {
    startTransition(async () => {
      const result = await approveRecipe(recipeId);

      if (result.success) {
        toast({ title: "Success", description: "Recipe approved and published." });
        fetchData();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };
  
  const handleReject = (recipeId: number) => {
    startTransition(async () => {
      const result = await rejectRecipe(recipeId);

       if (result.success) {
        toast({ title: "Success", description: "Recipe has been rejected." });
        fetchData();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };

  const openViewDialog = (recipe: RecipeData) => {
    setViewRecipe(recipe);
    setIsViewOpen(true);
  };

  const openEditDialog = (recipe: RecipeData) => {
    setEditRecipe(recipe);
    setEditForm({
      name: recipe.name,
      description: recipe.description ?? '',
      imageUrl: recipe.imageUrl ?? '',
      status: recipe.status,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (recipe: RecipeData) => {
    setDeleteRecipeTarget(recipe);
    setIsDeleteOpen(true);
  };

  const handleEditFormChange = (field: 'name' | 'description' | 'imageUrl', value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateRecipe = () => {
    if (!editRecipe) return;

    startTransition(async () => {
      const result = await updateCommunityRecipe(editRecipe.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        imageUrl: editForm.imageUrl.trim() || null,
        status: editForm.status,
      });

      if (result.success) {
        toast({ title: "Recipe updated", description: "Changes saved successfully." });
        setIsEditOpen(false);
        setEditRecipe(null);
        fetchData();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };

  const handleDeleteRecipe = () => {
    if (!deleteRecipeTarget) return;

    startTransition(async () => {
      const result = await deleteCommunityRecipe(deleteRecipeTarget.id);

      if (result.success) {
        toast({ title: "Recipe removed", description: "The recipe has been deleted." });
        setIsDeleteOpen(false);
        setDeleteRecipeTarget(null);
        fetchData();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Customer & Recipe Management
        </h2>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 shadow-xl overflow-hidden p-6">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">
            <UsersIcon className="w-10 h-10 mx-auto mb-3 opacity-60" />
            Loading customers... <Spinner/>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <UsersIcon className="w-10 h-10 mx-auto mb-3 opacity-60" />
            No customers found.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {customers.map((customer) => (
              <AccordionItem value={customer.id.toString()} key={customer.id} className="border-gray-800">
                <AccordionTrigger className="hover:no-underline hover:bg-gray-800/40 px-4 rounded-lg transition-all">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${customer.email}`} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
                        {customer.firstName?.[0]}{customer.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="font-semibold text-gray-200">{customer.firstName} {customer.lastName}</div>
                      <div className="text-sm text-gray-400">{customer.email}</div>
                    </div>
                  </div>
                  <div className="ml-auto pr-4">
                    <Badge variant={customer._count.recipes > 0 ? "default" : "secondary"}
                           className={customer._count.recipes > 0 ? "bg-blue-500/20 text-blue-400 border-blue-500/50" : ""}>
                      {customer._count.recipes} Recipes
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {customer.recipes.length > 0 ? (
                    <div className="space-y-4 p-4 bg-gray-800/30 rounded-md">
                      {customer.recipes.map((recipe) => (
                        <div key={recipe.id} className="flex items-start justify-between gap-4 p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-all">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-200 text-lg">{recipe.name}</p>
                              {recipe.status === 'PENDING' && (
                                <span className="text-xs uppercase tracking-wide text-yellow-300">Awaiting review</span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                              <Badge
                                variant={
                                  recipe.status === 'APPROVED' ? 'default' :
                                  recipe.status === 'REJECTED' ? 'destructive' : 'secondary'
                                }
                                className={
                                  recipe.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                                  recipe.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                                  'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                                }
                              >
                                {recipe.status}
                              </Badge>
                              <span>Submitted {format(new Date(recipe.createdAt), 'PP')}</span>
                              <span>Updated {format(new Date(recipe.updatedAt), 'PP')}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <Button size="icon" variant="ghost" onClick={() => openViewDialog(recipe)}>
                                <Eye className="h-4 w-4 text-sky-300" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => openEditDialog(recipe)}>
                                <Pencil className="h-4 w-4 text-amber-300" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(recipe)}>
                                <Trash2 className="h-4 w-4 text-red-300" />
                              </Button>
                            </div>
                            {recipe.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <Button size="icon" variant="outline" onClick={() => handleApprove(recipe.id)} disabled={isPending}
                                        className="border-green-500/50 hover:bg-green-500/20">
                                  <Check className="h-4 w-4 text-green-400" />
                                </Button>
                                <Button size="icon" variant="outline" onClick={() => handleReject(recipe.id)} disabled={isPending}
                                        className="border-red-500/50 hover:bg-red-500/20">
                                  <X className="h-4 w-4 text-red-400" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 p-4">This user has not submitted any recipes.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100">
          <DialogHeader>
            <DialogTitle>{viewRecipe?.name}</DialogTitle>
            <DialogDescription>
              Submitted {viewRecipe ? format(new Date(viewRecipe.createdAt), 'PPpp') : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewRecipe?.imageUrl && (
              <img
                src={viewRecipe.imageUrl}
                alt={viewRecipe.name}
                className="max-h-64 w-full rounded-lg object-cover"
              />
            )}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
              {viewRecipe?.description}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100">
          <DialogHeader>
            <DialogTitle>Edit Recipe Submission</DialogTitle>
            <DialogDescription>
              Update the recipe content or status before publishing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Title</label>
              <Input
                value={editForm.name}
                onChange={(event) => handleEditFormChange('name', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Description</label>
              <Textarea
                rows={6}
                value={editForm.description}
                onChange={(event) => handleEditFormChange('description', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Image URL</label>
              <Input
                value={editForm.imageUrl}
                onChange={(event) => handleEditFormChange('imageUrl', event.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Status</label>
              <Select
                value={editForm.status}
                onValueChange={(value: recipe_status) => setEditForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-gray-900/70 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {MODERATION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateRecipe} disabled={isPending}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100">
          <DialogHeader>
            <DialogTitle>Remove Recipe</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The recipe will be permanently removed from the community submissions.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-red-500/30 bg-red-900/10 p-4 text-sm text-red-200">
            <p className="font-semibold">{deleteRecipeTarget?.name}</p>
            <p className="mt-1 text-red-300">Submitted {deleteRecipeTarget ? format(new Date(deleteRecipeTarget.createdAt), 'PPpp') : ''}</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRecipe} disabled={isPending}>
              Delete Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}