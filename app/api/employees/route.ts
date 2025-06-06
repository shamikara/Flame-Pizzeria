import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const createEmployeeSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(Role),
  salary: z.number(),
});

export async function POST(request: Request) {
  try {
    const data = createEmployeeSchema.parse(await request.json());
    
    // A default password for new employees. They should change it on first login.
    const defaultPassword = await bcrypt.hash('password123', 10);

    // Use a transaction to ensure both User and Employee are created successfully
    const result = await db.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: defaultPassword,
          role: data.role,
        },
      });

      const newEmployee = await prisma.employee.create({
        data: {
          userId: newUser.id,
          salary: data.salary,
        },
      });

      return { newUser, newEmployee };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create employee:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    // Handle case where email is already taken
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}