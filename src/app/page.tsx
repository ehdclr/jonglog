import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { ContributionGraph } from "@/components/contribution-graph"
import { PostsList } from "@/components/posts-list"
import { FileExplorer } from "@/components/file-explorer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">내 블로그</h1>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />새 게시물
            </Button>
          </div>

          <Tabs defaultValue="posts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="posts">게시물</TabsTrigger>
              <TabsTrigger value="files">파일</TabsTrigger>
              <TabsTrigger value="calendar">달력</TabsTrigger>
              <TabsTrigger value="activity">활동</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              <PostsList />
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <FileExplorer />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-7 lg:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-5 lg:col-span-2">
                  <CalendarDateRangePicker />
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-1 border rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4">선택한 날짜의 활동</h2>
                  <div className="text-muted-foreground">
                    날짜를 선택하면 해당 날짜의 게시물과 파일이 여기에 표시됩니다.
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">활동 기록</h2>
                <ContributionGraph />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
