"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { ko } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"

export function CalendarDateRangePicker({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-col space-y-4">
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={date?.from}
            onSelect={(day) => setDate({ from: day, to: day })}
            className="rounded-md border"
            locale={ko}
            showOutsideDays
            fixedWeeks
          />
        </div>
        <div className="rounded-md border p-4">
          <h3 className="font-medium mb-2">
            선택한 날짜: {date?.from ? format(date.from, "PPP", { locale: ko }) : "날짜를 선택하세요"}
          </h3>
          <p className="text-sm text-muted-foreground">이 날짜에 작성한 게시물과 파일이 오른쪽에 표시됩니다.</p>
        </div>
      </div>
    </div>
  )
}
