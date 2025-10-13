
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
            email: true,
            role: true,
          }
        },
        // Include only the next upcoming shift for each employee
        shifts: {
          where: {
            date: {
              gte: new Date(), // Get shifts that are from today onwards
            }
          },
          orderBy: {
            date: 'asc', // Order by the date to get the very next one
          },
          take: 1, // Only take the first result
        }
      },
      orderBy: {
        user: {
            firstName: 'asc'
        }
      }
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}