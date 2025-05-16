import { CalendarView } from "@/components/calendar-view"

export default function CalendarPage() {
  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">달력</h1>
        </div>
        <CalendarView />
      </div>
    </div>
  )
}
