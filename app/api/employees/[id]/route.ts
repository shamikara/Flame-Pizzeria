import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { user_role } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Schema for updating employee details
const updateEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.nativeEnum(user_role).optional(),
  salary: z.number().min(0, "Salary must be a positive number").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
}).refine(data => {
  // If newPassword is provided, currentPassword is required
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"],
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = parseInt(params.id);
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const employee = await db.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            contact: true,
            address: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Format the response
    const response = {
      id: employee.id,
      userId: employee.userId,
      firstName: employee.user.firstName,
      lastName: employee.user.lastName,
      email: employee.user.email,
      role: employee.user.role,
      contact: employee.user.contact,
      address: employee.user.address,
      salary: employee.salary,
      hireDate: employee.hireDate,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = parseInt(params.id);
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const { currentPassword, newPassword, ...updateData } = data;

    // Check if employee exists
    const existingEmployee = await db.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Handle password update if requested
    if (newPassword && currentPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        existingEmployee.user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: { fieldErrors: { currentPassword: ["Incorrect current password"] } } },
          { status: 400 }
        );
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update user and employee data in a transaction
    const result = await db.$transaction(async (prisma) => {
      // Update user data
      const updatedUser = await prisma.user.update({
        where: { id: existingEmployee.userId },
        data: {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          email: updateData.email,
          role: updateData.role,
          ...(updateData.password && { password: updateData.password }),
          // Only update contact and address if they're provided
          ...(updateData.contact !== undefined && { contact: updateData.contact }),
          ...(updateData.address !== undefined && { address: updateData.address }),
        },
      });

      // Update employee data
      const updatedEmployee = await prisma.employee.update({
        where: { id: employeeId },
        data: {
          ...(updateData.salary !== undefined && { salary: updateData.salary }),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              contact: true,
              address: true,
            },
          },
        },
      });

      return updatedEmployee;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update employee:", error);
    
    // Handle unique constraint violation (duplicate email)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}
