"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LoginDialog } from "@/components/auth/login-dialog";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
}

const EventCateringPage = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Form state
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>(new Date());
  const [guestCount, setGuestCount] = useState(50);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Menu state
  const [selectedItems, setSelectedItems] = useState<Record<string, MenuItem>>({});

  // Calculate pricing
  const taxRate = 0.08;
  const serviceChargeRate = 0.18;
  const subtotal = Object.values(selectedItems).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const serviceCharge = subtotal * serviceChargeRate;
  const tax = subtotal * taxRate;
  const total = subtotal + serviceCharge + tax;
  const depositDue = total * 0.5;

  // Sample menu items
  const menuItems: MenuItem[] = [
    {
      id: "app1",
      name: "Bruschetta",
      description: "Toasted bread with tomatoes, garlic, and basil",
      price: 8.99,
      category: "appetizers",
      image: "/img/menu/bruschetta.jpg",
      quantity: 0
    },
    {
      id: "main1",
      name: "Grilled Salmon",
      description: "Fresh salmon with lemon butter sauce",
      price: 24.99,
      category: "mains",
      image: "/img/menu/salmon.jpg",
      quantity: 0
    },
    {
      id: "dessert1",
      name: "Tiramisu",
      description: "Classic Italian dessert with coffee and mascarpone",
      price: 7.99,
      category: "desserts",
      image: "/img/menu/tiramisu.jpg",
      quantity: 0
    }
  ];

  const handleItemQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 0) return;

    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (quantity === 0) {
        delete newItems[itemId];
      } else {
        newItems[itemId] = {
          ...menuItems.find(item => item.id === itemId)!,
          quantity
        };
      }
      return newItems;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    if (!eventType || !eventDate || !guestCount || !contactName || !contactEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert selected items to array format for the API
      const menuItems = Object.values(selectedItems).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const response = await fetch("/api/event-catering/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menuItems,
          guestCount,
          contactEmail,
          contactPhone,
          eventType,
          eventDate: eventDate.toISOString(),
          contactName,
          specialRequests,
          subtotal,
          serviceCharge,
          tax,
          total,
          depositDue
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // Redirect to checkout with the order ID
      router.push(`/event-catering/checkout/${data.orderId}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Event Catering</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Tell us about your event</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Select 
                      value={eventType} 
                      onValueChange={setEventType}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !eventDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventDate ? (
                            format(eventDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={eventDate}
                          onSelect={setEventDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestCount">Number of Guests *</Label>
                    <Input
                      id="guestCount"
                      type="number"
                      min="10"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any dietary restrictions, allergies, or special instructions..."
                  />
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Menu Selection</h3>
                  <div className="space-y-6">
                    {["appetizers", "mains", "desserts"].map((category) => {
                      const items = menuItems.filter(
                        (item) => item.category === category
                      );
                      if (items.length === 0) return null;

                      return (
                        <div key={category} className="space-y-2">
                          <h4 className="text-md font-medium capitalize">
                            {category}
                          </h4>
                          <div className="space-y-4">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.description}
                                  </p>
                                  <p className="text-sm font-medium mt-1">
                                    ${item.price.toFixed(2)} each
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleItemQuantityChange(
                                        item.id,
                                        (selectedItems[item.id]?.quantity || 0) - 1
                                      )
                                    }
                                    disabled={
                                      !selectedItems[item.id]?.quantity
                                    }
                                  >
                                    -
                                  </Button>
                                  <span className="w-8 text-center">
                                    {selectedItems[item.id]?.quantity || 0}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleItemQuantityChange(
                                        item.id,
                                        (selectedItems[item.id]?.quantity || 0) + 1
                                      )
                                    }
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || Object.keys(selectedItems).length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge (18%)</span>
                  <span>${serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  A 50% deposit of ${depositDue.toFixed(2)} will be required to confirm your booking.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Items</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.values(selectedItems).length === 0 ? (
                <p className="text-muted-foreground">No items selected yet</p>
              ) : (
                <div className="space-y-2">
                  {Object.values(selectedItems).map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onSuccess={() => setShowLoginDialog(false)}
      />
    </div>
  );
};

export default EventCateringPage;