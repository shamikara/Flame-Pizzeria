import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const employees = await db.employee.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      },
      orderBy: {
        user: {
          firstName: 'asc'
        }
      }
    });

    // Format for the shift management table
    const formattedEmployees = employees.map(emp => ({
      id: emp.id,
      name: `${emp.user.firstName} ${emp.user.lastName}`,
      role: emp.user.role
    }));

    return NextResponse.json(formattedEmployees);
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}