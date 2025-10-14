import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import prisma from "@/lib/db";

export default async function CateringPage() {
    try {
        const requests = await prisma.cateringrequest.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return (
            <div className="container mx-auto py-6">
                <h1 className="text-2xl font-bold mb-6">Catering Requests</h1>
                <DataTable
                    columns={columns}
                    data={requests.map(request => ({
                        ...request,
                        id: request.id.toString()
                    }))}
                    searchColumn="contactName" // Enable search on contact names
                />
            </div>
        );
    } catch (error) {
        console.error('Failed to load catering requests:', error);
        return (
            <div className="container mx-auto py-6">
                <h1 className="text-2xl font-bold mb-6">Catering Requests</h1>
                <p className="text-sm text-red-500">
                    Unable to load catering requests. Please try again later.
                </p>
            </div>
        );
    }
}