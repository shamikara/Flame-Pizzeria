import { NextResponse } from 'next/server'
import db from '@/lib/db'
import {
  SHIFT_DEFINITIONS,
  isLeadership,
  type EmployeeWithRelations,
  type ShiftAssignmentInfo,
  type ShiftName
} from '@/lib/shift-rules'

interface MonthlyShiftSummary {
  date: string
  shifts: Record<
    ShiftName,
    {
      definition: typeof SHIFT_DEFINITIONS[ShiftName]
      assignments: Array<{
        id: number
        employeeId: number
        status: string
        notes: string | null
        employee: {
          id: number
          firstName: string
          lastName: string
          role: string
          leadershipTitle: string | null
        }
      }>
      leaderOnDuty: boolean
      counts: {
        total: number
        onDuty: number
        scheduled: number
        completed: number
        absent: number
      }
    }
  >
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    const now = new Date()
    const year = yearParam ? Number(yearParam) : now.getUTCFullYear()
    const month = monthParam ? Number(monthParam) : now.getUTCMonth() + 1

    if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid year or month. Expected integers, month 1-12.' },
        { status: 400 }
      )
    }

    const { start, end } = getMonthBounds(year, month)

    const shifts = await db.shift.findMany({
      where: {
        date: {
          gte: start,
          lt: end
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
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    const dayMap = new Map<string, MonthlyShiftSummary>()

    for (const shift of shifts) {
      const dayKey = toDateKey(shift.date)

      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, buildEmptyDay(dayKey))
      }

      const daySummary = dayMap.get(dayKey)!
      const shiftName = normalizeShiftName(shift.name)

      if (!shiftName) {
        console.warn(`Skipping shift "${shift.name}" on ${dayKey} — unrecognized name`)
        continue
      }

      const assignment = {
        id: shift.id,
        employeeId: shift.employeeId,
        status: shift.status,
        notes: shift.notes ?? null,
        employee: {
          id: shift.employee.user.id,
          firstName: shift.employee.user.firstName,
          lastName: shift.employee.user.lastName,
          role: shift.employee.user.role,
          leadershipTitle: shift.employee.leadership?.position ?? null
        }
      }

      const bucket = daySummary.shifts[shiftName]
      bucket.assignments.push(assignment)

      bucket.counts.total += 1
      bucket.counts.onDuty += shift.status === 'ON_DUTY' ? 1 : 0
      bucket.counts.completed += shift.status === 'COMPLETED' ? 1 : 0
      bucket.counts.absent += shift.status === 'ABSENT' ? 1 : 0
      bucket.counts.scheduled += shift.status === 'SCHEDULED' ? 1 : 0

      if (!bucket.leaderOnDuty) {
        const employeeWithRelations = shift as ShiftAssignmentInfo
        bucket.leaderOnDuty = isLeadership(
          employeeWithRelations.employee as EmployeeWithRelations
        )
      }
    }

    const days = fillMissingDays(start, end, dayMap)

    return NextResponse.json({
      year,
      month,
      days
    })
  } catch (error) {
    console.error('Failed to fetch monthly shifts:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function normalizeShiftName(rawName: string | null | undefined): ShiftName | null {
    if (!rawName) return null
  
    const name = rawName.trim().toLowerCase()
    if (!name) return null
  
    const normalized = name.replace(/\s+/g, ' ')
  
    if (
      normalized.includes('morning') ||
      normalized.includes('am') ||
      normalized.includes('open') ||
      normalized.includes('breakfast') ||
      normalized.includes('day')
    ) {
      return 'Morning'
    }
  
    if (
      normalized.includes('evening') ||
      normalized.includes('pm') ||
      normalized.includes('swing') ||
      normalized.includes('dinner') ||
      normalized.includes('afternoon')
    ) {
      return 'Evening'
    }
  
    if (
      normalized.includes('night') ||
      normalized.includes('overnight') ||
      normalized.includes('graveyard') ||
      normalized.includes('close') ||
      normalized.includes('closing')
    ) {
      return 'Night'
    }
  
    return null
  }

/**
 * Helpers
 */
function getMonthBounds(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  return { start, end }
}

function buildEmptyDay(dateKey: string): MonthlyShiftSummary {
  return {
    date: dateKey,
    shifts: {
      Morning: {
        definition: SHIFT_DEFINITIONS.Morning,
        assignments: [],
        leaderOnDuty: false,
        counts: { total: 0, onDuty: 0, scheduled: 0, completed: 0, absent: 0 }
      },
      Evening: {
        definition: SHIFT_DEFINITIONS.Evening,
        assignments: [],
        leaderOnDuty: false,
        counts: { total: 0, onDuty: 0, scheduled: 0, completed: 0, absent: 0 }
      },
      Night: {
        definition: SHIFT_DEFINITIONS.Night,
        assignments: [],
        leaderOnDuty: false,
        counts: { total: 0, onDuty: 0, scheduled: 0, completed: 0, absent: 0 }
      }
    }
  }
}

function fillMissingDays(
  start: Date,
  end: Date,
  dayMap: Map<string, MonthlyShiftSummary>
) {
  const days: MonthlyShiftSummary[] = []
  const cursor = new Date(start)

  while (cursor < end) {
    const key = toDateKey(cursor)
    if (dayMap.has(key)) {
      days.push(dayMap.get(key)!)
    } else {
      days.push(buildEmptyDay(key))
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return days
}

function toDateKey(date: Date | string) {
    const d = typeof date === 'string' ? new Date(date) : date
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }