"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  FileText, 
  Loader2, 
  TrendingUp, 
  Package, 
  Users, 
  FileSpreadsheet,
  Brain,
  DollarSign,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  generateSalesReport, 
  generateInventoryReport, 
  generateSalaryReport,
  generateSummaryReport,
  generateBudgetForecast,
  generateInventoryForecast,
  generateSalesPrediction,
} from '@/app/actions/reports';
import { 
  generateSalesReportPDF,
  generateInventoryReportPDF,
  generateSalaryReportPDF,
  generateSummaryReportPDF,
  generateBudgetForecastPDF,
  generateInventoryForecastPDF,
  generateSalesPredictionPDF 
} from '@/lib/pdf-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [salesDateRange, setSalesDateRange] = useState({ start: '', end: '' });
  const [salaryMonth, setSalaryMonth] = useState('');
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear().toString());
  const [summaryDateRange, setSummaryDateRange] = useState({ start: '', end: '' });
  const { toast } = useToast();

  const downloadPDF = (doc: any, fileName: string) => {
    doc.save(fileName);
  };

  const handleSalesReport = async () => {
    setIsLoading('sales');
    try {
      const result = await generateSalesReport(
        salesDateRange.start || undefined,
        salesDateRange.end || undefined
      );
      
      if (result.success && result.data) {
        const pdf = generateSalesReportPDF(result.data, result.summary!, result.summary!.dateRange);
        downloadPDF(pdf, result.fileName!);
        toast({
          title: "Sales Report Generated",
          description: `${result.summary?.totalOrders} orders | Rs. ${result.summary?.totalRevenue.toFixed(2)} revenue`,
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
      setIsLoading(null);
    }
  };

  const handleInventoryReport = async () => {
    setIsLoading('inventory');
    try {
      const result = await generateInventoryReport();
      
      if (result.success && result.data) {
        const pdf = generateInventoryReportPDF(result.data, result.summary!);
        downloadPDF(pdf, result.fileName!);
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
      setIsLoading(null);
    }
  };

  const handleSalaryReport = async () => {
    if (!salaryMonth || !salaryYear) {
      toast({
        title: "Missing Information",
        description: "Please select both month and year",
        variant: "destructive",
      });
      return;
    }

    setIsLoading('salary');
    try {
      const result = await generateSalaryReport(salaryMonth, salaryYear);
      
      if (result.success && result.data) {
        const pdf = generateSalaryReportPDF(result.data, result.summary!, salaryMonth, salaryYear);
        downloadPDF(pdf, result.fileName!);
        toast({
          title: "Salary Report Generated",
          description: `${result.summary?.totalEmployees} employees | Rs. ${result.summary?.totalPayroll.toFixed(2)} total`,
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
      setIsLoading(null);
    }
  };

  const handleSummaryReport = async () => {
    setIsLoading('summary');
    try {
      const result = await generateSummaryReport(
        summaryDateRange.start || undefined,
        summaryDateRange.end || undefined
      );
      
      if (result.success && result.data) {
        const pdf = generateSummaryReportPDF(result.data, result.dateRange!);
        downloadPDF(pdf, result.fileName!);
        toast({
          title: "Summary Report Generated",
          description: `Rs. ${result.data.totalRevenue.toFixed(2)} revenue | ${result.data.totalOrders} orders`,
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
      setIsLoading(null);
    }
  };

  const handleBudgetForecast = async () => {
    setIsLoading('budget');
    try {
      const result = await generateBudgetForecast();
      
      if (result.success && result.rawData) {
        const pdf = generateBudgetForecastPDF(result);
        downloadPDF(pdf, `budget-forecast-${new Date().toISOString().split('T')[0]}.pdf`);
        toast({
          title: "Budget Forecast Generated",
          description: `Predicted: Rs. ${result.rawData.predictedRevenue.toFixed(2)}`,
        });
      } else {
        throw new Error(result.error || "Failed to generate forecast");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleInventoryForecast = async () => {
    setIsLoading('inventory-forecast');
    try {
      const result = await generateInventoryForecast();
      
      if (result.success && result.rawData) {
        const pdf = generateInventoryForecastPDF(result);
        downloadPDF(pdf, `inventory-forecast-${new Date().toISOString().split('T')[0]}.pdf`);
        toast({
          title: "Inventory Forecast Generated",
          description: `${result.summary?.needsRestockCount} items need restocking`,
        });
      } else {
        throw new Error(result.error || "Failed to generate forecast");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleSalesPrediction = async () => {
    setIsLoading('sales-prediction');
    try {
      const result = await generateSalesPrediction();
      
      if (result.success && result.rawData) {
        const pdf = generateSalesPredictionPDF(result);
        downloadPDF(pdf, `sales-prediction-${new Date().toISOString().split('T')[0]}.pdf`);
        toast({
          title: "Sales Prediction Generated",
          description: `Predicted: Rs. ${result.summary?.predictedRevenue.toFixed(2)}`,
        });
      } else {
        throw new Error(result.error || "Failed to generate prediction");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Reports & Analytics
        </h2>
        <p className="text-gray-400 mt-2">Generate comprehensive business reports and forecasts</p>
      </div>

      <Tabs defaultValue="standard" className="space-y-6">
        <TabsList className="bg-gray-800/50 border border-gray-700">
          <TabsTrigger value="standard" className="data-[state=active]:bg-gray-700">
            <FileText className="h-4 w-4 mr-2" />
            Standard Reports
          </TabsTrigger>
          <TabsTrigger value="forecasts" className="data-[state=active]:bg-gray-700">
            <Brain className="h-4 w-4 mr-2" />
            AI Forecasts
          </TabsTrigger>
        </TabsList>

        {/* Standard Reports Tab */}
        <TabsContent value="standard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sales Report Card */}
            <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-gray-200">Sales Report</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Generate detailed sales analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sales-start" className="text-gray-300">Start Date</Label>
                    <Input
                      id="sales-start"
                      type="date"
                      value={salesDateRange.start}
                      onChange={(e) => setSalesDateRange({ ...salesDateRange, start: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sales-end" className="text-gray-300">End Date</Label>
                    <Input
                      id="sales-end"
                      type="date"
                      value={salesDateRange.end}
                      onChange={(e) => setSalesDateRange({ ...salesDateRange, end: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSalesReport}
                  disabled={isLoading === 'sales'}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isLoading === 'sales' ? (
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

            {/* Inventory Report Card */}
            <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-400" />
                  <CardTitle className="text-gray-200">Inventory Report</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Current stock levels and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 border-gray-700 bg-gray-800/50">
                  <AlertDescription className="text-gray-300">
                    Generates a snapshot of current inventory status
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleInventoryReport}
                  disabled={isLoading === 'inventory'}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {isLoading === 'inventory' ? (
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

            {/* Salary Report Card */}
            <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-gray-200">Salary Report</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Employee payroll summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary-month" className="text-gray-300">Month</Label>
                    <Input
                      id="salary-month"
                      type="text"
                      placeholder="January"
                      value={salaryMonth}
                      onChange={(e) => setSalaryMonth(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary-year" className="text-gray-300">Year</Label>
                    <Input
                      id="salary-year"
                      type="number"
                      value={salaryYear}
                      onChange={(e) => setSalaryYear(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSalaryReport}
                  disabled={isLoading === 'salary'}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isLoading === 'salary' ? (
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

            {/* Summary Report Card */}
            <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-orange-400" />
                  <CardTitle className="text-gray-200">Business Summary</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Comprehensive business overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="summary-start" className="text-gray-300">Start Date</Label>
                    <Input
                      id="summary-start"
                      type="date"
                      value={summaryDateRange.start}
                      onChange={(e) => setSummaryDateRange({ ...summaryDateRange, start: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary-end" className="text-gray-300">End Date</Label>
                    <Input
                      id="summary-end"
                      type="date"
                      value={summaryDateRange.end}
                      onChange={(e) => setSummaryDateRange({ ...summaryDateRange, end: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSummaryReport}
                  disabled={isLoading === 'summary'}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {isLoading === 'summary' ? (
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
        </TabsContent>

        {/* AI Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Budget Forecast */}
            <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <CardTitle className="text-gray-200">Budget Forecast</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Next month revenue prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 border-gray-700 bg-gray-800/50">
                  <AlertDescription className="text-gray-300 text-sm">
                    AI-powered forecast based on current trends
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleBudgetForecast}
                  disabled={isLoading === 'budget'}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                >
                  {isLoading === 'budget' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Forecast
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Inventory Forecast */}
            <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-gray-200">Inventory Forecast</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Stock prediction & reorder alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 border-gray-700 bg-gray-800/50">
                  <AlertDescription className="text-gray-300 text-sm">
                    Predicts inventory needs for next month
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleInventoryForecast}
                  disabled={isLoading === 'inventory-forecast'}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {isLoading === 'inventory-forecast' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Forecast
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Sales Prediction */}
            <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-gray-200">Sales Prediction</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Item-wise sales forecast
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 border-gray-700 bg-gray-800/50">
                  <AlertDescription className="text-gray-300 text-sm">
                    Predicts best-selling items for planning
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleSalesPrediction}
                  disabled={isLoading === 'sales-prediction'}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isLoading === 'sales-prediction' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Prediction
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}