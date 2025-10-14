"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const FOOD_TYPE_FLAGS = [
  { bit: 1, label: "Veg" },
  { bit: 2, label: "Egg" },
  { bit: 4, label: "Dairy" },
  { bit: 8, label: "Meat" },
  { bit: 16, label: "Seafood" },
] as const;

type Category = {
  id: number;
  name: string;
};

export type FoodFormProps = {
  foodItem?: {
    id: number;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    categoryId: number;
    isActive: boolean;
    foodType: number;
    nutrition?: Record<string, number> | null;
  };
  onFormSubmit: () => void;
};

export function FoodForm({ foodItem, onFormSubmit }: FoodFormProps) {
  const [name, setName] = useState(foodItem?.name || "");
  const [description, setDescription] = useState(foodItem?.description || "");
  const [price, setPrice] = useState(foodItem?.price?.toString() || "");
  const [imageUrl, setImageUrl] = useState(foodItem?.imageUrl || "");
  const [categoryId, setCategoryId] = useState(foodItem?.categoryId?.toString() || "");
  const [foodType, setFoodType] = useState<number>(foodItem?.foodType ?? 0);
  const [nutrition, setNutrition] = useState<string>(
    JSON.stringify(
      foodItem?.nutrition ?? { calories: 0, protein: 0, carbs: 0, fat: 0 },
      null,
      2
    )
  );
  const [isActive, setIsActive] = useState(foodItem?.isActive ?? true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleFoodType = (bit: number, checked: boolean | string) => {
    setFoodType((prev) => {
      const isChecked = checked === true;
      return isChecked ? prev | bit : prev & ~bit;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let parsedNutrition: Record<string, number> | null = null;
      try {
        parsedNutrition = nutrition.trim() ? JSON.parse(nutrition) : null;
      } catch (error) {
        throw new Error("Nutrition must be valid JSON");
      }

      const payload = {
        name,
        description: description || null,
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        categoryId: parseInt(categoryId),
        isActive,
        foodType,
        nutrition: parsedNutrition,
      };

      const url = foodItem ? `/api/fooditems?id=${foodItem.id}` : "/api/fooditems";
      const method = foodItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save food item");
      }

      toast({
        title: "Success",
        description: `Food item ${foodItem ? "updated" : "created"} successfully!`,
      });

      onFormSubmit();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., Margherita Pizza"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the food item..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="price">Price (Rs.) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          placeholder="0.00"
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="img/fooditems/pizza.png"
        />
        <p className="text-xs text-gray-400 mt-1">Example: img/fooditems/1.png</p>
      </div>

      <div>
        <Label htmlFor="nutrition">Nutrition (JSON)</Label>
        <Textarea
          id="nutrition"
          value={nutrition}
          onChange={(e) => setNutrition(e.target.value)}
          rows={5}
          placeholder='{"calories": 320, "protein": 12, "carbs": 40, "fat": 10}'
        />
        <p className="text-xs text-gray-400 mt-1">Provide key/value pairs (kcal or grams).</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="category">Category *</Label>
          {isLoadingCategories ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading categories...
            </div>
          ) : (
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <Label>Food Type *</Label>
          <div className="mt-2 grid gap-2">
            {FOOD_TYPE_FLAGS.map((flag) => (
              <div key={flag.bit} className="flex items-center space-x-2">
                <Checkbox
                  id={`food-type-${flag.bit}`}
                  checked={(foodType & flag.bit) === flag.bit}
                  onCheckedChange={(checked) => toggleFoodType(flag.bit, checked)}
                />
                <Label htmlFor={`food-type-${flag.bit}`} className="text-sm font-medium leading-none">
                  {flag.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="isActive">Active (visible to customers)</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting || isLoadingCategories}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {foodItem ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{foodItem ? "Update" : "Create"} Food Item</>
          )}
        </Button>
      </div>
    </form>
  );
}