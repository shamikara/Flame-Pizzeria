import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request: Request) {
    try {
      const { date } = await request.json()
      
      // Get all employees WITH USER DATA
      const employees = await db.employee.findMany({
        include: {
          user: true  // ✅ Ensure we include user data
        },
        take: 3
      })
      
      if (employees.length === 0) {
        // ✅ Return proper error structure
        return NextResponse.json(
          { error: 'No employees found. Add employees first.' }, 
          { status: 400 }
        )
      }
      
      const targetDate = date ? new Date(date) : new Date()
      
      const sampleShifts = employees.map((emp, index) => ({
        employeeId: emp.id,
        name: index < 2 ? 'Morning' : 'Evening',
        startTime: index < 2 ? '09:00' : '17:00',
        endTime: index < 2 ? '17:00' : '23:00',
        date: targetDate,
        status: index === 1 ? 'ON_DUTY' : 'SCHEDULED',
        notes: `Sample ${index < 2 ? 'morning' : 'evening'} shift`
      }))
      
      // ✅ Create all shifts in a single transaction
      const createdShifts = await db.$transaction(
        sampleShifts.map(shiftData => 
          db.shift.create({
            data: shiftData,
            include: {
              employee: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      role: true
                    }
                  }
                }
              }
            }
          })
        )
      )
      
      return NextResponse.json(createdShifts)
    } catch (error) {
      console.error('Failed to create sample shifts:', error)
      // ✅ Return detailed error message
      return NextResponse.json(
        { error: 'Internal Server Error', details: error.message }, 
        { status: 500 }
      )
    }
  }