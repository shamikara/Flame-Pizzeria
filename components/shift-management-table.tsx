"use client"

import { useEffect, useMemo, useState } from "react"
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, startOfMonth, subMonths } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CloudSun, Sun, MoonStar, ShieldCheck, AlertCircle, Trash2 } from "lucide-react"

import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Users,
    CheckCircle,
    AlertTriangle,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent as ConfirmDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader as ConfirmDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ShiftName = "Morning" | "Evening" | "Night"
type ShiftStatus = "SCHEDULED" | "ON_DUTY" | "COMPLETED" | "ABSENT"

interface MonthlyShiftResponse {
    year: number
    month: number
    days: MonthlyShiftSummary[]
}

interface MonthlyShiftSummary {
    date: string
    shifts: Record<
        ShiftName,
        {
            definition: {
                name: ShiftName
                startTime: string
                endTime: string
            }
            assignments: Array<{
                id: number
                employeeId: number
                status: ShiftStatus
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

interface ShiftManagementTableProps {
    currentDate?: Date
}

interface EmployeeOption {
    id: number
    name: string
    role: string
    leadershipTitle: string | null
}

const LEADERSHIP_TITLES = new Set(["Manager", "Assistant Manager", "Head Chef", "Sous Chef"])
const LEADERSHIP_ROLES = new Set(["MANAGER", "ADMIN"])
const isLeadershipEmployee = (employee?: EmployeeOption | null) => {
    if (!employee) return false
    const role = employee.role?.toUpperCase() ?? ""
    if (LEADERSHIP_ROLES.has(role)) return true
    return employee.leadershipTitle ? LEADERSHIP_TITLES.has(employee.leadershipTitle) : false
}

const SHIFT_ICONS: Record<ShiftName, React.ComponentType<{ className?: string }>> = {
    Morning: CloudSun,
    Evening: Sun,
    Night: MoonStar,
}

const SHIFT_STATUS_ICONS = {
    MISSING: AlertCircle,
    OK: ShieldCheck,
} as const

const SHIFT_OPTIONS: { value: ShiftName; label: string }[] = [
    { value: "Morning", label: "Morning (05:00 – 12:00)" },
    { value: "Evening", label: "Evening (12:00 – 19:00)" },
    { value: "Night", label: "Night (19:00 – 24:00)" }
]

const ROLE_THEME: Record<string, { label: string; bg: string; border: string; text: string }> = {
    MANAGER: { label: "Manager", bg: "bg-emerald-900/50", border: "border-emerald-500/40", text: "text-emerald-200" },
    CHEF: { label: "Chef", bg: "bg-orange-900/40", border: "border-orange-500/40", text: "text-orange-200" },
    STORE_KEEP: { label: "Store Keeper", bg: "bg-sky-900/40", border: "border-sky-500/40", text: "text-sky-200" },
    KITCHEN_HELPER: { label: "Kitchen Helper", bg: "bg-purple-900/40", border: "border-purple-500/40", text: "text-purple-200" },
    CASHIER: { label: "Cashier", bg: "bg-yellow-900/40", border: "border-yellow-500/40", text: "text-yellow-200" },
    DELIVERY: { label: "Delivery", bg: "bg-indigo-900/40", border: "border-indigo-500/40", text: "text-indigo-200" },
    DELIVERY_PERSON: { label: "Delivery", bg: "bg-indigo-900/40", border: "border-indigo-500/40", text: "text-indigo-200" },
    DEFAULT: { label: "Other Roles", bg: "bg-gray-900/70", border: "border-gray-700", text: "text-gray-200" }
}

const ROLE_LEGEND = Object.entries(ROLE_THEME)
    .filter(([key]) => key !== "DEFAULT")
    .reduce<Record<string, { label: string; bg: string; border: string; text: string }>>((acc, [_, value]) => {
        if (!acc[value.label]) {
            acc[value.label] = value
        }
        return acc
    }, {})

const resolveRoleTheme = (role?: string | null) => ROLE_THEME[role?.toUpperCase() ?? ""] ?? ROLE_THEME.DEFAULT

export default function ShiftManagementTable({ currentDate = new Date() }: ShiftManagementTableProps) {
    const [visibleMonth, setVisibleMonth] = useState(startOfMonth(currentDate))
    const [monthlyData, setMonthlyData] = useState<MonthlyShiftSummary[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedDay, setSelectedDay] = useState<MonthlyShiftSummary | null>(null)

    const [employees, setEmployees] = useState<EmployeeOption[]>([])
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [newShift, setNewShift] = useState({
        employeeId: "",
        shiftName: "Morning" as ShiftName,
        date: format(currentDate, "yyyy-MM-dd"),
        notes: ""
    })
    const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(null)
    const [deleting, setDeleting] = useState(false)

    const selectedShiftSummary = useMemo(() => {
        if (!selectedDay) return null
        return selectedDay.shifts[newShift.shiftName]
    }, [selectedDay, newShift.shiftName])

    const leaderAlreadyScheduled = selectedShiftSummary?.leaderOnDuty ?? false
    const leaderRequired = newShift.shiftName !== "Night" && !leaderAlreadyScheduled

    const selectedEmployee = useMemo(
        () => employees.find((emp) => String(emp.id) === newShift.employeeId) ?? null,
        [employees, newShift.employeeId]
    )

    const leadershipAvailable = useMemo(
        () => employees.some((emp) => isLeadershipEmployee(emp)),
        [employees]
    )

    useEffect(() => {
        if (!leaderRequired) return
        if (!newShift.employeeId) return
        if (selectedEmployee && !isLeadershipEmployee(selectedEmployee)) {
            setNewShift((prev) => ({ ...prev, employeeId: "" }))
        }
    }, [leaderRequired, newShift.employeeId, selectedEmployee])

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const response = await fetch("/api/employees")
                if (!response.ok) {
                    throw new Error(`Failed to load employees (${response.status})`)
                }
                const data = await response.json()
                if (Array.isArray(data)) {
                    setEmployees(
                        data.map((emp: any) => ({
                            id: emp.id,
                            name: `${emp.name ?? `${emp.user?.firstName ?? ""} ${emp.user?.lastName ?? ""}`}`.trim(),
                            role: emp.role ?? emp.user?.role ?? "UNKNOWN",
                            leadershipTitle: emp.leadershipTitle ?? emp.user?.leadershipTitle ?? null
                        }))
                    )
                } else {
                    setEmployees([])
                }
            } catch (err) {
                console.error("Failed to load employees", err)
                setEmployees([])
            }
        }
        loadEmployees()
    }, [])

    useEffect(() => {
        const fetchMonthlyData = async () => {
            setLoading(true)
            setError(null)
            try {
                const year = visibleMonth.getFullYear()
                const month = visibleMonth.getMonth() + 1
                const response = await fetch(`/api/shifts/by-month?year=${year}&month=${month}`)
                if (!response.ok) {
                    throw new Error(`Failed to fetch monthly shifts (${response.status})`)
                }
                const data: MonthlyShiftResponse = await response.json()
                setMonthlyData(data.days)
            } catch (err: any) {
                console.error("Failed to fetch monthly roster", err)
                setError(err?.message ?? "Unknown error while loading roster")
                setMonthlyData([])
            } finally {
                setLoading(false)
            }
        }

        fetchMonthlyData()
    }, [visibleMonth])

    const daysInMonth = useMemo(() => {
        const start = startOfMonth(visibleMonth)
        const end = endOfMonth(visibleMonth)
        return eachDayOfInterval({ start, end })
    }, [visibleMonth])

    const totalScheduled = useMemo(
        () =>
            monthlyData.reduce(
                (total, day) =>
                    total + ["Morning", "Evening", "Night"].reduce((inner, shift) => inner + day.shifts[shift as ShiftName].counts.total, 0),
                0
            ),
        [monthlyData]
    )

    const leadersMissing = useMemo(
        () =>
            monthlyData.reduce((total, day) => {
                return (
                    total +
                    ["Morning", "Evening"].reduce((inner, shift) => {
                        const slot = day.shifts[shift as ShiftName]
                        return inner + (slot.assignments.length > 0 && !slot.leaderOnDuty ? 1 : 0)
                    }, 0)
                )
            }, 0),
        [monthlyData]
    )

    const handleMonthChange = (direction: "prev" | "next") => {
        setVisibleMonth((prev) => (direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)))
    }

    const handleSelectDay = (dateKey: string) => {
        const day = monthlyData.find((d) => d.date === dateKey)
        setSelectedDay(day ?? null)
        setCreateDialogOpen(true)
        setNewShift((prev) => ({ ...prev, date: dateKey }))
    }

    const refreshMonthlyData = async () => {
        const year = visibleMonth.getFullYear()
        const month = visibleMonth.getMonth() + 1
        const refreshed = await fetch(`/api/shifts/by-month?year=${year}&month=${month}`)
        if (refreshed.ok) {
            const data: MonthlyShiftResponse = await refreshed.json()
            setMonthlyData(data.days)
        }
    }

    const handleCreateShift = async () => {
        if (!newShift.employeeId) {
            toast.error("Please select an employee")
            return
        }

        setSubmitting(true)
        try {
            const payload = {
                employeeId: Number(newShift.employeeId),
                name: newShift.shiftName,
                date: new Date(newShift.date),
                status: "SCHEDULED",
                notes: newShift.notes
            }

            const response = await fetch("/api/shifts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const body = await response.json().catch(() => ({}))
                if (body?.violations?.length) {
                    const firstLeadershipViolation = body.violations.find((msg: string) =>
                        msg.toLowerCase().includes("first morning") || msg.toLowerCase().includes("first evening")
                    )

                    if (firstLeadershipViolation) {
                        toast.error(firstLeadershipViolation, {
                            description: "Assign a Manager or Chef before adding other roles."
                        })
                    }

                    body.violations
                        .filter((msg: string) => msg !== firstLeadershipViolation)
                        .forEach((msg: string) => toast.error(msg))
                } else {
                    toast.error(body?.error ?? "Failed to create shift")
                }

                return
            }

            toast.success("Shift created successfully")
            setCreateDialogOpen(false)
            setNewShift({
                employeeId: "",
                shiftName: "Morning",
                date: format(visibleMonth, "yyyy-MM-dd"),
                notes: ""
            })
            await refreshMonthlyData()
        } catch (err) {
            console.error("Failed to create shift", err)
            toast.error("Unexpected error while creating shift")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteAssignment = async () => {
        if (assignmentToDelete === null) return

        setDeleting(true)
        try {
            const response = await fetch(`/api/shifts/${assignmentToDelete}`, {
                method: "DELETE"
            })

            if (!response.ok) {
                const body = await response.json().catch(() => ({}))
                toast.error(body?.error ?? "Failed to delete shift")
                return
            }

            toast.success("Shift removed")
            setAssignmentToDelete(null)
            await refreshMonthlyData()
        } catch (err) {
            console.error("Failed to delete shift", err)
            toast.error("Unexpected error while deleting shift")
        } finally {
            setDeleting(false)
        }
    }

    const renderDayCell = (date: Date) => {
        const dateKey = format(date, "yyyy-MM-dd")
        const dayData = monthlyData.find((d) => d.date === dateKey)
        const isToday = dateKey === format(new Date(), "yyyy-MM-dd")
        const isOtherMonth = date.getUTCMonth() !== visibleMonth.getUTCMonth()

        return (
            <button
                key={dateKey}
                onClick={() => handleSelectDay(dateKey)}
                className={`flex h-40 flex-col rounded-lg border bg-gray-900/80 p-3 text-left transition hover:border-orange-500 hover:bg-gray-900 ${isToday ? "border-orange-500" : "border-gray-800"
                    } ${isOtherMonth ? "bg-gray-900/40 text-gray-500" : ""}`}
                type="button"
            >
                <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>{format(date, "d")}</span>
                    {dayData && (
                        <Badge variant="outline" className="text-xs text-gray-400">
                            {Object.values(dayData.shifts).reduce((sum, shift) => sum + shift.counts.total, 0)} shifts
                        </Badge>
                    )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                    {(["Morning", "Evening", "Night"] as ShiftName[]).map((shiftName) => {
                        const slot = dayData?.shifts[shiftName]
                        const scheduledCount = slot?.counts.total ?? 0
                        const leaderStatus =
                            shiftName === "Night" || !slot
                                ? null
                                : slot.assignments.length === 0
                                    ? null
                                    : slot.leaderOnDuty
                                        ? "OK"
                                        : "MISSING"

                        const Icon = SHIFT_ICONS[shiftName]
                        const StatusIcon = leaderStatus ? SHIFT_STATUS_ICONS[leaderStatus] : null

                        return (
                            <Tooltip key={`${dateKey}-${shiftName}`}>
                                <TooltipTrigger asChild>
                                    <div className="flex h-full flex-col items-center justify-between rounded-md overflow-visible border border-gray-800 bg-gray-900/60 p-2 text-center transition hover:border-orange-400 hover:bg-gray-900">
                                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-800">
                                            <Icon className="h-4 w-4 text-white" />
                                            {StatusIcon && (
                                                <StatusIcon
                                                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ${leaderStatus === "OK" ? "text-emerald-400" : "text-orange-400"
                                                        }`}
                                                />
                                            )}
                                        </div>

                                        <div className="mt-2 text-sm font-medium text-white">{scheduledCount}</div>

                                        {leaderStatus === "OK" && (
                                            <Badge variant="outline" className="mt-2 border-green-500 text-[12px] uppercase tracking-wide text-green-400">
                                                👨‍⚖️
                                            </Badge>
                                        )}

                                        <span className="sr-only">{shiftName} shift</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={8} className="z-50 max-w-xs space-y-1 rounded-md border border-gray-700 bg-gray-900/95 p-3 shadow-xl">
                                    {slot && slot.assignments.length > 0 ? (

                                        slot.assignments.map((assignment) => {
                                            const theme = resolveRoleTheme(assignment.employee.role)
                                            return (
                                                <div
                                                    key={assignment.id}
                                                    className={`flex items-center justify-between rounded border px-2 py-1 text-sm ${theme.bg} ${theme.border} ${theme.text}`}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-sm text-white">
                                                            {assignment.employee.firstName} {assignment.employee.lastName}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${assignment.status === "ON_DUTY"
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
                                            )
                                        })

                                    ) : (
                                        <p className="text-xs text-gray-300">No employees assigned.</p>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </div>
            </button>
        )
    }

    return (
        <TooltipProvider delayDuration={150} skipDelayDuration={0}>
            <div className="space-y-4">
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <CalendarIcon className="h-5 w-5" />
                                Monthly Duty Roster
                            </CardTitle>
                            <p className="text-sm text-gray-400">
                                Ensure coverage per shift and role. Click a date to review and add assignments.
                            </p>
                            <div className="flex flex-row flex-wrap items-center gap-3">
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
                                    {Object.entries(ROLE_LEGEND).map(([label, theme]) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <span className={`h-2 w-6 rounded-full border ${theme.bg} ${theme.border}`} />
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="text-gray-300 hover:text-white" onClick={() => handleMonthChange("prev")}>
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <div className="rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white">
                                {format(visibleMonth, "MMMM yyyy")}
                            </div>
                            <Button variant="ghost" className="text-gray-300 hover:text-white" onClick={() => handleMonthChange("next")}>
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <SummaryStat icon={<Users className="h-4 w-4" />} label="Total Assignments" value={totalScheduled} />
                            <SummaryStat icon={<CheckCircle className="h-4 w-4" />} label="Days Scheduled" value={monthlyData.length} />
                            <SummaryStat icon={<AlertTriangle className="h-4 w-4" />} label="Leadership Alerts" value={leadersMissing} />
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Card className="bg-red-950 border border-red-700 text-red-200">
                        <CardContent className="flex items-center gap-3 py-4">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <div>
                                <p className="font-medium">Failed to load roster</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {loading ? (
                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <p>Loading monthly roster...</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
                        {renderWeekdayHeaders()}
                        {renderLeadingEmptyCells(daysInMonth[0])}
                        {daysInMonth.map((date) => renderDayCell(date))}
                    </div>
                )}

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent className="bg-gray-900 text-white sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Shift</DialogTitle>
                            <DialogDescription className="text-sm text-gray-400">
                                Assign an employee to {format(new Date(newShift.date), "MMMM d, yyyy")}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-400">Employee</label>
                                <Select
                                    value={newShift.employeeId}
                                    onValueChange={(value) => setNewShift((prev) => ({ ...prev, employeeId: value }))}
                                    disabled={submitting}
                                >
                                    <SelectTrigger className="bg-gray-800 text-white">
                                        <SelectValue placeholder="Select employee" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 text-white">
                                        {leaderRequired && (
                                            <div className="px-2 py-1 text-xs text-orange-400">
                                                Morning and Evening shifts must start with a Manager or Chef
                                            </div>
                                        )}
                                        {leaderRequired && !leadershipAvailable && (
                                            <div className="px-2 py-2 text-xs text-red-400">
                                                No leadership staff available for this shift.
                                            </div>
                                        )}
                                        {employees.map((emp) => {
                                            const value = String(emp.id)
                                            const blocked = leaderRequired && !isLeadershipEmployee(emp)
                                            return (
                                                <SelectItem
                                                    key={emp.id}
                                                    value={value}
                                                    disabled={blocked}
                                                    className={blocked ? "text-gray-500 opacity-60" : undefined}
                                                >
                                                    {emp.name} — {emp.role}
                                                    {emp.leadershipTitle ? ` (${emp.leadershipTitle})` : ""}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-400">Shift</label>
                                <Select
                                    value={newShift.shiftName}
                                    onValueChange={(value: ShiftName) => setNewShift((prev) => ({ ...prev, shiftName: value }))}
                                    disabled={submitting}
                                >
                                    <SelectTrigger className="bg-gray-800 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 text-white">
                                        {SHIFT_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-400">Date</label>
                                <Input
                                    type="date"
                                    value={newShift.date}
                                    onChange={(event) => setNewShift((prev) => ({ ...prev, date: event.target.value }))}
                                    className="bg-gray-800 text-white"
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-400">Notes</label>
                                <Textarea
                                    value={newShift.notes}
                                    onChange={(event) => setNewShift((prev) => ({ ...prev, notes: event.target.value }))}
                                    className="bg-gray-800 text-white"
                                    placeholder="Optional notes..."
                                    disabled={submitting}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateShift}
                                    disabled={submitting}
                                >
                                    {submitting ? "Saving..." : "Create Shift"}
                                </Button>
                            </div>
                        </div>

                        {selectedDay && (
                            <div className="mt-6 space-y-3">
                                <h3 className="text-sm font-semibold text-gray-100">Existing assignments</h3>
                                <div className="grid gap-3 md:grid-cols-3">
                                    {(["Morning", "Evening", "Night"] as ShiftName[]).map((shiftName) => {
                                        const slot = selectedDay.shifts[shiftName]
                                        const Icon = SHIFT_ICONS[shiftName]

                                        return (
                                            <div key={shiftName} className="flex max-h-96 flex-col rounded-md border border-gray-800 bg-gray-900/70 p-3 overflow-y-auto">
                                                <div className="flex items-center justify-between text-xs text-gray-400">
                                                    <span className="flex items-center gap-2 text-sm text-gray-200">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800">
                                                            <Icon className="h-4 w-4 text-white" />
                                                        </span>
                                                        {shiftName}
                                                    </span>
                                                    <span>
                                                        {slot.counts.total} / {slot.definition ? slot.definition.name : shiftName}
                                                    </span>
                                                </div>

                                                <div className="mt-3 grow space-y-2">
                                                    {slot.assignments.length === 0 ? (
                                                        <p className="text-xs text-gray-500">No one assigned.</p>
                                                    ) : (
                                                        slot.assignments.map((assignment) => {
                                                            const theme = resolveRoleTheme(assignment.employee.role)
                                                            return (
                                                                <div
                                                                    key={assignment.id}
                                                                    className={`flex items-center justify-between rounded border px-2 py-1 text-sm ${theme.bg} ${theme.border} ${theme.text}`}
                                                                >
                                                                    <span className="flex items-center gap-2">
                                                                        {assignment.employee.firstName} {assignment.employee.lastName}
                                                                        {assignment.employee.leadershipTitle && (
                                                                            <Badge variant="outline" className="border-orange-500 text-orange-400">
                                                                                {assignment.employee.leadershipTitle}
                                                                            </Badge>
                                                                        )}
                                                                    </span>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`text-xs ${assignment.status === "ON_DUTY"
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
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 text-red-400 hover:text-red-200"
                                                                        onClick={() => setAssignmentToDelete(assignment.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <AlertDialog open={assignmentToDelete !== null} onOpenChange={(open) => !open && setAssignmentToDelete(null)}>
                    <ConfirmDialogContent className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700">
                        <ConfirmDialogHeader>
                            <AlertDialogTitle className="text-white">Remove Assignment</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                                This will remove the employee from the selected shift. Are you sure you want to continue?
                            </AlertDialogDescription>
                        </ConfirmDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAssignment} disabled={deleting} className="bg-red-600 hover:bg-red-500">
                                {deleting ? "Removing..." : "Remove"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </ConfirmDialogContent>
                </AlertDialog>
            </div>
        </TooltipProvider>
    )
}

function SummaryStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{label}</span>
                {icon}
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
        </div>
    )
}

function renderWeekdayHeaders() {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return weekdays.map((day) => (
        <div key={day} className="hidden items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-2 text-sm text-gray-400 md:flex">
            {day}
        </div>
    ))
}

function renderLeadingEmptyCells(firstDayOfMonth: Date) {
    const weekday = getDay(firstDayOfMonth)
    return Array.from({ length: weekday }).map((_, index) => (
        <div key={`empty-${index}`} className="hidden h-40 rounded-lg border border-dashed border-gray-800 bg-gray-900 md:block" />
    ))
}