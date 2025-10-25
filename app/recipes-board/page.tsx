"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, PlusCircle, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CommunityRecipeForm } from "@/components/community-recipe-form";
import { useSession } from "@/components/session-provider";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

type Recipe = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default function RecipesBoardPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMyRecipes, setShowMyRecipes] = useState(false);
  const { user } = useSession();
  const { toast } = useToast();

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/community-recipes');
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRecipes = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/community-recipes/my-recipes');
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch recipes');
      }
      const data = await res.json();
      setMyRecipes(data);
    } catch (error: any) {
      console.error("Failed to fetch my recipes:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load your recipes",
        variant: "destructive",
      });
    }
  };

  const handleToggleView = () => {
    setShowMyRecipes(!showMyRecipes);
    if (!showMyRecipes && myRecipes.length === 0) {
      // Fetch my recipes if we're switching to "My Recipes" view and haven't loaded them yet
      fetchMyRecipes();
    }
  };

  useEffect(() => {
    fetchRecipes();
    if (user) {
      fetchMyRecipes();
    }
  }, [user]);

  const handleDelete = async (recipeId: number) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    try {
      const res = await fetch(`/api/community-recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({ title: "Success", description: "Recipe deleted successfully" });
        fetchMyRecipes();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete recipe", variant: "destructive" });
    }
  };

  const displayRecipes = showMyRecipes ? myRecipes : recipes;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Community Recipe Board</h1>
          <p className="text-sm text-muted-foreground">
            {showMyRecipes ? 'Your shared recipes' : 'Discover recipes from our community'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showMyRecipes ? "outline" : "default"}
            onClick={() => setShowMyRecipes(false)}
            className="gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Community Recipes
          </Button>
          <Button
            variant={showMyRecipes ? "default" : "outline"}
            onClick={handleToggleView}
            className="gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chef-hat">
              <path d="M6 13.87A4 4 0 0 1 7.41 7a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.1 5.1 0 0 1 16.59 7 4 4 0 0 1 18 13.87"/>
              <path d="M8 22h8"/>
              <path d="M12 15v7"/>
              <path d="M12 13.87V10"/>
            </svg>
            My Recipes
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Share Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Share Your Recipe</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Share your favorite recipe with the community. Our team will review it before publishing.
                </p>
              </DialogHeader>
              <div className="py-4">
                <CommunityRecipeForm
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    fetchMyRecipes();
                    if (!showMyRecipes) {
                      fetchRecipes();
                    }
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8">
            <Spinner />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(showMyRecipes ? myRecipes : recipes).map((recipe) => (
            <div
              key={recipe.id}
              className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 bg-card text-card-foreground"
            >
              <div className="relative h-48 bg-muted/50">
                {recipe.imageUrl ? (
                  <Image
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground/30 h-16 w-16"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                )}
                {showMyRecipes && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(recipe.id);
                      }}
                      className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="absolute bottom-2 left-2">
                  <Badge variant={getStatusBadgeVariant(recipe.status)}>
                    {recipe.status.charAt(0) + recipe.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-lg font-semibold line-clamp-1">{recipe.name}</h3>
                  <div className="flex-shrink-0 text-xs text-muted-foreground">
                    {formatDate(recipe.createdAt)}
                  </div>
                </div>
                {recipe.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {recipe.description}
                  </p>
                )}
                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {recipe.author.firstName?.[0]}{recipe.author.lastName?.[0]}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {recipe.author.firstName} {recipe.author.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {recipe.author.email}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View Recipe
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[url('/img/noticeboard/board.png')] bg-cover bg-no-repeat bg-center rounded-lg">
            <div className="bg-white/20 backdrop-blur-md rounded-lg shadow-xl max-w-4xl max-h-[80vh] overflow-y-auto w-full p-6 relative">
              <button
                className="absolute z-50 top-4 right-4 border-2 border-red-500 hover:text-red-800 text-red-500 text-xl font-bold rounded-sm  "
                onClick={() => setSelected(null)}
              >
                <X className="h-8 w-8" />
              </button>

              {selected.imageUrl && (
                <div className="relative w-full h-[400px] rounded-md mb-4">
                  <Image
                    src={selected.imageUrl}
                    alt={selected.name}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              )}

              <h2 className="text-2xl font-bold mb-2">{selected.name}</h2>
              <p className="text-sm text-gray-800 mb-4">
                ✍️ By {selected.author.firstName} {selected.author.lastName} — {new Date(selected.createdAt).toLocaleDateString()}
              </p>
              <div className="prose prose-sm max-w-none">
                <p className="text-base text-gray-800 whitespace-pre-wrap">{selected.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}