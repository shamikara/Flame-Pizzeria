"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Utensils, Users, Clock, Calendar as CalendarIcon, DollarSign, Phone, Mail } from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter } from "next/navigation";

type EventCatering = {
  id: number;
  eventType: string;
  eventDate: string;
  guestCount: number;
  status: string;
  totalAmount: number | null;
  depositAmount: number | null;
  paymentStatus: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  createdAt: string;
  updatedAt: string;
  depositPaid: boolean;
};

export function UserEvents() {
  const [events, setEvents] = useState<EventCatering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/catering/my-events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading your events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-200">No events yet</h3>
        <p className="mt-1 text-sm text-gray-400">Your upcoming events will appear here.</p>
        <Button className="mt-4" onClick={() => window.location.href = '/event-catering'}>
          Book an Event
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-900/50 text-green-400';
      case 'pending':
      case 'processing':
        return 'bg-yellow-900/50 text-yellow-400';
      case 'cancelled':
      case 'declined':
        return 'bg-red-900/50 text-red-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Removed handlePaymentClick as we're now using direct Link navigation

  const handleNavigation = (url: string, eventId: number) => {
    setIsNavigating(eventId);
    router.push(url);
  };

  const handleFeedbackClick = (eventId: number) => {
    // TODO: Implement feedback flow
    alert('Feedback functionality will be implemented soon!');
    // Uncomment and implement when feedback page is ready:
    // handleNavigation(`/event-catering/feedback/${eventId}`, eventId);
  };

  return (
    <div className="space-y-6">
      {events.map((event) => {
        const eventDate = new Date(event.eventDate);
        const isPastEvent = eventDate < new Date();
        const statusColor = {
          'pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
          'confirmed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          'completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        }[event.status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        
        return (
          <Card key={event.id} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-gray-800/20">
            <div className={`h-1.5 w-full ${
              isPastEvent ? 'bg-gray-400 dark:bg-gray-700' : 'bg-blue-500 dark:bg-blue-600'
            }`} />
            <CardHeader className="pb-3 px-6 pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {event.eventType}
                    <span className="text-sm font-normal text-gray-400">
                      #{event.id.toString().padStart(4, '0')}
                    </span>
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-400 mt-1">
                    <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span>
                      {format(eventDate, 'EEEE, MMMM d, yyyy')}
                      {!isPastEvent && (
                        <span className="ml-2 text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                          {formatDistanceToNow(eventDate, { addSuffix: true })}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(' ')}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 px-6 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Users className="h-5 w-5 mr-3 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{event.guestCount} Guests</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Estimated Total: <span className="font-medium">{formatCurrency(event.totalAmount)}</span></p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 mr-3 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 dark:text-gray-100">
                        Deposit: <span className="font-medium">{formatCurrency(event.depositAmount)}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          event.depositPaid 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          {event.depositPaid ? 'Paid' : 'Pending'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-3 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{event.contactName}</p>
                      <a 
                        href={`mailto:${event.contactEmail}`} 
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm break-all transition-colors"
                      >
                        {event.contactEmail}
                      </a>
                    </div>
                  </div>
                  {event.contactPhone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <a 
                        href={`tel:${event.contactPhone}`} 
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                      >
                        {event.contactPhone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span>Created {format(new Date(event.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
              <Button 
                variant="outline" 
                size="sm"
                disabled={isNavigating === event.id}
                className="px-4 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[100px] h-9 flex items-center justify-center"
                onClick={() => handleNavigation(`/event-catering/confirmation/${event.id}`, event.id)}
              >
                {isNavigating === event.id ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : 'View Details'}
              </Button>
              {!event.depositPaid && event.status.toLowerCase() !== 'cancelled' && (
                <Button 
                  size="sm" 
                  className="px-4 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white min-w-[120px] h-9 flex items-center justify-center"
                  disabled={isNavigating === event.id}
                  onClick={() => handleNavigation(`/event-catering/checkout/${event.id}`, event.id)}
                >
                  {isNavigating === event.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Pay Deposit'}
                </Button>
              )}
              {isPastEvent && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[120px] h-9 flex items-center justify-center"
                  disabled={isNavigating === event.id}
                  onClick={() => handleFeedbackClick(event.id)}
                >
                  {isNavigating === event.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : 'Leave Feedback'}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
