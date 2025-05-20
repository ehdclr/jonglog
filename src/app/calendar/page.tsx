"use client"

import { useState } from "react"
import { CalendarView } from "@/components/calendar-view"
import { ContributionGraph } from "@/components/contribution-graph"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, List, Search, Filter, Download, Share2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export default function CalendarPage() {
  const [view, setView] = useState<"calendar" | "list">("calendar")
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex flex-col space-y-8">
        {/* 헤더 섹션 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">일정 관리</h1>
            <p className="text-muted-foreground mt-1">일정을 관리하고 활동 기록을 확인하세요.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="일정 검색..." className="w-full md:w-[200px] pl-8" />
            </div>

            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 카테고리</SelectItem>
                <SelectItem value="work">업무</SelectItem>
                <SelectItem value="personal">개인</SelectItem>
                <SelectItem value="family">가족</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 달력 컨트롤 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="w-[150px] text-center font-medium">
                {months[currentMonth]} {currentYear}
              </div>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentMonth(new Date().getMonth())
                setCurrentYear(new Date().getFullYear())
              }}
            >
              오늘
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Download className="mr-2 h-4 w-4" />
              내보내기
            </Button>
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Share2 className="mr-2 h-4 w-4" />
              공유
            </Button>
            <div className="bg-muted p-1 rounded-md">
              <Button
                variant={view === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("calendar")}
                className="px-3"
              >
                <Calendar className="mr-2 h-4 w-4" />
                달력
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                className="px-3"
              >
                <List className="mr-2 h-4 w-4" />
                목록
              </Button>
            </div>
          </div>
        </div>

        {/* 달력 뷰 */}
        <Card>
          <CardContent className="p-6">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {view === "calendar" ? (
                <CalendarView />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">이번 달 일정</h3>
                    <Badge variant="outline">
                      {months[currentMonth]} {currentYear}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {/* 예시 일정 목록 */}
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-14 text-center">
                          <div className="text-sm font-medium">{i + 10}</div>
                          <div className="text-xs text-muted-foreground">{months[currentMonth]}</div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="font-medium">일정 제목 {i}</div>
                          <div className="text-sm text-muted-foreground">오전 10:00 - 오후 12:00</div>
                        </div>
                        <Badge
                          className="ml-2"
                          variant={i % 3 === 0 ? "default" : i % 3 === 1 ? "secondary" : "outline"}
                        >
                          {i % 3 === 0 ? "업무" : i % 3 === 1 ? "개인" : "가족"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>

        <Separator className="my-2" />

        {/* 활동 기록 */}
        <Tabs defaultValue="contribution" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">활동 기록</h2>
            <TabsList>
              <TabsTrigger value="contribution">기여도</TabsTrigger>
              <TabsTrigger value="statistics">통계</TabsTrigger>
            </TabsList>
          </div>

          <Card>
            <TabsContent value="contribution" className="mt-0">
              <CardContent className="p-6">
                <ContributionGraph />
                <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                  <div>적음</div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className="w-4 h-4 rounded-sm"
                        style={{
                          backgroundColor: `rgba(var(--primary), ${level * 0.2})`,
                        }}
                      />
                    ))}
                  </div>
                  <div>많음</div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="statistics" className="mt-0">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">총 일정</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">248</div>
                      <p className="text-xs text-muted-foreground">전월 대비 +12%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">완료된 일정</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">186</div>
                      <p className="text-xs text-muted-foreground">완료율 75%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">가장 바쁜 요일</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">수요일</div>
                      <p className="text-xs text-muted-foreground">평균 4.2개 일정</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </div>
  )
}
