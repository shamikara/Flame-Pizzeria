'use client';

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type CateringRequest = {
  id: string;
  eventType: string;
  eventDate: Date;
  guestCount: number;
  contactName: string;
  contactEmail: string;
  status: string;
  createdAt: Date;
};

export const columns: ColumnDef<CateringRequest>[] = [
  {
    accessorKey: "eventType",
    header: "Event Type",
  },
  {
    accessorKey: "contactName",
    header: "Contact",
  },
  {
    accessorKey: "eventDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Event Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.getValue("eventDate")).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        row.getValue("status") === "CONFIRMED" ? "bg-green-100 text-green-800" :
        row.getValue("status") === "PENDING" ? "bg-yellow-100 text-yellow-800" :
        "bg-gray-100 text-gray-800"
      }`}>
        {row.getValue("status")}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const request = row.original;
      
      const updateStatus = async (status: string) => {
        await fetch(`/api/catering/${request.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        window.location.reload();
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => updateStatus('PENDING')}>
              <Badge variant="secondary" className="mr-2">P</Badge>
              Set Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus('CONFIRMED')}>
              <Badge variant="default" className="mr-2 bg-green-500 text-white">C</Badge>
              Confirm
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus('COMPLETED')}>
              <Badge variant="outline" className="mr-2">D</Badge>
              Mark Done
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(request.id)}>
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = `mailto:${request.contactEmail}`}>
              Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];