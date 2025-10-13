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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmployeeForm } from '@/components/employee-form';
import { LeaveStatus } from '@prisma/client';
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import ShiftChart from '@/components/shift-chart';
import ShiftManagementTable from '@/components/shift-management-table';
import { PlusCircle, Users, Trash2, Clock, Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    date: Date;
    status: string;
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
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  const handleDeleteClick = (employee: EmployeeWithDetails) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/employees?id=${employeeToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete employee');
      }

      toast({
        title: "Success",
        description: `${employeeToDelete.user.firstName} ${employeeToDelete.user.lastName} has been removed.`,
      });

      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Employee Management
        </h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 border border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-orange-600">
            <Users className="h-4 w-4 mr-2" />
            Employee Overview
          </TabsTrigger>
          <TabsTrigger value="shifts" className="data-[state=active]:bg-orange-600">
            <Clock className="h-4 w-4 mr-2" />
            Shift Chart
          </TabsTrigger>
          <TabsTrigger value="roster" className="data-[state=active]:bg-orange-600">
            <Calendar className="h-4 w-4 mr-2" />
            Duty Roster
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Employee Overview</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-md hover:shadow-lg transition-all">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-white">
                    Create New Employee
                  </DialogTitle>
                </DialogHeader>
                <EmployeeForm onFormSubmit={() => {
                  setIsDialogOpen(false);
                  refreshData();
                }} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 shadow-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400 animate-pulse">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-60" />
                Loading employees... <Spinner />
              </div>
            ) : employees.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-60" />
                No employees found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Role</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Next Shift</TableHead>
                    <TableHead className="text-right text-gray-300">Salary</TableHead>
                    <TableHead className="text-right text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id} className="border-gray-800 hover:bg-gray-800/40 transition-all">
                      <TableCell className="font-medium text-gray-200">
                        <div>{`${employee.user.firstName} ${employee.user.lastName}`}</div>
                        <div className="text-sm text-gray-400">{employee.user.email}</div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                          {employee.user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.leaveStatus === LeaveStatus.ACTIVE ? "default" : "secondary"}
                          className={employee.leaveStatus === LeaveStatus.ACTIVE ? "bg-green-500/20 text-green-400 border-green-500/50" : ""}>
                          {employee.leaveStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {employee.shifts[0]
                          ? `${employee.shifts[0].name} - ${employee.shifts[0].startTime} (${new Date(employee.shifts[0].date).toLocaleDateString()})`
                          : 'No upcoming shifts'
                        }
                      </TableCell>
                      <TableCell className="text-right text-gray-200 font-semibold">
                        Rs. {employee.salary.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(employee)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Current Shift Status</h3>
            <ShiftChart />
          </div>
        </TabsContent>

        <TabsContent value="roster" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Duty Roster Management</h3>
            <ShiftManagementTable />
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to remove {employeeToDelete?.user.firstName} {employeeToDelete?.user.lastName}?
              This action cannot be undone and will delete all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Spinner /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Employee
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}