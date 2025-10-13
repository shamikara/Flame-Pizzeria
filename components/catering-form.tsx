'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendEmail } from '@/lib/email';

export function CateringForm() {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        eventType: '',
        eventDate: new Date(),
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
        if (formData.guestCount < 10) newErrors.guestCount = 'Minimum 10 guests';
        if (!formData.venueAddress.trim()) newErrors.venueAddress = 'Venue address is required';
        if (!formData.serviceStyle) newErrors.serviceStyle = 'Select a service style';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
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

            if (response.ok) {
                const result = await response.json();

                const emailResult = await sendEmail({
                    to: formData.contactEmail,
                    subject: 'Your Catering Request',
                    template: 'catering-confirmation',
                    data: {
                        name: formData.contactName,
                        requestId: result.id
                    }
                });

                if (!emailResult.success) {
                    console.warn('Email failed:', emailResult.error);
                }

                alert(`Request submitted! ID: ${result.id}`);
                resetForm();
            } else {
                throw new Error('Server responded with error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit request. Please try again.');
        }
    };

    const resetForm = () => {
        setFormData({
            eventType: '',
            eventDate: new Date(),
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
                                onSelect={(date) => date && setFormData({ ...formData, eventDate: date })}
                            />
                        </div>
                        <div >
                            <label className="block text-sm mb-1">Guest Count</label>
                            <Input
                                type="number"
                                min={10}
                                value={formData.guestCount}
                                onChange={(e) =>
                                    setFormData({ ...formData, guestCount: parseInt(e.target.value) || 0 })
                                }
                            />
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
                    <Button variant="outline" onClick={() => setStep(step - 1)}>
                        Back
                    </Button>
                )}
                <Button onClick={() => (step < 2 ? setStep(step + 1) : handleSubmit())}>
                    {step === 2 ? 'Submit Request' : 'Continue'}
                </Button>
            </div>
        </div>
    );
}