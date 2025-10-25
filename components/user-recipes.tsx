'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CommunityRecipeForm } from "./community-recipe-form";
import { useSession } from '@/components/session-provider';

type RecipeWithAuthor = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  likes: { userId: string }[];
  _count?: {
    likes: number;
    comments: number;
  };
};

export function UserRecipes() {
  const [recipes, setRecipes] = useState<RecipeWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState<RecipeWithAuthor | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();
  const { user, isLoading: isSessionLoading } = useSession();

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/community-recipes/my-recipes');
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error || 'Failed to fetch recipes');
      }
      const data = await response.json();
      const payload = Array.isArray(data) ? data : data.recipes;
      setRecipes(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recipes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isSessionLoading) return;

    if (!user) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    fetchRecipes();
  }, [isSessionLoading, user, fetchRecipes]);

  if (isSessionLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Please sign in to view your recipes</h3>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Recipes</h2>
          <p className="text-sm text-muted-foreground">Manage the dishes you’ve shared with Flames.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
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
                onSuccess={async () => {
                  setIsDialogOpen(false);
                  await fetchRecipes();
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-lg">
          <h3 className="text-lg font-medium text-gray-300">You havent shared a recipe yet</h3>
          <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
            Showcase your favouritessubmit a new recipe to get started.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/recipes/share">Share Your First Recipe</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="border-gray-800 bg-gray-900/50 hover:bg-gray-900/70 transition-colors h-full flex flex-col">
              <button
                type="button"
                onClick={() => {
                  setDetailRecipe(recipe);
                  setIsDetailOpen(true);
                }}
                className="block text-left"
              >
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={`/img/recipes/${recipe.id}.jpg`}
                    alt={recipe.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/img/recipe-placeholder.jpg';
                    }}
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{recipe.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[40px]">
                    {recipe.description}
                  </CardDescription>
                </CardHeader>
              </button>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>❤️ {recipe._count?.likes ?? 0}</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>💬 {recipe._count?.comments ?? 0}</span>
                  </Badge>
                  <Badge
                    variant={recipe.status === 'APPROVED' ? 'default' : recipe.status === 'PENDING' ? 'secondary' : 'destructive'}
                    className="text-xs uppercase tracking-wide"
                  >
                    {recipe.status.toLowerCase().replace(/(^|\s)\S/g, (s) => s.toUpperCase())}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400">
                  <p>By: {recipe.author.firstName} {recipe.author.lastName?.charAt(0)}.</p>
                  <p className="text-xs mt-1">
                    {new Date(recipe.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="mt-auto flex gap-2">
                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={() => {
                    setDetailRecipe(recipe);
                    setIsDetailOpen(true);
                  }}
                >
                  View Recipe
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Delete recipe"
                  disabled={deletingId === recipe.id}
                  onClick={async () => {
                    const confirmed = confirm('Remove this recipe?');
                    if (!confirmed) return;
                    try {
                      setDeletingId(recipe.id);
                      const response = await fetch(`/api/community-recipes/${recipe.id}`, {
                        method: 'DELETE',
                      });
                      if (!response.ok) {
                        const errorBody = await response.json().catch(() => ({}));
                        throw new Error(errorBody?.error || 'Failed to delete');
                      }
                      toast({ title: 'Recipe removed', description: 'Your recipe has been deleted.' });
                      await fetchRecipes();
                    } catch (error) {
                      console.error('Failed to delete recipe:', error);
                      toast({
                        title: 'Deletion failed',
                        description: error instanceof Error ? error.message : 'Please try again later.',
                        variant: 'destructive',
                      });
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                >
                  {deletingId === recipe.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDetailOpen} onOpenChange={(open) => {
        setIsDetailOpen(open);
        if (!open) setDetailRecipe(null);
      }}>
        <DialogContent className="max-w-3xl border-gray-800 bg-gray-950/90 text-gray-100">
          {detailRecipe && (
            <div className="space-y-6">
              <div className="relative h-72 w-full overflow-hidden rounded-xl border border-gray-800">
                <Image
                  src={`/img/recipes/${detailRecipe.id}.jpg`}
                  alt={detailRecipe.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/img/recipe-placeholder.jpg';
                  }}
                />
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">{detailRecipe.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Shared on {new Date(detailRecipe.createdAt).toLocaleString()} · Status: {detailRecipe.status}
                </p>
              </DialogHeader>
              <div className="flex flex-wrap gap-3 text-sm">
                <Badge variant="secondary">❤️ {detailRecipe._count?.likes ?? 0} likes</Badge>
                <Badge variant="secondary">💬 {detailRecipe._count?.comments ?? 0} comments</Badge>
                <Badge variant="outline">
                  Author: {detailRecipe.author.firstName} {detailRecipe.author.lastName ?? ''}
                </Badge>
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
                <h3 className="mb-2 font-semibold uppercase tracking-wide text-xs text-muted-foreground">Description</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
                  {detailRecipe.description || 'No description provided.'}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>Close</Button>
                <Button asChild variant="secondary">
                  <Link href={`/recipes/${detailRecipe.id}`} target="_blank" rel="noreferrer">
                    Open Full Page
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
