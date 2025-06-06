"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Loader2 } from 'lucide-react';
import { generateSalesReport } from '@/app/actions/reports';

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const result = await generateSalesReport();
      if (result.success && result.csvData) {
        // Create a blob from the CSV data
        const blob = new Blob([result.csvData], { type: 'text/csv;charset=utf-8;' });
        
        // Create a link element
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', result.fileName || 'report.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        throw new Error(result.error || "Failed to generate report data.");
      }
    } catch (error) {
      console.error(error);
      // You can add a toast notification here for the error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight mb-4">Generate Reports</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Sales Report</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Download a detailed CSV file of all completed sales for a selected period.
            </CardDescription>
            <Button onClick={handleDownload} disabled={isLoading} className="mt-4 w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* You can add more report cards here in the future */}
        <Card className="border-dashed">
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Inventory Report</CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 <CardDescription>
                    (Coming Soon) A full report of current stock levels and supplier details.
                </CardDescription>
                 <Button disabled className="mt-4 w-full">
                    Download Report
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}