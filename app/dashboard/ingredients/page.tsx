"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Ingredient, Supplier } from '@prisma/client';
import { IngredientForm } from '@/components/ingredient-form';

type IngredientWithSupplier = Ingredient & { supplier: Supplier | null };

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<IngredientWithSupplier[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [ingredientsRes, suppliersRes] = await Promise.all([
        fetch('/api/ingredients/list'),
        fetch('/api/suppliers/list')
      ]);
      setIngredients(await ingredientsRes.json());
      setSuppliers(await suppliersRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Ingredient</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add Ingredient</DialogTitle></DialogHeader>
            <IngredientForm suppliers={suppliers} onFormSubmit={() => {
                setIsDialogOpen(false);
                fetchData();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ingredient) => {
              const stockPercentage = Math.min((ingredient.stock / (ingredient.restockThreshold * 2)) * 100, 100);
              const isLowStock = ingredient.stock <= ingredient.restockThreshold;
              return (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{ingredient.name}</TableCell>
                  <TableCell>{ingredient.supplier?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Progress value={stockPercentage} className={isLowStock ? 'h-2 [&>div]:bg-red-500' : 'h-2'} />
                  </TableCell>
                  <TableCell className="text-right">{`${ingredient.stock} ${ingredient.unit}`}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
