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
import { RawMaterialForm } from '@/components/raw-material-form';
import { RawMaterial, Supplier } from '@prisma/client';

type MaterialWithSupplier = RawMaterial & { supplier: Supplier | null };

export default function RawMaterialsPage() {
  const [materials, setMaterials] = useState<MaterialWithSupplier[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [materialsRes, suppliersRes] = await Promise.all([
        fetch('/api/raw-materials/list'),
        fetch('/api/suppliers/list')
      ]);
      setMaterials(await materialsRes.json());
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
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Material</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add Raw Material</DialogTitle></DialogHeader>
            <RawMaterialForm suppliers={suppliers} onFormSubmit={() => {
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
              <TableHead>Material</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => {
              const stockPercentage = Math.min((material.quantity / (material.restockThreshold * 2)) * 100, 100);
              const isLowStock = material.quantity <= material.restockThreshold;
              return (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{material.supplier?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Progress value={stockPercentage} className={isLowStock ? 'h-2 [&>div]:bg-red-500' : 'h-2'} />
                  </TableCell>
                  <TableCell className="text-right">{`${material.quantity} ${material.unit}`}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}