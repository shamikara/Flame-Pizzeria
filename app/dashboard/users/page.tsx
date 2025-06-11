"use client";

import { useState, useEffect, useTransition } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { approveRecipe, rejectRecipe } from '@/app/actions/recipes';
import { Check, X } from 'lucide-react';

// Define the shape of our data
type RecipeData = {
  id: string;
  name: string;
  status: string;
};
type UserWithRecipes = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  recipes: RecipeData[];
  _count: {
    recipes: number;
  };
};

// Data fetching function
async function getCustomersWithRecipes(): Promise<UserWithRecipes[]> {
  const res = await fetch('/api/users/with-recipes');
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export default function UsersPage() {
  const [customers, setCustomers] = useState<UserWithRecipes[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    getCustomersWithRecipes().then(setCustomers).catch(console.error);
  }, []);
  
  const handleApprove = (recipeId: string) => {
    startTransition(async () => {
      const result = await approveRecipe(recipeId);
      if (result.success) {
        toast({ title: "Success", description: "Recipe approved and published." });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };
  
  const handleReject = (recipeId: string) => {
    startTransition(async () => {
      const result = await rejectRecipe(recipeId);
       if (result.success) {
        toast({ title: "Success", description: "Recipe has been rejected." });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight mb-4">Customer & Recipe Management</h2>
      <Accordion type="single" collapsible className="w-full">
        {customers.map((customer) => (
          <AccordionItem value={customer.id} key={customer.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${customer.email}`} />
                  <AvatarFallback>{customer.firstName?.[0]}{customer.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-semibold">{customer.firstName} {customer.lastName}</div>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                </div>
              </div>
              <div className="ml-auto pr-4">
                <Badge variant={customer._count.recipes > 0 ? "default" : "secondary"}>
                  {customer._count.recipes} Recipes
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {customer.recipes.length > 0 ? (
                <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                  {customer.recipes.map((recipe) => (
                    <div key={recipe.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-background">
                      <div>
                        <p className="font-medium">{recipe.name}</p>
                        <Badge 
                           variant={
                            recipe.status === 'APPROVED' ? 'default' :
                            recipe.status === 'REJECTED' ? 'destructive' : 'secondary'
                          }
                        >
                          {recipe.status}
                        </Badge>
                      </div>
                      {recipe.status === 'PENDING' && (
                        <div className="flex gap-2">
                           <Button size="icon" variant="outline" onClick={() => handleApprove(recipe.id)} disabled={isPending}>
                            <Check className="h-4 w-4 text-green-500" />
                           </Button>
                           <Button size="icon" variant="outline" onClick={() => handleReject(recipe.id)} disabled={isPending}>
                             <X className="h-4 w-4 text-red-500" />
                           </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground p-4">This user has not submitted any recipes.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}