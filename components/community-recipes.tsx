'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { recipe } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';

type RecipeWithAuthor = recipe & {
  author: {
    firstName: string | null;
    lastName: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
};

export function CommunityRecipes() {
  const [recipes, setRecipes] = useState<RecipeWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/recipes/community?page=${page}`);
        if (!response.ok) throw new Error('Failed to fetch community recipes');
        
        const data = await response.json();
        setRecipes(prev => page === 1 ? data.recipes : [...prev, ...data.recipes]);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error('Error fetching community recipes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load community recipes. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const toggleLike = async (recipeId: number) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/like`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to update like status');

      setRecipes(recipes.map(recipe => {
        if (recipe.id === recipeId) {
          const isLiked = !recipe.isLiked;
          return {
            ...recipe,
            isLiked,
            _count: {
              ...recipe._count,
              likes: isLiked ? recipe._count.likes + 1 : Math.max(0, recipe._count.likes - 1)
            }
          };
        }
        return recipe;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading && page === 1) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-gray-800 bg-gray-900/50">
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Community Recipes</h2>
          <p className="text-sm text-gray-400">Discover delicious recipes shared by our community</p>
        </div>
        <Button asChild>
          <Link href="/recipes-board/new">
            <Plus className="h-4 w-4 mr-2" />
            Share a Recipe
          </Link>
        </Button>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-lg">
          <h3 className="text-lg font-medium text-gray-300">No recipes yet</h3>
          <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
            Be the first to share your favorite recipe with the community!
          </p>
          <Button className="mt-4" asChild>
            <Link href="/recipes-board/new">Share Your First Recipe</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="border-gray-800 bg-gray-900/50 hover:bg-gray-900/70 transition-colors h-full flex flex-col">
                <Link href={`/recipes/${recipe.id}`} className="block">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={recipe.imageUrl || '/img/recipe-placeholder.jpg'}
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
                </Link>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`flex items-center gap-1 ${recipe.isLiked ? 'text-red-500' : 'text-gray-400'}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleLike(recipe.id);
                      }}
                    >
                      ❤️ {recipe._count.likes}
                    </Button>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      💬 {recipe._count.comments}
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
                <CardFooter className="mt-auto">
                  <Button asChild className="w-full">
                    <Link href={`/recipes/${recipe.id}`}>
                      View Recipe
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
