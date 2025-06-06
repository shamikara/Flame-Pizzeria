"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge, PlusCircle } from "lucide-react";
import { EmployeeForm } from '@/components/employee-form';
import { LeaveStatus } from '@prisma/client';

type EmployeeWithDetails = {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  salary: number;
  leaveStatus: string;
  shifts: {
    start: Date;
    end: Date;
  }[];
};

async function getEmployees(): Promise<EmployeeWithDetails[]> {
  const res = await fetch('/api/employees/list');
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    getEmployees().then(setEmployees).catch(console.error);
  }, []);

  const refreshData = () => {
    getEmployees().then(setEmployees).catch(console.error);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Manage Employees</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Employee</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Employee</DialogTitle>
            </DialogHeader>
            <EmployeeForm onFormSubmit={() => {
                setIsDialogOpen(false);
                refreshData();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Shift</TableHead>
              <TableHead className="text-right">Salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  <div>{`${employee.user.firstName} ${employee.user.lastName}`}</div>
                  <div className="text-sm text-muted-foreground">{employee.user.email}</div>
                </TableCell>
                <TableCell>{employee.user.role}</TableCell>
                <TableCell>
                  <Badge variant={employee.leaveStatus === LeaveStatus.ACTIVE ? "default" : "secondary"}>
                    {employee.leaveStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {employee.shifts[0] 
                    ? new Date(employee.shifts[0].start).toLocaleString()
                    : 'No upcoming shifts'
                  }
                </TableCell>
                <TableCell className="text-right">Rs. {employee.salary.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}