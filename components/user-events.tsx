"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Utensils, Users, Clock, Calendar as CalendarIcon, DollarSign, Phone, Mail } from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

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

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const eventDate = new Date(event.eventDate);
        const isPastEvent = eventDate < new Date();
        
        return (
          <Card key={event.id} className="border-gray-800 bg-gray-900/50 overflow-hidden">
            <div className={`h-1 w-full ${
              isPastEvent ? 'bg-gray-600' : 'bg-blue-500'
            }`} />
            <CardHeader className="pb-2">
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
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Users className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">{event.guestCount} Guests</p>
                      <p className="text-xs text-gray-500">Estimated Total: {formatCurrency(event.totalAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <DollarSign className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">
                        Deposit: {formatCurrency(event.depositAmount)} 
                        <span className={`ml-2 text-xs ${event.depositPaid ? 'text-green-400' : 'text-amber-400'}`}>
                          ({event.depositPaid ? 'Paid' : 'Pending'})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">{event.contactName}</p>
                      <a 
                        href={`mailto:${event.contactEmail}`} 
                        className="text-blue-400 hover:underline text-xs break-all"
                      >
                        {event.contactEmail}
                      </a>
                    </div>
                  </div>
                  {event.contactPhone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <a 
                        href={`tel:${event.contactPhone}`} 
                        className="text-blue-400 hover:underline text-sm"
                      >
                        {event.contactPhone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1.5 flex-shrink-0" />
                    <span>Created {format(new Date(event.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2 pt-3 border-t border-gray-800 bg-gray-900/30 px-6 py-3">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/event-catering/${event.id}`}>
                  View Details
                </Link>
              </Button>
              {!event.depositPaid && event.status.toLowerCase() !== 'cancelled' && (
                <Button size="sm" asChild>
                  <Link href={`/event-catering/payment/${event.id}`}>
                    Pay Deposit
                  </Link>
                </Button>
              )}
              {isPastEvent && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/event-catering/feedback/${event.id}`}>
                    Leave Feedback
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
