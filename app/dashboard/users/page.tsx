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
import { useToast } from '@/hooks/use-toast';
import { approveRecipe, rejectRecipe } from '@/app/actions/recipes';
import { Check, X, Users as UsersIcon } from 'lucide-react';
import { Spinner } from "@/components/ui/spinner";

type RecipeData = {
  id: number;
  name: string;
  status: string;
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
                        <div key={recipe.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-all">
                          <div>
                            <p className="font-medium text-gray-200">{recipe.name}</p>
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
    </div>
  );
}