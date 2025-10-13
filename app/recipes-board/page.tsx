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
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
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

  const handleDelete = async (recipeId: string) => {
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

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Community Recipe Board</h1>
        
        <div className="flex gap-3">
          {user && (
            <>
             <Button 
  variant={showMyRecipes ? "default" : "outline"}
  onClick={handleToggleView}
>
  {showMyRecipes ? "View All Recipes" : "My Recipes"}
</Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Recipe
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Share Your Recipe</DialogTitle>
                  </DialogHeader>
                  <CommunityRecipeForm 
                    onSuccess={() => {
                      setIsDialogOpen(false);
                      fetchMyRecipes();
                    }} 
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner />
        </div>
      ) : displayRecipes.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          {showMyRecipes ? "You haven't posted any recipes yet" : "No recipes available"}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white/20 backdrop-blur-md rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all hover:bg-white/30 relative"
            >
              <div 
                className="cursor-pointer"
                onClick={() => setSelected(recipe)}
              >
                <div className="relative w-full h-48">
                  <Image
                    src={recipe.imageUrl || "/img/noticeboard/recipes/default.jpg"}
                    alt={recipe.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{recipe.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    ✍️ by {recipe.author.firstName} {recipe.author.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(recipe.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {showMyRecipes && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge variant={
                    recipe.status === 'APPROVED' ? 'default' :
                    recipe.status === 'REJECTED' ? 'destructive' : 'secondary'
                  }>
                    {recipe.status}
                  </Badge>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(recipe.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[url('/img/noticeboard/board.png')] bg-cover bg-no-repeat bg-center rounded-lg">
            <div className="bg-white/40 backdrop-blur-md rounded-lg shadow-xl max-w-4xl max-h-[80vh] overflow-y-auto w-full p-6 relative">
              <button
                className="absolute top-4 right-4 border border-white hover:text-red-500 text-xl font-bold rounded-sm opacity-50 hover:opacity-100 transition-opacity"
                onClick={() => setSelected(null)}
              >
                <X className="h-6 w-6" />
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
              <p className="text-sm text-muted-foreground mb-4">
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