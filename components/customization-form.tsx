"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

type FoodItem = {
  id: number;
  name: string;
};

type CustomizationFormProps = {
  customization?: {
    id: number;
    name: string;
    price: number;
    foodItemId: number;
  };
  onFormSubmit: () => void;
};

export function CustomizationForm({ customization, onFormSubmit }: CustomizationFormProps) {
  const [name, setName] = useState(customization?.name || "");
  const [price, setPrice] = useState(customization?.price?.toString() || "");
  const [foodItemId, setFoodItemId] = useState(customization?.foodItemId?.toString() || "");
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFoodItems, setIsLoadingFoodItems] = useState(true);
  const { toast } = useToast();

  const foodOptions: ComboboxOption[] = foodItems.map((item) => ({
    value: item.id.toString(),
    label: item.name,
  }));

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const res = await fetch("/api/fooditems/list");
        if (res.ok) {
          const data = await res.json();
          setFoodItems(data);
        }
      } catch (error) {
        console.error("Failed to fetch food items:", error);
      } finally {
        setIsLoadingFoodItems(false);
      }
    };

    fetchFoodItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name,
        price: parseFloat(price),
        foodItemId: parseInt(foodItemId),
      };

      const url = customization
        ? `/api/customizations?id=${customization.id}`
        : "/api/customizations";
      const method = customization ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save customization");
      }

      toast({
        title: "Success",
        description: `Customization ${customization ? "updated" : "created"} successfully!`,
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
        <Label htmlFor="name">Customization Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., Extra Cheese, Extra Pepperoni"
        />
      </div>

      <div>
        <Label htmlFor="price">Additional Price (Rs.) *</Label>
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
        <Label htmlFor="foodItem">Food Item *</Label>
        {isLoadingFoodItems ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading food items...
          </div>
        ) : foodOptions.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No food items available. Add a food first to enable customizations.
          </div>
        ) : (
          <Combobox
            value={foodItemId}
            onChange={(value) => {
              if (!value) return;
              setFoodItemId(value);
            }}
            options={foodOptions}
            placeholder="Select a food item"
            searchPlaceholder="Search foods"
            emptyMessage="No foods found"
          />
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting || isLoadingFoodItems || foodOptions.length === 0 || !foodItemId}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {customization ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{customization ? "Update" : "Create"} Customization</>
          )}
        </Button>
      </div>
    </form>
  );
}