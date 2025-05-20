"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, ChevronLeft, Clock, Loader2, MailCheck, Search, Shield, UserPlus, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"

// 가입 요청 타입 정의
interface JoinRequest {
  id: string
  name: string
  email: string
  message?: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt?: string
}

// 임시 데이터
const MOCK_REQUESTS: JoinRequest[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `req-${i + 1}`,
  name: `사용자 ${i + 1}`,
  email: `user${i + 1}@example.com`,
  message: i % 3 === 0 ? undefined : `안녕하세요, 블로그에 가입하고 싶습니다. ${i + 1}`,
  status: i % 3 === 0 ? "approved" : i % 3 === 1 ? "rejected" : "pending",
  createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  updatedAt: i % 3 !== 2 ? new Date(Date.now() - i * 86400000).toISOString() : undefined,
}))

export default function JoinRequestsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  // 데이터 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setRequests(MOCK_REQUESTS)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // 필터링된 요청 목록
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.message && request.message.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && request.status === "pending") ||
      (activeTab === "approved" && request.status === "approved") ||
      (activeTab === "rejected" && request.status === "rejected")

    return matchesSearch && matchesTab
  })

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // 요청 승인 처리
  const handleApprove = async () => {
    if (!selectedRequest) return

    setProcessingId(selectedRequest.id)

    try {
      // 실제 구현에서는 API 호출로 대체
      // const response = await fetch(`/api/join-requests/${selectedRequest.id}/approve`, {
      //   method: "POST",
      // })

      // 임시 구현: API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // if (!response.ok) throw new Error("요청 처리 중 오류가 발생했습니다.")

      // 상태 업데이트
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id ? { ...req, status: "approved", updatedAt: new Date().toISOString() } : req,
        ),
      )

      toast({
        title: "승인 완료",
        description: `${selectedRequest.name}님의 가입 요청이 승인되었습니다. 이메일이 발송되었습니다.`,
      })
    } catch (error) {
      console.error("승인 처리 오류:", error)
      toast({
        title: "승인 실패",
        description: "요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
      setSelectedRequest(null)
      setIsApproveDialogOpen(false)
    }
  }

  // 요청 거절 처리
  const handleReject = async () => {
    if (!selectedRequest) return

    setProcessingId(selectedRequest.id)

    try {
      // 실제 구현에서는 API 호출로 대체
      // const response = await fetch(`/api/join-requests/${selectedRequest.id}/reject`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ reason: rejectReason }),
      // })

      // 임시 구현: API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // if (!response.ok) throw new Error("요청 처리 중 오류가 발생했습니다.")

      // 상태 업데이트
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id ? { ...req, status: "rejected", updatedAt: new Date().toISOString() } : req,
        ),
      )

      toast({
        title: "거절 완료",
        description: `${selectedRequest.name}님의 가입 요청이 거절되었습니다.`,
      })
    } catch (error) {
      console.error("거절 처리 오류:", error)
      toast({
        title: "거절 실패",
        description: "요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
      setSelectedRequest(null)
      setRejectReason("")
      setIsRejectDialogOpen(false)
    }
  }

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex flex-col space-y-8">
        {/* 헤더 섹션 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <div onClick={() => router.push("/admin")} className="flex items-center gap-2 cursor-pointer">
                  <ChevronLeft className="h-4 w-4" />
                  관리자 대시보드
                </div>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-6 w-6" />
              가입 요청 관리
            </h1>
            <p className="text-muted-foreground mt-1">블로그 가입 요청을 검토하고 승인 또는 거절할 수 있습니다.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="이름 또는 이메일로 검색..."
              className="pl-8 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 탭 및 요청 목록 */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-2">
                전체
                <Badge variant="secondary" className="ml-1">
                  {requests.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                대기 중
                <Badge variant="secondary" className="ml-1">
                  {requests.filter((r) => r.status === "pending").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                승인됨
                <Badge variant="secondary" className="ml-1">
                  {requests.filter((r) => r.status === "approved").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                거절됨
                <Badge variant="secondary" className="ml-1">
                  {requests.filter((r) => r.status === "rejected").length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-6">
            {renderRequestList(filteredRequests)}
          </TabsContent>
          <TabsContent value="pending" className="mt-6">
            {renderRequestList(filteredRequests)}
          </TabsContent>
          <TabsContent value="approved" className="mt-6">
            {renderRequestList(filteredRequests)}
          </TabsContent>
          <TabsContent value="rejected" className="mt-6">
            {renderRequestList(filteredRequests)}
          </TabsContent>
        </Tabs>
      </div>

      {/* 승인 확인 다이얼로그 */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>가입 요청 승인</DialogTitle>
            <DialogDescription>
              이 가입 요청을 승인하시겠습니까? 승인 시 사용자에게 추가 정보 입력을 위한 이메일이 발송됩니다.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">이름:</span>
                  <span>{selectedRequest.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">이메일:</span>
                  <span>{selectedRequest.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">요청일:</span>
                  <span>{formatDate(selectedRequest.createdAt)}</span>
                </div>
                {selectedRequest.message && (
                  <div className="pt-2">
                    <span className="text-sm font-medium">메시지:</span>
                    <p className="mt-1 text-sm p-3 bg-muted rounded-md">{selectedRequest.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleApprove} disabled={processingId === selectedRequest?.id}>
              {processingId === selectedRequest?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <MailCheck className="mr-2 h-4 w-4" />
                  승인 및 이메일 발송
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 거절 확인 다이얼로그 */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>가입 요청 거절</DialogTitle>
            <DialogDescription>
              이 가입 요청을 거절하시겠습니까? 필요한 경우 거절 사유를 입력할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">이름:</span>
                  <span>{selectedRequest.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">이메일:</span>
                  <span>{selectedRequest.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reject-reason">거절 사유 (선택사항)</Label>
                <Textarea
                  id="reject-reason"
                  placeholder="거절 사유를 입력하세요..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processingId === selectedRequest?.id}>
              {processingId === selectedRequest?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  요청 거절
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // 요청 목록 렌더링 함수
  function renderRequestList(requests: JoinRequest[]) {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (requests.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <UserPlus className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">가입 요청이 없습니다</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            {searchQuery
              ? "검색 조건에 맞는 가입 요청이 없습니다. 다른 검색어를 시도해보세요."
              : activeTab !== "all"
                ? `${
                    activeTab === "pending" ? "대기 중인" : activeTab === "approved" ? "승인된" : "거절된"
                  } 가입 요청이 없습니다.`
                : "아직 가입 요청이 없습니다. 사용자들이 가입 요청을 하면 여기에 표시됩니다."}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {requests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={request.status === "pending" ? "border-primary" : ""}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{request.name}</h3>
                      <Badge
                        variant={
                          request.status === "pending"
                            ? "outline"
                            : request.status === "approved"
                              ? "default"
                              : "destructive"
                        }
                        className="ml-2"
                      >
                        {request.status === "pending" ? (
                          <Clock className="mr-1 h-3 w-3" />
                        ) : request.status === "approved" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {request.status === "pending" ? "대기 중" : request.status === "approved" ? "승인됨" : "거절됨"}
                      </Badge>
                    </div>
                    <p className="text-sm">{request.email}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>요청일: {formatDate(request.createdAt)}</span>
                      {request.updatedAt && <span className="ml-4">처리일: {formatDate(request.updatedAt)}</span>}
                    </div>
                    {request.message && (
                      <div className="mt-2 text-sm">
                        <p className="font-medium mb-1">메시지:</p>
                        <p className="p-2 bg-muted rounded-md">{request.message}</p>
                      </div>
                    )}
                  </div>
                  {request.status === "pending" && (
                    <div className="flex gap-2 md:self-start">
                      <Button
                        variant="outline"
                        className="flex-1 md:flex-none"
                        onClick={() => {
                          setSelectedRequest(request)
                          setIsApproveDialogOpen(true)
                        }}
                        disabled={processingId === request.id}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        승인
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 md:flex-none text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedRequest(request)
                          setIsRejectDialogOpen(true)
                        }}
                        disabled={processingId === request.id}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        거절
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }
}
