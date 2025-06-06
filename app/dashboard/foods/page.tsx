import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import Image from "next/image";
import { PlusCircle } from "lucide-react";

async function getFoodItems() {
  return db.foodItem.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });
}

export default async function FoodsPage() {
  const foods = await getFoodItems();

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Menu Items</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {foods.map((food) => (
              <TableRow key={food.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={food.name}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={food.imageUrl || "/img/placeholder.jpg"} // Use a placeholder
                    width="64"
                  />
                </TableCell>
                <TableCell className="font-medium">{food.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{food.category?.name ?? 'Uncategorized'}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={food.isActive ? 'default' : 'secondary'}>
                    {food.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${food.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}