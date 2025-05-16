"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ImageIcon, CalendarIcon } from "lucide-react"

// 가상의 일정 데이터
const dummyEvents = [
  {
    id: 1,
    title: "프로젝트 회의",
    date: new Date(2023, 4, 15),
    type: "event",
    isPublic: true,
  },
  {
    id: 2,
    title: "블로그 글 작성",
    date: new Date(2023, 4, 15),
    type: "task",
    isPublic: false,
  },
  {
    id: 3,
    title: "여행 계획",
    date: new Date(2023, 4, 20),
    type: "event",
    isPublic: true,
  },
]

// 가상의 게시물 데이터
const dummyPosts = [
  {
    id: 1,
    title: "Next.js 14 업데이트 내용 정리",
    date: new Date(2023, 4, 15),
    type: "post",
  },
  {
    id: 2,
    title: "개인 블로그 개발 일지 #1",
    date: new Date(2023, 4, 10),
    type: "post",
  },
]

// 가상의 파일 데이터
const dummyFiles = [
  {
    id: 1,
    name: "프로젝트 계획서.docx",
    date: new Date(2023, 4, 15),
    type: "document",
  },
  {
    id: 2,
    name: "여행 사진.jpg",
    date: new Date(2023, 4, 20),
    type: "image",
  },
]

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // 선택한 날짜의 이벤트, 게시물, 파일 필터링
  const filteredEvents = dummyEvents.filter(
    (event) => selectedDate && event.date.toDateString() === selectedDate.toDateString(),
  )

  const filteredPosts = dummyPosts.filter(
    (post) => selectedDate && post.date.toDateString() === selectedDate.toDateString(),
  )

  const filteredFiles = dummyFiles.filter(
    (file) => selectedDate && file.date.toDateString() === selectedDate.toDateString(),
  )

  // 달력에 표시할 날짜별 아이템 수
  const getDayContent = (day: Date) => {
    const eventsCount = dummyEvents.filter((event) => event.date.toDateString() === day.toDateString()).length

    const postsCount = dummyPosts.filter((post) => post.date.toDateString() === day.toDateString()).length

    const filesCount = dummyFiles.filter((file) => file.date.toDateString() === day.toDateString()).length

    const total = eventsCount + postsCount + filesCount

    if (total === 0) return null

    return (
      <div className="w-full flex justify-center">
        <Badge variant="outline" className="h-1.5 w-1.5 rounded-full bg-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 lg:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>달력</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ko}
              showOutsideDays
              fixedWeeks
              components={{
                DayContent: ({ date }: { date: Date }) => (
                  <div className="flex flex-col items-center justify-center">
                    <div>{format(date, "d")}</div>
                    {getDayContent(date)}
                  </div>
                ),
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="col-span-1 md:col-span-3 lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{selectedDate ? format(selectedDate, "PPP", { locale: ko }) : "선택한 날짜"}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvents.length === 0 && filteredPosts.length === 0 && filteredFiles.length === 0 ? (
              <p className="text-muted-foreground">이 날짜에 등록된 항목이 없습니다.</p>
            ) : (
              <div className="space-y-6">
                {filteredEvents.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">일정</h3>
                    <ul className="space-y-2">
                      {filteredEvents.map((event) => (
                        <li key={event.id} className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{event.title}</span>
                          <Badge variant={event.isPublic ? "default" : "outline"} className="ml-auto">
                            {event.isPublic ? "공개" : "비공개"}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {filteredPosts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">게시물</h3>
                    <ul className="space-y-2">
                      {filteredPosts.map((post) => (
                        <li key={post.id} className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4" />
                          <span>{post.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {filteredFiles.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">파일</h3>
                    <ul className="space-y-2">
                      {filteredFiles.map((file) => (
                        <li key={file.id} className="flex items-center gap-2 text-sm">
                          {file.type === "image" ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                          <span>{file.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
