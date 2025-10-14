"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

type ShiftName = "Morning" | "Evening" | "Night"

interface ShiftChartProps {
  currentDate?: Date
}

interface ApiShift {
  id: number
  name: string
  startTime: string
  endTime: string
  status: "SCHEDULED" | "ON_DUTY" | "COMPLETED" | "ABSENT"
  notes: string | null
  employeeId: number
  employee: {
    user: {
      id: number
      firstName: string
      lastName: string
      role: string
    }
    leadership?: {
      position: string | null
    } | null
  }
}

interface ShiftSection {
  key: ShiftName
  label: string
  timeRange: string
  assignments: Array<{
    id: number
    status: ApiShift["status"]
    notes: string | null
    employee: {
      id: number
      fullName: string
      role: string
      leadershipTitle: string | null
      isLeader: boolean
    }
  }>
}

const SHIFT_SECTIONS: Record<ShiftName, { label: string; timeRange: string }> = {
  Morning: { label: "Morning", timeRange: "05:00 — 12:00" },
  Evening: { label: "Evening", timeRange: "12:00 — 19:00" },
  Night: { label: "Night", timeRange: "19:00 — 24:00" }
}

function normalizeShiftName(rawName: string | null | undefined): ShiftName | null {
  if (!rawName) return null

  const name = rawName.trim().toLowerCase()
  if (!name) return null

  const normalized = name.replace(/\s+/g, " ")

  if (
    normalized.includes("morning") ||
    normalized.includes("am") ||
    normalized.includes("open") ||
    normalized.includes("breakfast") ||
    normalized.includes("day")
  ) {
    return "Morning"
  }

  if (
    normalized.includes("evening") ||
    normalized.includes("pm") ||
    normalized.includes("swing") ||
    normalized.includes("dinner") ||
    normalized.includes("afternoon")
  ) {
    return "Evening"
  }

  if (
    normalized.includes("night") ||
    normalized.includes("overnight") ||
    normalized.includes("graveyard") ||
    normalized.includes("close") ||
    normalized.includes("closing")
  ) {
    return "Night"
  }

  return null
}

const LEADERSHIP_TITLES = new Set(["Manager", "Assistant Manager", "Head Chef", "Sous Chef"])

function isLeadership(role: string, leadershipTitle: string | null): boolean {
  return role === "MANAGER" || role === "ADMIN" || (leadershipTitle ? LEADERSHIP_TITLES.has(leadershipTitle) : false)
}

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0]
}

function formatDisplayDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

function getStatusColor(status: ApiShift["status"]) {
  switch (status) {
    case "ON_DUTY":
      return "bg-green-500"
    case "SCHEDULED":
      return "bg-blue-500"
    case "COMPLETED":
      return "bg-gray-500"
    case "ABSENT":
      return "bg-red-500"
    default:
      return "bg-gray-400"
  }
}

function getStatusIcon(status: ApiShift["status"]) {
  switch (status) {
    case "ON_DUTY":
      return <CheckCircle className="h-3 w-3" />
    case "SCHEDULED":
      return <Clock className="h-3 w-3" />
    case "COMPLETED":
      return <CheckCircle className="h-3 w-3" />
    case "ABSENT":
      return <AlertCircle className="h-3 w-3" />
    default:
      return <Clock className="h-3 w-3" />
  }
}

export default function ShiftChart({ currentDate = new Date() }: ShiftChartProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => toISODate(currentDate))
  const [loading, setLoading] = useState<boolean>(true)
  const [sections, setSections] = useState<ShiftSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const totalAssignments = useMemo(
    () => sections.reduce((total, section) => total + section.assignments.length, 0),
    [sections]
  )

  const leadersOnDuty = useMemo(
    () =>
      sections.reduce(
        (total, section) => total + section.assignments.filter((assignment) => assignment.employee.isLeader).length,
        0
      ),
    [sections]
  )

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/shifts?date=${selectedDate}`, { cache: "no-store", headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } })

        if (!response.ok) {
          setError(`Failed to load shifts (${response.status})`)
          setSections([])
          return
        }

        const data: ApiShift[] = await response.json()
        const grouped: Record<ShiftName, ShiftSection> = {
          Morning: { key: "Morning", label: SHIFT_SECTIONS.Morning.label, timeRange: SHIFT_SECTIONS.Morning.timeRange, assignments: [] },
          Evening: { key: "Evening", label: SHIFT_SECTIONS.Evening.label, timeRange: SHIFT_SECTIONS.Evening.timeRange, assignments: [] },
          Night: { key: "Night", label: SHIFT_SECTIONS.Night.label, timeRange: SHIFT_SECTIONS.Night.timeRange, assignments: [] }
        }

        for (const shift of data) {
          const normalizedName = normalizeShiftName(shift.name)
          if (!normalizedName) continue

          const leadershipTitle = shift.employee.leadership?.position ?? null
          const employeeIsLeader = isLeadership(shift.employee.user.role, leadershipTitle)

          grouped[normalizedName].assignments.push({
            id: shift.id,
            status: shift.status,
            notes: shift.notes,
            employee: {
              id: shift.employee.user.id,
              fullName: `${shift.employee.user.firstName} ${shift.employee.user.lastName}`,
              role: shift.employee.user.role,
              leadershipTitle,
              isLeader: employeeIsLeader
            }
          })
        }

        setSections(Object.values(grouped))
      } catch (err) {
        console.error("Failed to fetch shift data:", err)
        setError("Unexpected error while loading shifts.")
        setSections([])
      } finally {
        setLoading(false)
      }
    }

    fetchShifts()
  }, [selectedDate])

  const handlePrevDay = () => {
    const current = new Date(selectedDate)
    current.setUTCDate(current.getUTCDate() - 1)
    setSelectedDate(toISODate(current))
  }

  const handleNextDay = () => {
    const current = new Date(selectedDate)
    current.setUTCDate(current.getUTCDate() + 1)
    setSelectedDate(toISODate(current))
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5" />
              Daily Shift Coverage
            </CardTitle>
            <p className="text-sm text-gray-400">Track staffing and leadership coverage for each shift.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handlePrevDay} variant="ghost" className="text-gray-300 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
            />
            <Button onClick={handleNextDay} variant="ghost" className="text-gray-300 hover:text-white">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryTile
              label="Scheduled Employees"
              value={totalAssignments}
              icon={<Users className="h-4 w-4" />}
            />
            <SummaryTile
              label="Executives On Duty"
              value={leadersOnDuty}
              icon={<CheckCircle className="h-4 w-4" />}
            />
            <SummaryTile
              label="Date"
              value={formatDisplayDate(selectedDate)}
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-950 border border-red-700 text-red-200">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Failed to load shifts</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-gray-300">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Loading daily roster...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((section) => {
            const leaderAssigned = section.assignments.some((assignment) => assignment.employee.isLeader)
            const coverageStatus = leaderAssigned ? (
              <Badge className="bg-green-500/20 text-green-300" variant="outline">
               👨‍⚖️ Executives on duty
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-300" variant="outline">
               👨‍⚖️ Executives required
              </Badge>
            )

            return (
              <Card key={section.key} className="flex flex-col bg-gray-900 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-white">
                    <span>{section.label} Shift</span>
                    {coverageStatus}
                  </CardTitle>
                  <p className="text-sm text-gray-400">{section.timeRange}</p>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {section.assignments.length === 0 ? (
                    <div className="rounded-md border border-dashed border-gray-700 p-4 text-center text-sm text-gray-500">
                      No employees scheduled for this shift.
                    </div>
                  ) : (
                    section.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-gray-800/60 px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`h-2 w-2 rounded-full ${getStatusColor(assignment.status)}`} />
                          <div>
                            <p className="text-sm text-white">{assignment.employee.fullName}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                              <span>{assignment.employee.role}</span>
                              {assignment.employee.leadershipTitle && (
                                <Badge variant="outline" className="border-orange-500 text-orange-400">
                                  {assignment.employee.leadershipTitle}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(assignment.status)}
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              assignment.status === "ON_DUTY"
                                ? "border-green-500 text-green-400"
                                : assignment.status === "SCHEDULED"
                                  ? "border-blue-500 text-blue-400"
                                  : assignment.status === "ABSENT"
                                    ? "border-red-500 text-red-400"
                                    : "border-gray-500 text-gray-400"
                            }`}
                          >
                            {assignment.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryTile({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/80 p-4">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  )
}