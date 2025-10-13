import { NextResponse } from 'next/server'
import db from '@/lib/db'
import {
  getShiftRuleViolations,
  SHIFT_DEFINITIONS,
  type ShiftName,
  type EmployeeWithRelations
} from '@/lib/shift-rules'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const whereClause: any = {}

    if (date) {
      const start = new Date(date)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)

      whereClause.date = {
        gte: start,
        lt: end
      }
    }

    const shifts = await db.shift.findMany({
        where: whereClause,
        include: {
          employee: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  role: true
                }
              },
              leadership: true
            }
          }
        },
        orderBy: {
          startTime: 'asc'
        }
      })

    return NextResponse.json(shifts)
  } catch (error) {
    console.error('Failed to fetch shifts:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
    try {
      const data = await request.json()
  
      const shiftName = data.name as ShiftName
      const shiftDefinition = SHIFT_DEFINITIONS[shiftName]
      if (!shiftDefinition) {
        return NextResponse.json({ error: 'Invalid shift name' }, { status: 400 })
      }
  
      const targetDate = new Date(data.date)
      const candidate = await db.employee.findUnique({
        where: { id: data.employeeId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          },
          leadership: true
        }
      })
  
      if (!candidate) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
      }
  
      const startOfDay = new Date(targetDate)
      startOfDay.setUTCHours(0, 0, 0, 0)
      const endOfDay = new Date(startOfDay)
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1)
  
      const dayAssignments = await db.shift.findMany({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true
                }
              },
              leadership: true
            }
          }
        }
      })
  
      const previousDayAssignments = await db.shift.findMany({
        where: {
          date: {
            gte: addDays(startOfDay, -1),
            lt: startOfDay
          },
          employeeId: data.employeeId
        },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true
                }
              },
              leadership: true
            }
          }
        }
      })
  
      const violations = getShiftRuleViolations({
        candidate: candidate as EmployeeWithRelations,
        shiftName,
        targetDate,
        dayAssignments,
        previousDayAssignments
      })
  
      if (violations.length > 0) {
        return NextResponse.json(
          {
            error: 'Shift validation failed',
            violations
          },
          { status: 409 }
        )
      }
  
      const shift = await db.shift.create({
        data: {
          employeeId: data.employeeId,
          name: shiftDefinition.name,
          startTime: shiftDefinition.startTime,
          endTime: shiftDefinition.endTime,
          date: targetDate,
          status: data.status,
          notes: data.notes
        },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  role: true
                }
              },
              leadership: true
            }
          }
        }
      })
  
      return NextResponse.json(shift, { status: 201 })
    } catch (error: any) {
      console.error('Failed to create shift:', error)
  
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'This employee already has a shift scheduled for this date' },
          { status: 409 }
        )
      }
  
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  }
  
  function addDays(date: Date, amount: number): Date {
    const copy = new Date(date)
    copy.setUTCDate(copy.getUTCDate() + amount)
    return copy
  }