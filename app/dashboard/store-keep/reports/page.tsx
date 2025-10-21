"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Package, Loader2 } from "lucide-react";
import { generateInventoryReport } from "@/app/actions/reports";
import { generateInventoryReportPDF } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";

export default function StoreKeepReportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInventoryReport = async () => {
    setIsLoading(true);
    try {
      const result = await generateInventoryReport();

      if (result.success && result.data) {
        const pdf = generateInventoryReportPDF(result.data, result.summary!);
        pdf.save(result.fileName!);
        toast({
          title: "Inventory Report Generated",
          description: `${result.summary?.totalItems} items | ${result.summary?.lowStockCount} low stock`,
        });
      } else {
        throw new Error(result.error || "Failed to generate report");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-10">
      <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-400" />
            <CardTitle className="text-gray-200">Inventory Report</CardTitle>
          </div>
          <CardDescription className="text-gray-400">Quick access to inventory summary for store-keepers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-gray-700 bg-gray-800/50">
            <AlertDescription className="text-gray-300">
              Generates the same detailed inventory report available to admins/managers.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleInventoryReport}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate PDF Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
