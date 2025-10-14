import { Role, type Shift, type Employee, type Leadership } from "@prisma/client"

/**
 * Canonical shift blocks used across the app.
 */
export const SHIFT_DEFINITIONS = {
  Morning: { name: "Morning", startTime: "05:00", endTime: "12:00" },
  Evening: { name: "Evening", startTime: "12:00", endTime: "19:00" },
  Night: { name: "Night", startTime: "19:00", endTime: "24:00" }
} as const

export type ShiftName = keyof typeof SHIFT_DEFINITIONS

/**
 * Leadership titles that satisfy the “leader on duty” requirement.
 */
export const LEADERSHIP_ROLES = new Set([
  "Manager",
  "Assistant Manager",
  "Head Chef",
  "Sous Chef"
])

const MANAGERIAL_PRISMA_ROLES = new Set<Role>([Role.MANAGER, Role.ADMIN])

export interface EmployeeWithRelations extends Employee {
  user: {
    id: number
    firstName: string
    lastName: string
    role: Role
  }
  leadership?: Leadership | null
}

export interface ShiftAssignmentInfo extends Shift {
  employee: EmployeeWithRelations
}

/**
 * Parameters needed to validate a candidate assignment.
 */
export interface ValidateShiftInput {
  /** Assignment the user is trying to create/update. */
  candidate: EmployeeWithRelations
  shiftName: ShiftName
  targetDate: Date

  /** Existing shifts (excluding the candidate) on the same day. */
  dayAssignments: ShiftAssignmentInfo[]

  /** Assignments for the same employee on the previous day (used for cooldown checks). */
  previousDayAssignments: ShiftAssignmentInfo[]

  /** Optional helper if you want to check already-booked future shifts. */
  nextDayAssignments?: ShiftAssignmentInfo[]
}

/**
 * High-level validator that returns human-readable rule violations.
 * Return an empty array when the candidate assignment is valid.
 */
export function getShiftRuleViolations(input: ValidateShiftInput): string[] {
  const violations: string[] = []

  const { candidate, shiftName, targetDate, dayAssignments, previousDayAssignments } = input
  const sameDayAssignments = dayAssignments.filter((shift) =>
    isSameEmployee(shift.employeeId, candidate.id)
  )

  validateDuplicateDailyAssignments({ candidate, shiftName, sameDayAssignments, violations })
  validateRoleAvailability({ candidate, shiftName, targetDate, dayAssignments, violations })
  validateLeadershipCoverage({ candidate, shiftName, dayAssignments, violations })
  validateDoubleShiftCooldown({ candidate, shiftName, targetDate, previousDayAssignments, violations })

  return violations
}

/**
 * Ensure a candidate is not scheduled more than twice per day and not twice in the same block.
 */
function validateDuplicateDailyAssignments({
  candidate,
  shiftName,
  sameDayAssignments,
  violations
}: {
  candidate: EmployeeWithRelations
  shiftName: ShiftName
  sameDayAssignments: ShiftAssignmentInfo[]
  violations: string[]
}) {
  if (sameDayAssignments.some((shift) => (shift.name as ShiftName) === shiftName)) {
    violations.push(
      `${candidate.user.firstName} ${candidate.user.lastName} is already scheduled for the ${shiftName} shift`
    )
    return
  }

  if (sameDayAssignments.length >= 2) {
    violations.push(
      `${candidate.user.firstName} ${candidate.user.lastName} already has two shifts on this day`
    )
  }

  if (shiftName === "Night" && sameDayAssignments.length > 0) {
    violations.push("Night shift cannot be combined with other shifts on the same day")
  }
}

/**
 * Enforce role-based availability (storekeeper, delivery, leadership presence).
 */
function validateRoleAvailability({
  candidate,
  shiftName,
  targetDate,
  dayAssignments,
  violations
}: {
  candidate: EmployeeWithRelations
  shiftName: ShiftName
  targetDate: Date
  dayAssignments: ShiftAssignmentInfo[]
  violations: string[]
}) {
  const role = candidate.user.role
  const leadershipTitle = candidate.leadership?.position ?? undefined

  const isLeader =
    MANAGERIAL_PRISMA_ROLES.has(role) ||
    (leadershipTitle !== undefined && LEADERSHIP_ROLES.has(leadershipTitle))

  if (role === Role.STORE_KEEP) {
    if (shiftName !== "Morning") {
      violations.push("Store Keeper can only work the Morning shift")
    }
    if (isSunday(targetDate)) {
      violations.push("Store Keeper is off on Sundays")
    }
  }

  if (role === Role.DELIVERY_PERSON && shiftName === "Night") {
    violations.push("Delivery staff cannot be assigned to the Night shift")
  }

  if (shiftName === "Morning" || shiftName === "Evening") {
    const shiftAssignments = dayAssignments.filter((assignment) => assignment.name === shiftName)
    const shiftHasLeader = shiftAssignments.some((assignment) => isLeadership(assignment.employee))

    if (!isLeader && !shiftHasLeader) {
      violations.push(
        `First ${shiftName.toLowerCase()} assignment must be a Manager, Head Chef, or Sous Chef`
      )
    }
  }
}

/**
 * Guarantee Morning/Evening shifts have at least one leadership presence.
 */
function validateLeadershipCoverage({
  candidate,
  shiftName,
  dayAssignments,
  violations
}: {
  candidate: EmployeeWithRelations
  shiftName: ShiftName
  dayAssignments: ShiftAssignmentInfo[]
  violations: string[]
}) {
  if (shiftName === "Night") return

  const roster = [...dayAssignments.map((item) => item.employee), candidate]
  const hasLeader = roster.some((employee) => isLeadership(employee))
  if (!hasLeader) {
    violations.push("Morning and Evening shifts must include a Manager, Head Chef, or Sous Chef")
  }
}

/**
 * Enforce the “double shift then rest two shifts” rule.
 *
 * If an employee worked both Morning and Evening yesterday, they cannot take the
 * next Morning or Evening shift without resting those two slots.
 */
function validateDoubleShiftCooldown({
  candidate,
  shiftName,
  targetDate,
  previousDayAssignments,
  violations
}: {
  candidate: EmployeeWithRelations
  shiftName: ShiftName
  targetDate: Date
  previousDayAssignments: ShiftAssignmentInfo[]
  violations: string[]
}) {
  if (shiftName === "Night") return

  const previousDayKey = toDateKey(addDays(targetDate, -1))
  const previousDayShifts = previousDayAssignments.filter((assignment) =>
    isSameEmployee(assignment.employeeId, candidate.id)
  )

  const workedMorning = previousDayShifts.some((shift) => shift.name === "Morning")
  const workedEvening = previousDayShifts.some((shift) => shift.name === "Evening")

  if (workedMorning && workedEvening) {
    violations.push(
      `${candidate.user.firstName} ${candidate.user.lastName} must rest the next Morning and Evening after a double shift on ${previousDayKey}`
    )
  }
}

/**
 * Convenience: determine if this employee satisfies leadership coverage.
 */
export function isLeadership(employee: EmployeeWithRelations): boolean {
  const leadershipTitle = employee.leadership?.position ?? undefined
  return (
    MANAGERIAL_PRISMA_ROLES.has(employee.user.role) ||
    (leadershipTitle !== undefined && LEADERSHIP_ROLES.has(leadershipTitle))
  )
}

/**
 * Utility to summarise a day’s roster by shift name.
 */
export function groupAssignmentsByShift(
  assignments: ShiftAssignmentInfo[],
  includeCandidate?: { shiftName: ShiftName; employee: EmployeeWithRelations }
): Record<ShiftName, EmployeeWithRelations[]> {
  const groups: Record<ShiftName, EmployeeWithRelations[]> = {
    Morning: [],
    Evening: [],
    Night: []
  }

  for (const shift of assignments) {
    const name = shift.name as ShiftName
    groups[name]?.push(shift.employee)
  }

  if (includeCandidate) {
    groups[includeCandidate.shiftName]?.push(includeCandidate.employee)
  }

  return groups
}

/**
 * Non-exported helpers.
 */
function isSameEmployee(a: number, b: number): boolean {
  return a === b
}

function isSunday(date: Date): boolean {
  return date.getUTCDay() === 0
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + amount)
  return next
}

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0]
}