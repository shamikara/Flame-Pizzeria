import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";

export default async function CateringConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const requestId = parseInt(params.id);
  
  if (isNaN(requestId)) {
    return notFound();
  }

  const cateringRequest = await prisma.cateringrequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      eventDate: true,
      guestCount: true,
      menuItems: true,
      specialRequests: true,
      status: true,
      totalAmount: true,
      depositAmount: true,
      updatedAt: true,
    },
  });

  if (!cateringRequest) {
    return notFound();
  }

  // Parse menu items if they exist
  const menuItems = cateringRequest.menuItems as any;
  const billSnapshot = menuItems?.billSnapshot || menuItems?.totals || {};

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Thank You for Your Deposit!</h1>
        <p className="text-lg text-gray-600 mb-8">
          We've received your deposit for your catering request. Our team will review your 
          request and contact you within 24-48 hours to confirm the details of your event.
        </p>

        <Card className="mb-8 text-left">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Request ID</span>
                <span className="font-medium">#{cateringRequest.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Event Date</span>
                <span className="font-medium">
                  {format(new Date(cateringRequest.eventDate), 'MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guest Count</span>
                <span className="font-medium">{cateringRequest.guestCount}</span>
              </div>
              
              <div className="border-t border-gray-200 my-4"></div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit Paid</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-LK', {
                    style: 'currency',
                    currency: 'LKR',
                    maximumFractionDigits: 0,
                  }).format(cateringRequest.depositAmount || 0)}
                </span>
              </div>
              
              <div className="text-sm text-gray-500 text-right">
                {cateringRequest.status === 'COMPLETED' ? 
                  `Paid on ${format(new Date(cateringRequest.updatedAt), 'MMMM d, yyyy')}` :
                  'Payment processing...'}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between font-semibold">
                  <span>Remaining Balance</span>
                  <span>
                    {new Intl.NumberFormat('en-LK', {
                      style: 'currency',
                      currency: 'LKR',
                      maximumFractionDigits: 0,
                    }).format((cateringRequest.totalAmount || 0) - (cateringRequest.depositAmount || 0))}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  The remaining balance will be due 7 days before your event.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">What's Next?</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
                <span className="font-bold">1</span>
              </div>
              <h3 className="font-medium mb-1">Request Review</h3>
              <p className="text-sm text-gray-600">
                Our team will review your request and confirm all details within 24-48 hours.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
                <span className="font-bold">2</span>
              </div>
              <h3 className="font-medium mb-1">Final Confirmation</h3>
              <p className="text-sm text-gray-600">
                We'll send you a final confirmation with all the details of your event.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
                <span className="font-bold">3</span>
              </div>
              <h3 className="font-medium mb-1">Event Day</h3>
              <p className="text-sm text-gray-600">
                Our team will arrive at the scheduled time to set up and serve your event.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <p className="text-gray-600">
            Need to make changes to your request? Contact our catering team at:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <a href="tel:+94123456789">Call Us: +94 123 456 789</a>
            </Button>
            <Button asChild variant="outline">
              <a href="mailto:catering@flamespizzeria.com">Email Us</a>
            </Button>
          </div>
          
          <div className="pt-6">
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
