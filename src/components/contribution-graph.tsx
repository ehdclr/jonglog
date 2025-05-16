"use client"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// 가상의 기여 데이터 생성 (실제로는 DB에서 가져와야 함)
const generateContributionData = () => {
  const data = []
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1)

  const currentDate = new Date(startDate)

  while (currentDate <= now) {
    const count = Math.floor(Math.random() * 5) // 0-4 사이의 랜덤 기여 수
    data.push({
      date: new Date(currentDate),
      count,
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return data
}

export function ContributionGraph() {
  const [contributionData] = useState(generateContributionData())

  // 날짜별로 그룹화
  const weeks: { date: Date; count: number }[][] = []
  let currentWeek: { date: Date; count: number }[] = []

  const startDate = new Date(contributionData[0].date)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const currentDate = new Date(startDate)

  contributionData.forEach((day) => {
    while (currentDate < day.date) {
      currentWeek.push({ date: new Date(currentDate), count: 0 })

      currentDate.setDate(currentDate.getDate() + 1)

      if (currentDate.getDay() === 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    currentWeek.push(day)
    currentDate.setDate(currentDate.getDate() + 1)

    if (currentDate.getDay() === 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  // 기여도에 따른 색상 결정
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800"
    if (count === 1) return "bg-gray-300 dark:bg-gray-600"
    if (count === 2) return "bg-gray-400 dark:bg-gray-500"
    if (count === 3) return "bg-gray-500 dark:bg-gray-400"
    return "bg-gray-700 dark:bg-gray-200"
  }

  // 날짜 포맷
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date)
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="flex mb-2 text-xs text-muted-foreground">
          <div className="w-8"></div>
          <div className="flex-1 grid grid-cols-12 gap-1">
            {Array.from({ length: 12 }).map((_, i) => {
              const date = new Date()
              date.setMonth(date.getMonth() - 11 + i)
              return (
                <div key={i} className="col-span-1 text-center">
                  {date.toLocaleDateString("ko-KR", { month: "short" })}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex">
          <div className="w-8 flex flex-col justify-around text-xs text-muted-foreground">
            <div>일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div>토</div>
          </div>

          <div className="flex-1 grid grid-cols-53 gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="col-span-1 flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <TooltipProvider key={dayIndex}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`w-3 h-3 rounded-sm ${getColorClass(day.count)}`}></div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <div>{formatDate(day.date)}</div>
                          <div>{day.count}개의 기여</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end mt-4 gap-2">
          <div className="text-xs text-muted-foreground">기여도:</div>
          <div className="flex gap-1">
            <div className={`w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800`}></div>
            <div className={`w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-600`}></div>
            <div className={`w-3 h-3 rounded-sm bg-gray-400 dark:bg-gray-500`}></div>
            <div className={`w-3 h-3 rounded-sm bg-gray-500 dark:bg-gray-400`}></div>
            <div className={`w-3 h-3 rounded-sm bg-gray-700 dark:bg-gray-200`}></div>
          </div>
          <div className="text-xs text-muted-foreground">많음</div>
        </div>
      </div>
    </div>
  )
}
