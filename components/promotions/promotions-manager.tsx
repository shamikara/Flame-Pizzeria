"use client";

import { useEffect, useMemo, useState } from "react";
import NextImage from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Megaphone, Plus, Upload, X } from "lucide-react";

interface PromotionBanner {
  id: number;
  title: string;
  description: string;
  buttonText: string | null;
  buttonLink: string | null;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PromotionFormValues {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  imageFile: File | null;
}

async function validateImageFile(file: File) {
  const allowedTypes = ["image/jpeg", "image/jpg"];
  const maxSize = 1024 * 1024; // 1MB
  const requiredWidth = 1248;
  const requiredHeight = 500;

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPG images are allowed (image/jpeg).");
  }

  if (file.size > maxSize) {
    throw new Error("Image must be 1MB or smaller.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error("Unable to read image dimensions."));
      img.src = objectUrl;
    });

    if (dimensions.width !== requiredWidth || dimensions.height !== requiredHeight) {
      throw new Error(`Image must be exactly ${requiredWidth}x${requiredHeight}px.`);
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function getInitialFormValues(promotion?: PromotionBanner): PromotionFormValues {
  if (!promotion) {
    const today = new Date().toISOString().slice(0, 10);
    return {
      title: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      startDate: today,
      endDate: today,
      isActive: true,
      imageFile: null,
    };
  }

  return {
    title: promotion.title,
    description: promotion.description,
    buttonText: promotion.buttonText ?? "",
    buttonLink: promotion.buttonLink ?? "",
    startDate: promotion.startDate.slice(0, 10),
    endDate: promotion.endDate.slice(0, 10),
    isActive: promotion.isActive,
    imageFile: null,
  };
}

function PromotionForm({
  initialPromotion,
  onSubmit,
  submitLabel,
}: {
  initialPromotion?: PromotionBanner;
  onSubmit: (values: PromotionFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [values, setValues] = useState<PromotionFormValues>(() => getInitialFormValues(initialPromotion));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setValues(getInitialFormValues(initialPromotion));
    setFormError(null);
  }, [initialPromotion]);

  const handleChange = (
    field: keyof Omit<PromotionFormValues, "imageFile">,
    value: string | boolean,
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setValues((prev) => ({ ...prev, imageFile: file }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!values.title.trim() || !values.description.trim()) {
      setFormError("Title and description are required.");
      return;
    }

    if (!values.startDate || !values.endDate) {
      setFormError("Start and end dates are required.");
      return;
    }

    if (new Date(values.startDate) > new Date(values.endDate)) {
      setFormError("Start date must be before end date.");
      return;
    }

    if (!initialPromotion && !values.imageFile) {
      setFormError("Please upload a banner image.");
      return;
    }

    try {
      if (values.imageFile) {
        await validateImageFile(values.imageFile);
      }

      setIsSubmitting(true);
      await onSubmit(values);
      setValues(getInitialFormValues(initialPromotion));
    } catch (error: any) {
      setFormError(error.message ?? "Failed to submit promotion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-gray-200" htmlFor="promo-title">
            Title
          </Label>
          <Input
            id="promo-title"
            value={values.title}
            onChange={(event) => handleChange("title", event.target.value)}
            placeholder="Eg: Festive Feast Specials"
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-200" htmlFor="promo-button-text">
            Button Label
          </Label>
          <Input
            id="promo-button-text"
            value={values.buttonText}
            onChange={(event) => handleChange("buttonText", event.target.value)}
            placeholder="Eg: Order Now"
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-gray-200" htmlFor="promo-button-link">
            Button Link
          </Label>
          <Input
            id="promo-button-link"
            value={values.buttonLink}
            onChange={(event) => handleChange("buttonLink", event.target.value)}
            placeholder="https://example.com/promo"
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch
            id="promo-is-active"
            checked={values.isActive}
            onCheckedChange={(checked) => handleChange("isActive", checked)}
          />
          <Label htmlFor="promo-is-active" className="text-gray-200">
            Active promotion
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-200" htmlFor="promo-description">
          Description
        </Label>
        <Textarea
          id="promo-description"
          value={values.description}
          onChange={(event) => handleChange("description", event.target.value)}
          rows={4}
          placeholder="Describe the promotion details..."
          className="bg-gray-900 border-gray-700 text-white"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-gray-200" htmlFor="promo-start-date">
            Start Date
          </Label>
          <Input
            id="promo-start-date"
            type="date"
            value={values.startDate}
            onChange={(event) => handleChange("startDate", event.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-200" htmlFor="promo-end-date">
            End Date
          </Label>
          <Input
            id="promo-end-date"
            type="date"
            value={values.endDate}
            onChange={(event) => handleChange("endDate", event.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-200" htmlFor="promo-image">
          Banner Image (JPG • 1248x500 • ≤ 1MB)
        </Label>
        <Input
          id="promo-image"
          type="file"
          accept="image/jpeg,image/jpg"
          onChange={handleImageChange}
          className="bg-gray-900 border-gray-700 text-white file:text-white"
        />
        {values.imageFile && (
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Upload className="h-4 w-4" />
            {values.imageFile.name}
          </div>
        )}
      </div>

      {formError && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-500/30 rounded-md px-3 py-2">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

export default function PromotionsManager() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<PromotionBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionBanner | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPromotions = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/promotion-banners");
      if (!res.ok) {
        throw new Error("Failed to load promotions");
      }
      const data = await res.json();
      setPromotions(data.promotions ?? []);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Unable to load promotion banners.", variant: "destructive" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const sortedPromotions = useMemo(() => {
    return [...promotions].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [promotions]);

  const uploadBannerImage = async (file: File, promotionTitle: string) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", promotionTitle);

    const res = await fetch("/api/upload/promotion-banner", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error ?? "Failed to upload banner image");
    }

    const data = await res.json();
    return data.imageUrl as string;
  };

  const submitCreate = async (values: PromotionFormValues) => {
    try {
      let imageUrl = "";
      if (values.imageFile) {
        imageUrl = await uploadBannerImage(values.imageFile, values.title);
      }

      const res = await fetch("/api/promotion-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description.trim(),
          buttonText: values.buttonText.trim() || undefined,
          buttonLink: values.buttonLink.trim() || undefined,
          imageUrl,
          startDate: values.startDate,
          endDate: values.endDate,
          isActive: values.isActive,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to create" }));
        throw new Error(error.error ?? "Failed to create promotion");
      }

      toast({ title: "Promotion created", description: `${values.title} is now live.` });
      setDialogMode(null);
      fetchPromotions();
    } catch (error: any) {
      toast({ title: "Create failed", description: error.message ?? "Unable to save promotion", variant: "destructive" });
      throw error;
    }
  };

  const submitUpdate = async (values: PromotionFormValues) => {
    if (!selectedPromotion) return;
    try {
      let imageUrl = selectedPromotion.imageUrl;
      if (values.imageFile) {
        imageUrl = await uploadBannerImage(values.imageFile, values.title);
      }

      const res = await fetch(`/api/promotion-banners/${selectedPromotion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description.trim(),
          buttonText: values.buttonText.trim() || undefined,
          buttonLink: values.buttonLink.trim() || undefined,
          imageUrl,
          startDate: values.startDate,
          endDate: values.endDate,
          isActive: values.isActive,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to update" }));
        throw new Error(error.error ?? "Failed to update promotion");
      }

      toast({ title: "Promotion updated", description: `${values.title} has been saved.` });
      setDialogMode(null);
      setSelectedPromotion(null);
      fetchPromotions();
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message ?? "Unable to save changes", variant: "destructive" });
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedPromotion) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/promotion-banners/${selectedPromotion.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to delete" }));
        throw new Error(error.error ?? "Failed to delete promotion");
      }

      toast({ title: "Promotion removed", description: `${selectedPromotion.title} has been deleted.` });
      setDeleteDialogOpen(false);
      setSelectedPromotion(null);
      fetchPromotions();
    } catch (error: any) {
      toast({ title: "Delete failed", description: error.message ?? "Unable to remove promotion", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (promotion: PromotionBanner, isActive: boolean) => {
    try {
      const res = await fetch(`/api/promotion-banners/${promotion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to update status" }));
        throw new Error(error.error ?? "Failed to update status");
      }

      toast({ title: "Status updated", description: `${promotion.title} is now ${isActive ? "active" : "inactive"}.` });
      fetchPromotions();
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message ?? "Unable to change status", variant: "destructive" });
    }
  };

  const activeCount = promotions.filter((promo) => promo.isActive).length;

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Promotion Banners
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage hero banners, schedule campaigns, and control what guests see on the homepage.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-purple-500/30 text-purple-300">
            Active banners: {activeCount}
          </Badge>
          <Dialog
            open={dialogMode === "create"}
            onOpenChange={(open) => setDialogMode(open ? "create" : null)}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Plus className="mr-2 h-4 w-4" /> New Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl bg-gradient-to-b from-gray-950 to-gray-900 border border-gray-800">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-white text-xl">
                  <Megaphone className="h-5 w-5 text-orange-300" /> Create Promotion
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Upload a 1248x500 banner (JPG) and schedule its visibility.
                </DialogDescription>
              </DialogHeader>
              <PromotionForm submitLabel="Create Promotion" onSubmit={submitCreate} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <div className="flex items-center gap-3 text-gray-300">
            <Megaphone className="h-5 w-5 text-orange-300" />
            <span className="font-semibold">Scheduled Promotions</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPromotions} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading promotions...
          </div>
        ) : promotions.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Megaphone className="mx-auto mb-4 h-10 w-10 text-orange-300 opacity-60" />
            No promotion banners created yet. Launch your first campaign!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">Banner</TableHead>
                <TableHead className="text-gray-300">Details</TableHead>
                <TableHead className="text-gray-300">Schedule</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-right text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPromotions.map((promotion) => {
                const isRunning =
                  promotion.isActive &&
                  new Date(promotion.startDate) <= new Date() &&
                  new Date(promotion.endDate) >= new Date();

                return (
                  <TableRow key={promotion.id} className="border-gray-900">
                    <TableCell className="w-[220px]">
                      <div className="relative h-24 w-full overflow-hidden rounded-lg border border-gray-800">
                        <NextImage
                          src={promotion.imageUrl || "/img/placeholder.jpg"}
                          alt={promotion.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="font-semibold text-gray-100">{promotion.title}</div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-400">{promotion.description}</p>
                      {promotion.buttonText && promotion.buttonLink && (
                        <p className="mt-2 text-xs text-gray-500">
                          {promotion.buttonText} → {promotion.buttonLink}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-sm text-gray-300">
                      <div>From: {new Date(promotion.startDate).toLocaleDateString()}</div>
                      <div>To: {new Date(promotion.endDate).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-col gap-2">
                        <Badge
                          variant={promotion.isActive ? "default" : "secondary"}
                          className={promotion.isActive ? "bg-green-500/20 text-green-300 border-green-500/40" : "bg-gray-700 text-gray-300"}
                        >
                          {promotion.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {isRunning ? (
                          <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30">Live now</Badge>
                        ) : null}
                        <Switch
                          checked={promotion.isActive}
                          onCheckedChange={(checked) => handleToggleActive(promotion, checked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-right">
                      <div className="ml-auto flex w-full justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedPromotion(promotion);
                            setDialogMode("edit");
                          }}
                          className="bg-transparent text-blue-300 hover:bg-blue-500/20"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPromotion(promotion);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={dialogMode === "edit" && !!selectedPromotion}
        onOpenChange={(open) => {
          if (!open) {
            setDialogMode(null);
            setSelectedPromotion(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl bg-gradient-to-b from-gray-950 to-gray-900 border border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white text-xl">
              <Megaphone className="h-5 w-5 text-orange-300" /> Edit Promotion
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update details or upload a new banner to replace the existing one.
            </DialogDescription>
          </DialogHeader>
          <PromotionForm
            initialPromotion={selectedPromotion ?? undefined}
            submitLabel="Save Changes"
            onSubmit={submitUpdate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-gray-950 to-gray-900 border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete promotion</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will permanently remove the selected banner. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
