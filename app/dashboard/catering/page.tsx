import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import prisma from "@/lib/db";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

export default async function CateringPage() {
    try {
        console.log('[DASHBOARD] Loading catering requests...');
        // Force fresh data by adding cache control
        const requests = await prisma.cateringrequest.findMany({
            orderBy: { createdAt: 'desc' }
        });
        console.log('[DASHBOARD] Found', requests.length, 'catering requests:', requests.map(r => ({ id: r.id, status: r.status, contact: r.contactName })));

        // Calculate status summary
        const statusSummary = requests.reduce((acc, request) => {
            acc[request.status] = (acc[request.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        console.log('[DASHBOARD] Status summary:', statusSummary);

        return (
            <div className="flex-1 space-y-6 p-6 md:p-10">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        Catering Requests
                    </h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Review upcoming catering events and manage customer enquiries.
                    </p>
                </div>

                {/* Status Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{statusSummary.PENDING || 0}</p>
                                </div>
                                <div className="w-8 h-8 bg-yellow-200 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                                    <span className="text-yellow-800 dark:text-yellow-200 text-sm">⏳</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Confirmed</p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{statusSummary.CONFIRMED || 0}</p>
                                </div>
                                <div className="w-8 h-8 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                                    <span className="text-green-800 dark:text-green-200 text-sm">✅</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Total</p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{requests.length}</p>
                                </div>
                                <div className="w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                                    <span className="text-blue-800 dark:text-blue-200 text-sm">📊</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 shadow-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-gray-200">Requests queue</CardTitle>
                        <CardDescription className="text-gray-400">
                            Filter, search, and update catering event details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 md:px-6 pb-6">
                        <DataTable
                            columns={columns}
                            data={requests.map(request => ({
                                ...request,
                                id: request.id.toString()
                            }))}
                            searchColumn="contactName"
                        />
                    </CardContent>
                </Card>
            </div>
        );
    } catch (error) {
        console.error('Failed to load catering requests:', error);
        return (
            <div className="flex-1 space-y-6 p-6 md:p-10">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        Catering Requests
                    </h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Review upcoming catering events and manage customer enquiries.
                    </p>
                </div>
                <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 shadow-xl">
                    <CardContent className="py-10 text-center text-sm text-red-400">
                        Unable to load catering requests. Please try again later.
                    </CardContent>
                </Card>
            </div>
        );
    }
}