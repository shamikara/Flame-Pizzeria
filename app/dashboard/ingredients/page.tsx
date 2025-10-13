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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, PackageOpen, AlertTriangle, Clock } from "lucide-react";
import { Ingredient, Supplier } from "@prisma/client";
import { IngredientForm } from "@/components/ingredient-form";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PackagePlus } from "lucide-react";
import { RestockForm } from "@/components/restock-form";

type IngredientWithSupplier = Ingredient & { supplier: Supplier | null };

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<IngredientWithSupplier[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ingredientsRes, suppliersRes] = await Promise.all([
        fetch("/api/ingredients/list"),
        fetch("/api/suppliers/list"),
      ]);
      setIngredients(await ingredientsRes.json());
      setSuppliers(await suppliersRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate alerts
  const lowStockItems = ingredients.filter(i => i.stock <= i.restockThreshold);
  const expiringItems = ingredients.filter(i => {
    if (!i.expiryDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  });
  const expiredItems = ingredients.filter(i => {
    if (!i.expiryDate) return false;
    return new Date(i.expiryDate) < new Date();
  });

  const getExpiryStatus = (expiryDate: Date | null) => {
    if (!expiryDate) return null;
    const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return { status: 'expired', days: Math.abs(daysUntilExpiry), color: 'text-red-500' };
    if (daysUntilExpiry <= 7) return { status: 'expiring', days: daysUntilExpiry, color: 'text-yellow-500' };
    return { status: 'good', days: daysUntilExpiry, color: 'text-gray-400' };
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Inventory Management
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md hover:shadow-lg transition-all">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-white">
                Add New Ingredient
              </DialogTitle>
            </DialogHeader>
            <IngredientForm
              suppliers={suppliers}
              onFormSubmit={() => {
                setIsDialogOpen(false);
                fetchData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts Section */}
      {(lowStockItems.length > 0 || expiringItems.length > 0 || expiredItems.length > 0) && (
        <div className="space-y-4 mb-6">
          {expiredItems.length > 0 && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-red-500">Expired Items!</AlertTitle>
              <AlertDescription className="text-red-400">
                {expiredItems.length} item(s) have expired: {expiredItems.map(i => i.name).join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {expiringItems.length > 0 && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <Clock className="h-4 w-4 text-yellow-500" />
              <AlertTitle className="text-yellow-500">Expiring Soon!</AlertTitle>
              <AlertDescription className="text-yellow-400">
                {expiringItems.length} item(s) expiring within 7 days: {expiringItems.map(i => i.name).join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {lowStockItems.length > 0 && (
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertTitle className="text-orange-500">Low Stock Alert!</AlertTitle>
              <AlertDescription className="text-orange-400">
                {lowStockItems.length} item(s) need restocking: {lowStockItems.map(i => i.name).join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">
            <PackageOpen className="w-10 h-10 mx-auto mb-3 opacity-60" />
            Loading inventory... <Spinner />
          </div>
        ) : ingredients.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <PackageOpen className="w-10 h-10 mx-auto mb-3 opacity-60" />
            No ingredients found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">Ingredient</TableHead>
                <TableHead className="text-gray-300">Supplier</TableHead>
                <TableHead className="text-gray-300">Stock Level</TableHead>
                <TableHead className="text-gray-300">Expiry</TableHead>
                <TableHead className="text-right text-gray-300">Stock / Actions</TableHead>              
                </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => {
                const stockPercentage = Math.min(
                  (ingredient.stock / (ingredient.restockThreshold * 2)) * 100,
                  100
                );
                const isLowStock = ingredient.stock <= ingredient.restockThreshold;
                const expiryStatus = getExpiryStatus(ingredient.expiryDate);

                return (
                  <TableRow
                    key={ingredient.id}
                    className="border-gray-800 hover:bg-gray-800/40 transition-all"
                  >
                    <TableCell className="font-medium text-gray-200">
                      <div className="flex items-center gap-2">
                        {ingredient.name}
                        {isLowStock && (
                          <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                            Low
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {ingredient.supplier?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <Progress
                        value={stockPercentage}
                        className={`h-2 rounded-full transition-all ${isLowStock
                            ? "[&>div]:bg-red-500 animate-pulse"
                            : "[&>div]:bg-green-500"
                          }`}
                      />
                    </TableCell>
                    <TableCell>
                      {expiryStatus ? (
                        <span className={`text-sm ${expiryStatus.color}`}>
                          {expiryStatus.status === 'expired'
                            ? `Expired ${expiryStatus.days}d ago`
                            : expiryStatus.status === 'expiring'
                              ? `${expiryStatus.days}d left`
                              : `${expiryStatus.days}d`
                          }
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-gray-200 font-semibold">
                          {ingredient.stock} {ingredient.unit}
                        </span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                            >
                              <PackagePlus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-semibold text-white">
                                Restock {ingredient.name}
                              </DialogTitle>
                            </DialogHeader>
                            <RestockForm
                              ingredient={ingredient}
                              onSuccess={fetchData}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}