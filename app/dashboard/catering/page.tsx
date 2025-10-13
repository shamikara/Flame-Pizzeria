import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import prisma from "@/lib/db";

export default async function CateringPage() {
    const requests = await prisma.cateringRequest.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Catering Requests</h1>
            <DataTable
                columns={columns}
                data={requests}
                searchColumn="contactName" // Enable search on contact names
            />    </div>
    );
}