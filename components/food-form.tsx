"use client";

import { useEffect, useMemo, useState } from "react";

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
  nextFoodId?: number;
};

export function FoodForm({ foodItem, onFormSubmit, nextFoodId }: FoodFormProps) {
  const [name, setName] = useState(foodItem?.name || "");
  const [description, setDescription] = useState(foodItem?.description || "");
  const [price, setPrice] = useState(foodItem?.price?.toString() || "");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [categoryId, setCategoryId] = useState(foodItem?.categoryId?.toString() || "");
  const [foodType, setFoodType] = useState<number>(foodItem?.foodType ?? 0);
  const [nutritionValues, setNutritionValues] = useState<Record<string, string>>(() => {
    const defaults = {
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      fiber: "",
      sugar: "",
      sodium: "",
      potassium: "",
      calcium: "",
      iron: "",
      water: "",
    };

    if (!foodItem?.nutrition) {
      return defaults;
    }

    return Object.entries(foodItem.nutrition).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        acc[key] = value?.toString?.() ?? "";
        return acc;
      },
      defaults
    );
  });
  
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

  const nutritionFields = useMemo(
    () => [
      { key: "calories", label: "Calories (kcal)" },
      { key: "protein", label: "Protein (g)" },
      { key: "carbs", label: "Carbohydrates (g)" },
      { key: "fat", label: "Fat (g)" },
      { key: "fiber", label: "Fiber (g)" },
      { key: "sugar", label: "Sugar (g)" },
      { key: "sodium", label: "Sodium (mg)" },
      { key: "potassium", label: "Potassium (mg)" },
      { key: "calcium", label: "Calcium (mg)" },
      { key: "iron", label: "Iron (mg)" },
      { key: "water", label: "Water (g)" },
    ],
    []
  );

  const toggleFoodType = (bit: number, checked: boolean | string) => {
    setFoodType((prev) => {
      const isChecked = checked === true;
      return isChecked ? prev | bit : prev & ~bit;
    });
  };

  const handleNutritionChange = (key: string, rawValue: string) => {
    if (!rawValue || /^\d*(\.\d*)?$/.test(rawValue)) {
      setNutritionValues((prev) => ({ ...prev, [key]: rawValue }));
    }
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setImageFile(null);
      return;
    }

    if (file.type !== "image/png") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG image.",
        variant: "destructive",
      });
      event.target.value = "";
      setImageFile(null);
      return;
    }

    if (file.size > 500 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be 500KB or smaller.",
        variant: "destructive",
      });
      event.target.value = "";
      setImageFile(null);
      return;
    }

    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const nutritionPayload = Object.entries(nutritionValues).reduce<Record<string, number>>((acc, [key, value]) => {
        if (value.trim() !== "") {
          acc[key] = parseFloat(value);
        }
        return acc;
      }, {});

      if (!foodItem && !imageFile) {
        throw new Error("Please upload a PNG image for the new food item");
      }

      if (!categoryId) {
        throw new Error("Please select a category");
      }

      const url = foodItem ? `/api/fooditems?id=${foodItem.id}` : "/api/fooditems";
      const method = foodItem ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("categoryId", categoryId);
      formData.append("isActive", JSON.stringify(isActive));
      formData.append("foodType", JSON.stringify(foodType));
      formData.append("nutrition", JSON.stringify(nutritionPayload));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save food item");
      }

      // Ensure the file input clears
      const fileInput = document.getElementById("imageFile") as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = "";
      }

      toast({
        title: "Success",
        description: `Food item ${foodItem ? "updated" : "created"} successfully!`,
      });

      setImageFile(null);

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

  const imageHintId = foodItem?.id ?? nextFoodId;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
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

      <div>
        <Label>Nutrition</Label>
        <div className="overflow-hidden rounded-md border border-gray-700">
          <div className="grid grid-cols-2 bg-gray-800/80 text-xs uppercase tracking-wide text-gray-400">
            <div className="px-3 py-2">Nutrient</div>
            <div className="px-3 py-2">Value</div>
          </div>
          <div className="divide-y divide-gray-800">
            {nutritionFields.map((field) => (
              <div key={field.key} className="grid grid-cols-2">
                <div className="px-3 py-2 text-sm text-gray-300 flex items-center">
                  {field.label}
                </div>
                <div className="px-3 py-2">
                  <Input
                    inputMode="decimal"
                    value={nutritionValues[field.key] ?? ""}
                    onChange={(event) => handleNutritionChange(field.key, event.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageFile">Upload Image *</Label>
        <Input
          id="imageFile"
          type="file"
          accept="image/png"
          onChange={handleImageFileChange}
        />
        <p className="text-xs text-gray-400">
          PNG only, up to 500KB. Saved as `img/fooditems/{imageHintId ?? "next"}.png`.
        </p>
        {imageFile && (
          <div className="text-xs text-gray-400">Selected file: {imageFile.name}</div>
        )}
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