'use client';

import { useMemo, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type CateringQuoteLine = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

interface CateringFormProps {
    onServicesUpdate?: (items: CateringQuoteLine[]) => void;
    onSubmitSuccess?: (payload: {
        id: number;
        status: string;
        totals: {
            subtotal: number | null;
            serviceCharge: number | null;
            tax: number | null;
            total: number | null;
        } | null;
        depositDue: number | null;
    }) => void;
    preventServicesUpdate?: boolean; // Add this new prop
}

const EVENT_TYPES = [
    { value: 'wedding', label: 'Wedding', decorFee: 45000 },
    { value: 'corporate', label: 'Corporate Event', decorFee: 32000 },
    { value: 'birthday', label: 'Birthday Party', decorFee: 18000 },
    { value: 'college', label: 'College Reunion', decorFee: 22000 },
    { value: 'family', label: 'Family Gathering', decorFee: 16000 },
    { value: 'other', label: 'Custom Event', decorFee: 12000 }
];

const SERVICE_STYLES = [
    { value: 'buffet', label: 'Buffet', perGuestFee: 150 },
    { value: 'plated', label: 'Plated Meal', perGuestFee: 220 },
    { value: 'family-style', label: 'Family Style', perGuestFee: 200 },
    { value: 'stations', label: 'Interactive Stations', perGuestFee: 180 }
];

const BUDGET_OPTIONS: Record<string, { label: string; perGuest: number }> = {
    'under-1500': { label: 'Under LKR 1,500', perGuest: 1200 },
    '1500-3000': { label: 'LKR 1,500 - 3,000', perGuest: 2200 },
    '3000-5000': { label: 'LKR 3,000 - 5,000', perGuest: 3800 },
    'over-5000': { label: 'Over LKR 5,000', perGuest: 5600 }
};

const FOOD_CATEGORY_OPTIONS = [
    { value: 'pizza', label: 'Signature Wood-fired Pizza', perGuest: 550 },
    { value: 'snacks', label: 'Gourmet Snacks & Bites', perGuest: 320 },
    { value: 'mains', label: 'Hot Entrées & Sides', perGuest: 480 },
    { value: 'desserts', label: 'Desserts & Sweet Table', perGuest: 300 },
    { value: 'beverages', label: 'Beverage Bar', perGuest: 260 }
];

const currencyFormatter = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
});

const TAX_RATE = 0.08;
const SERVICE_CHARGE_RATE = 0.1;

export function CateringForm({ onServicesUpdate, onSubmitSuccess, preventServicesUpdate }: CateringFormProps) {
    const { toast } = useToast();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGuestCountValid, setIsGuestCountValid] = useState(true);
    const [guestCountInput, setGuestCountInput] = useState('50');

    const MIN_GUESTS = 25;
    const MAX_GUESTS = 150;
    const MIN_LEAD_DAYS = 6;

    const minEventDate = useMemo(() => {
        const baseline = new Date();
        baseline.setHours(0, 0, 0, 0);
        baseline.setDate(baseline.getDate() + MIN_LEAD_DAYS);
        return baseline;
    }, [MIN_LEAD_DAYS]);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        eventType: '',
        eventDate: minEventDate,
        guestCount: 50,

        contactName: '',
        contactEmail: '',
        venueAddress: '',
        serviceStyle: '',
        budgetRange: '',
        preferredCuisine: '',
        menuDetails: '',
        specialRequests: '',
        foodCategories: [] as string[]
    });

    const guestCount = formData.guestCount > 0 ? formData.guestCount : 0;

    const selectedEvent = useMemo(
        () => EVENT_TYPES.find((option) => option.value === formData.eventType),
        [formData.eventType]
    );

    const selectedBudget = useMemo(
        () => (formData.budgetRange ? BUDGET_OPTIONS[formData.budgetRange] : undefined),
        [formData.budgetRange]
    );

    const selectedServiceStyle = useMemo(
        () => SERVICE_STYLES.find((style) => style.value === formData.serviceStyle),
        [formData.serviceStyle]
    );

    const selectedFoodCategories = useMemo(
        () => FOOD_CATEGORY_OPTIONS.filter((option) => formData.foodCategories.includes(option.value)),
        [formData.foodCategories]
    );

    const billLines = useMemo<CateringQuoteLine[]>(() => {
        const lines: CateringQuoteLine[] = [];

        if (selectedEvent) {
            lines.push({
                id: 'decor-fee',
                name: `${selectedEvent.label} décor & coordination`,
                price: selectedEvent.decorFee,
                quantity: 1
            });
        }

        if (selectedBudget && guestCount) {
            lines.push({
                id: 'menu-budget',
                name: `Menu budget (${selectedBudget.label})`,
                price: selectedBudget.perGuest,
                quantity: guestCount
            });
        }

        if (selectedServiceStyle && guestCount) {
            lines.push({
                id: 'service-style',
                name: `${selectedServiceStyle.label} service team`,
                price: selectedServiceStyle.perGuestFee,
                quantity: guestCount
            });
        }

        if (selectedFoodCategories.length && guestCount) {
            selectedFoodCategories.forEach((category) => {
                lines.push({
                    id: `category-${category.value}`,
                    name: category.label,
                    price: category.perGuest,
                    quantity: guestCount
                });
            });
        }

        return lines;
    }, [guestCount, selectedBudget, selectedEvent, selectedFoodCategories, selectedServiceStyle]);

    useEffect(() => {
        if (!onServicesUpdate || preventServicesUpdate) {
            return;
        }
        onServicesUpdate(billLines);
    }, [billLines, onServicesUpdate, preventServicesUpdate]);

    const handleCategoryToggle = (value: string, isChecked: boolean) => {
        setFormData((prev) => {
            const nextCategories = isChecked
                ? Array.from(new Set([...prev.foodCategories, value]))
                : prev.foodCategories.filter((item) => item !== value);
            return { ...prev, foodCategories: nextCategories };
        });
    };

    const formatCurrency = (value: number) => currencyFormatter.format(value);

    const estimatedSubtotal = useMemo(
        () => billLines.reduce((sum, line) => sum + line.price * line.quantity, 0),
        [billLines]
    );
    const estimatedServiceCharge = estimatedSubtotal * SERVICE_CHARGE_RATE;
    const estimatedTax = estimatedSubtotal * TAX_RATE;
    const estimatedTotal = estimatedSubtotal + estimatedServiceCharge + estimatedTax;

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};
        if (!formData.contactName) newErrors.contactName = 'Name is required';
        if (!formData.contactEmail.includes('@')) newErrors.contactEmail = 'Valid email required';
        if (formData.guestCount < MIN_GUESTS || formData.guestCount > MAX_GUESTS) {
            newErrors.guestCount = `Guest count must be between ${MIN_GUESTS} and ${MAX_GUESTS}`;
        }
        if (!formData.serviceStyle) newErrors.serviceStyle = 'Select a service style';

        const selectedEventDate = new Date(formData.eventDate);
        selectedEventDate.setHours(0, 0, 0, 0);
        if (selectedEventDate < minEventDate) {
            newErrors.eventDate = `Event date must be at least ${MIN_LEAD_DAYS} days from today`;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const showToast = (payload?: { title?: string; message?: string; variant?: string }) => {
            if (!payload) return;
            toast({
                title: payload.title,
                description: payload.message,
                variant: payload.variant === 'error' ? 'destructive' : 'default'
            });
        };

        const billSnapshotPayload = billLines.length
            ? {
                currency: 'LKR',
                subtotal: estimatedSubtotal,
                serviceCharge: estimatedServiceCharge,
                tax: estimatedTax,
                total: estimatedTotal,
                lines: billLines.map((line) => ({
                    id: line.id,
                    name: line.name,
                    price: line.price,
                    quantity: line.quantity,
                    lineTotal: line.price * line.quantity
                }))
            }
            : null;

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/catering', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: formData.eventType,
                    eventDate: formData.eventDate.toISOString(),
                    guestCount: formData.guestCount,
                    contactName: formData.contactName,
                    contactEmail: formData.contactEmail,
                    menuItems: {
                        venueAddress: formData.venueAddress,
                        serviceStyle: formData.serviceStyle,
                        budgetRange: formData.budgetRange,
                        preferredCuisine: formData.preferredCuisine,
                        menuDetails: formData.menuDetails,
                        foodCategories: formData.foodCategories
                    },
                    specialRequests: formData.specialRequests,
                    billSnapshot: billSnapshotPayload
                })
            });

            const result = await response.json();

            if (response.ok) {
                showToast(
                    result.toast ?? {
                        title: 'Request submitted',
                        message: `We have received your catering request (#${result.id}).`
                    }
                );

                if (onSubmitSuccess) {
                    onSubmitSuccess({
                        id: result.id,
                        status: result.status ?? 'PENDING',
                        totals: result.totals ?? null,
                        depositDue: result.depositDue ?? null,
                    });
                } else {
                    resetForm();
                }
                return;
            }

            showToast(
                result.toast ?? {
                    title: 'Submission failed',
                    message: result.error || 'Please try again or contact support.',
                    variant: 'error'
                }
            );
        } catch (error) {
            console.error('Submission error:', error);
            toast({
                title: 'Submission failed',
                description: 'Please try again later.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const parsedGuestCount = parseInt(guestCountInput, 10);
    const hasNumericGuestCount = !Number.isNaN(parsedGuestCount);
    const isGuestCountOutOfRange =
        !hasNumericGuestCount || parsedGuestCount < MIN_GUESTS || parsedGuestCount > MAX_GUESTS;

    const resetForm = () => {
        setFormData({
            eventType: '',
            eventDate: minEventDate,

            guestCount: 50,
            contactName: '',
            contactEmail: '',
            venueAddress: '',
            serviceStyle: '',
            budgetRange: '',
            preferredCuisine: '',
            menuDetails: '',
            specialRequests: '',
            foodCategories: []
        });
        setStep(1);
        setErrors({});
        onServicesUpdate?.([]);
        setGuestCountInput('50');
        setIsGuestCountValid(true);
    };

    return (
        <div className="space-y-6">
            {step === 1 && (
                <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/60 p-8">
                    <h3 className="text-xl font-semibold">Event Details</h3>
                    <Select
                        value={formData.eventType}
                        onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Event Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="wedding">Wedding</SelectItem>
                            <SelectItem value="corporate">Corporate Event</SelectItem>
                            <SelectItem value="birthday">Birthday Party</SelectItem>
                            <SelectItem value="college">College Reunion</SelectItem>
                            <SelectItem value="family">Family Gathering</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Event Date</label>
                            <div className=" pt-16 w-full h-full">
                            <Calendar
                                className="justify-center mx-auto"
                                mode="single"
                                selected={formData.eventDate}
                                onSelect={(date) => {
                                    if (!date) return;
                                    setFormData({ ...formData, eventDate: date });
                                    setErrors({ ...errors, eventDate: '' });
                                }}
                                fromDate={minEventDate}
                                disabled={{ before: minEventDate }}
                            />
                            {errors.eventDate && (
                                <p className="text-sm text-red-500">{errors.eventDate}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2 ml-12">
                                * Events must be scheduled at least {MIN_LEAD_DAYS} days in advance.
                            </p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Guest Count</label>
                            <Input
                                type="number"
                                min={MIN_GUESTS}
                                max={MAX_GUESTS}
                                value={guestCountInput}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    setGuestCountInput(raw);

                                    const value = parseInt(raw, 10);

                                    if (Number.isNaN(value)) {
                                        setErrors({
                                            ...errors,
                                            guestCount: `Guest count must be between ${MIN_GUESTS} and ${MAX_GUESTS} guests.`,
                                        });
                                        setIsGuestCountValid(false);
                                        return;
                                    }

                                    if (value < MIN_GUESTS) {
                                        setErrors({
                                            ...errors,
                                            guestCount: `Minimum guest count is ${MIN_GUESTS}.`,
                                        });
                                        setIsGuestCountValid(false);
                                    } else if (value > MAX_GUESTS) {
                                        setErrors({
                                            ...errors,
                                            guestCount: `Maximum guest count is ${MAX_GUESTS}.`,
                                        });
                                        setIsGuestCountValid(false);
                                    } else {
                                        setErrors({ ...errors, guestCount: '' });
                                        setIsGuestCountValid(true);
                                    }

                                    setFormData({ ...formData, guestCount: value });
                                }}
                                onBlur={() => {
                                    if (!hasNumericGuestCount) {
                                        setGuestCountInput(String(MIN_GUESTS));
                                        setFormData({ ...formData, guestCount: MIN_GUESTS });
                                        setErrors({
                                            ...errors,
                                            guestCount: `Guest count must be between ${MIN_GUESTS} and ${MAX_GUESTS} guests.`,
                                        });
                                        setIsGuestCountValid(false);
                                        return;
                                    }

                                    if (parsedGuestCount < MIN_GUESTS) {
                                        setGuestCountInput(String(MIN_GUESTS));
                                        setFormData({ ...formData, guestCount: MIN_GUESTS });
                                        setErrors({
                                            ...errors,
                                            guestCount: `Minimum guest count is ${MIN_GUESTS}.`,
                                        });
                                        setIsGuestCountValid(false);
                                        return;
                                    }

                                    if (parsedGuestCount > MAX_GUESTS) {
                                        setGuestCountInput(String(MAX_GUESTS));
                                        setFormData({ ...formData, guestCount: MAX_GUESTS });
                                        setErrors({
                                            ...errors,
                                            guestCount: `Maximum guest count is ${MAX_GUESTS}.`,
                                        });
                                        setIsGuestCountValid(false);
                                        return;
                                    }

                                    setErrors({ ...errors, guestCount: '' });
                                    setIsGuestCountValid(true);
                                    setFormData({ ...formData, guestCount: parsedGuestCount });
                                }}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Guest count must be between {MIN_GUESTS} and {MAX_GUESTS} guests.
                            </p>

                            {errors.guestCount && (
                                <p className="text-sm text-red-500">{errors.guestCount}</p>
                            )}

                            <div>
                                <label className="block text-sm mb-1 mt-5">Preferred Cuisine or Focus</label>
                                <Input
                                    placeholder="E.g. Italian-inspired, vegetarian-friendly"
                                    value={formData.preferredCuisine}
                                    onChange={(e) =>
                                        setFormData({ ...formData, preferredCuisine: e.target.value })
                                    }
                                />
                            </div>


                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm mb-1 mt-5">Service Style</label>
                                    <Select
                                        value={formData.serviceStyle}
                                        onValueChange={(value) => {
                                            setFormData({ ...formData, serviceStyle: value });
                                            setErrors({ ...errors, serviceStyle: '' });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose service style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="buffet">Buffet</SelectItem>
                                        <SelectItem value="plated">Plated Meal</SelectItem>
                                        <SelectItem value="family-style">Family Style</SelectItem>
                                        <SelectItem value="stations">Food Stations</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.serviceStyle && (
                                    <p className="text-sm text-red-500">{errors.serviceStyle}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm mb-1 mt-5">Budget Range (per guest)</label>
                                <Select
                                    value={formData.budgetRange}
                                        onValueChange={(value) => setFormData({ ...formData, budgetRange: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select budget" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="under-1500">Under LKR 1,500</SelectItem>
                                            <SelectItem value="1500-3000">LKR 1,500 - 3,000</SelectItem>
                                            <SelectItem value="3000-5000">LKR 3,000 - 5,000</SelectItem>
                                            <SelectItem value="over-5000">Over LKR 5,000</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <label className="text-sm font-semibold">Food categories to feature</label>
                                <p className="text-xs text-muted-foreground">
                                    Choose the menu sections you want highlighted in the sample bill. Pricing is calculated per guest.
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {FOOD_CATEGORY_OPTIONS.map((category) => {
                                        const checked = formData.foodCategories.includes(category.value);
                                        return (
                                            <label
                                                key={category.value}
                                                className={`flex items-start gap-3 rounded-lg border px-3 py-3 text-sm transition hover:border-primary/60 hover:bg-primary/5 ${checked ? 'border-primary bg-primary/10' : 'border-border'}`}
                                            >
                                                <Checkbox
                                                    id={`category-${category.value}`}
                                                    checked={checked}
                                                    onCheckedChange={(next) => handleCategoryToggle(category.value, Boolean(next))}
                                                />
                                                <div>
                                                    <p className="font-medium leading-tight">{category.label}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        +{formatCurrency(category.perGuest)} per guest
                                                    </p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="gap-4">
                        <div>
                            <label className="block text-sm mb-1 mb-5 mt-8">Venue Address (optional)</label>
                            <Textarea
                                placeholder="Where will the event be hosted?"
                                value={formData.venueAddress}
                                onChange={(e) => {
                                    setFormData({ ...formData, venueAddress: e.target.value });
                                    setErrors({ ...errors, venueAddress: '' });
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1 my-5">Menu Details</label>
                            <Textarea
                                placeholder="List items, dietary needs, kid-friendly options, etc."
                                value={formData.menuDetails}
                                onChange={(e) =>
                                    setFormData({ ...formData, menuDetails: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Contact Info</h3>
                    <div className="space-y-1">
                        <Input
                            placeholder="Your Name"
                            value={formData.contactName}
                            className={errors.contactName ? "border-red-500" : ""}
                            onChange={(e) => {
                                setFormData({ ...formData, contactName: e.target.value });
                                setErrors({ ...errors, contactName: '' });
                            }}
                        />
                        {errors.contactName && (
                            <p className="text-sm text-red-500">{errors.contactName}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Input
                            placeholder="Email"
                            type="email"
                            value={formData.contactEmail}
                            className={errors.contactEmail ? "border-red-500" : ""}
                            onChange={(e) => {
                                setFormData({ ...formData, contactEmail: e.target.value });
                                setErrors({ ...errors, contactEmail: '' });
                            }}
                        />
                        {errors.contactEmail && (
                            <p className="text-sm text-red-500">{errors.contactEmail}</p>
                        )}
                    </div>
                    <Textarea
                        placeholder="Special Requests"
                        value={formData.specialRequests}
                        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    />
                </div>
            )}

            {billLines.length > 0 && (
                <div className="space-y-4 rounded-xl border border-primary/40 bg-primary/10/40 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-lg font-semibold">Example Bill Snapshot</h4>
                            <p className="text-xs text-muted-foreground">Auto-generated based on your current selections</p>
                        </div>
                        <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                            Preview
                        </span>
                    </div>
                    <Separator />
                    <div className="space-y-3 text-sm">
                        {billLines.map((line) => (
                            <div key={line.id} className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-medium leading-tight">{line.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(line.price)} × {line.quantity.toLocaleString('en-US')} {line.quantity === 1 ? 'unit' : 'guests'}
                                    </p>
                                </div>
                                <span className="font-semibold">{formatCurrency(line.price * line.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(estimatedSubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Service charge ({(SERVICE_CHARGE_RATE * 100).toFixed(0)}%)</span>
                            <span>{formatCurrency(estimatedServiceCharge)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Estimated tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                            <span>{formatCurrency(estimatedTax)}</span>
                        </div>
                        <div className="flex justify-between pt-2 text-base font-semibold">
                            <span>Estimated total</span>
                            <span>{formatCurrency(estimatedTotal)}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between">
                {step > 1 && (
                    <Button
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        disabled={isSubmitting}
                    >
                        Back
                    </Button>
                )}
                <Button
                    onClick={() => {
                        if (step === 1) {
                            if (!isGuestCountValid || isGuestCountOutOfRange) {
                                setErrors((prev) => ({
                                    ...prev,
                                    guestCount:
                                        prev.guestCount || `Guest count must be between ${MIN_GUESTS} and ${MAX_GUESTS} guests.`,
                                }));
                                return;
                            }
                            setStep(step + 1);
                            return;
                        }

                        handleSubmit();
                    }}
                    disabled={
                        (step === 1 && (!isGuestCountValid || isGuestCountOutOfRange)) ||
                        (step === 2 && isSubmitting)
                    }
                >
                    {step === 2 && isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : step === 2 ? (
                        'Submit Request'
                    ) : (
                        'Continue'
                    )}
                </Button>
            </div>
        </div>
    );
}