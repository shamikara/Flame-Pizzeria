'use client';

import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function CateringForm() {
    const { toast } = useToast();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MIN_GUESTS = 9;
    const MAX_GUESTS = 101;
    const MIN_LEAD_DAYS = 5;

    const minEventDate = useMemo(() => {
        const baseline = new Date();
        baseline.setHours(0, 0, 0, 0);
        baseline.setDate(baseline.getDate() + MIN_LEAD_DAYS);
        return baseline;
    }, []);

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
        specialRequests: ''
    });

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};
        if (!formData.contactName) newErrors.contactName = 'Name is required';
        if (!formData.contactEmail.includes('@')) newErrors.contactEmail = 'Valid email required';
        if (formData.guestCount < MIN_GUESTS || formData.guestCount > MAX_GUESTS) {
            newErrors.guestCount = `Guest count must be between ${MIN_GUESTS} and ${MAX_GUESTS}`;
        }
        if (!formData.venueAddress.trim()) newErrors.venueAddress = 'Venue address is required';
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
                        menuDetails: formData.menuDetails
                    },
                    specialRequests: formData.specialRequests
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
                resetForm();
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
            specialRequests: ''
        });
        setStep(1);
        setErrors({});
    };

    return (
        <div className="space-y-6">
            {step === 1 && (
                <div className="space-y-4">
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
                            <Calendar
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
                            <p className="text-xs text-gray-400 mt-1">
                                Events must be scheduled at least {MIN_LEAD_DAYS} days in advance.
                            </p>

                        </div>
                        <div >
                            <label className="block text-sm mb-1">Guest Count</label>
                            <Input
                                type="number"
                                min={MIN_GUESTS}
                                max={MAX_GUESTS}
                                value={formData.guestCount}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    setFormData({
                                        ...formData,
                                        guestCount: Number.isNaN(value) ? 0 : value,
                                    });
                                    setErrors({ ...errors, guestCount: '' });
                                }}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Guest count must be between {MIN_GUESTS} and {MAX_GUESTS}.
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
                        </div>
                    </div>

                    <div className="gap-4">
                        <div>
                            <label className="block text-sm mb-1 my-5">Venue Address (optional)</label>
                            <Textarea
                                placeholder="Where will the event be hosted?"
                                value={formData.venueAddress}
                                onChange={(e) => {
                                    setFormData({ ...formData, venueAddress: e.target.value });
                                    setErrors({ ...errors, venueAddress: '' });
                                }}
                            />
                            {errors.venueAddress && (
                                <p className="text-sm text-red-500">{errors.venueAddress}</p>
                            )}
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
                    onClick={() => (step < 2 ? setStep(step + 1) : handleSubmit())}
                    disabled={step === 2 && isSubmitting}
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