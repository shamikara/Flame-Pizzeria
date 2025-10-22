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
        const requests = await prisma.cateringrequest.findMany({
            orderBy: { createdAt: 'desc' }
        });

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