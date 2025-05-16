"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { User, Mail, Shield, UserPlus, Trash, MoreHorizontal, Upload } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 가상의 관리자 데이터
const dummyAdmins = [
  {
    id: 1,
    name: "관리자",
    email: "admin@example.com",
    role: "소유자",
    avatar: "/abstract-geometric-shapes.png",
  },
  {
    id: 2,
    name: "부관리자",
    email: "subadmin@example.com",
    role: "관리자",
    avatar: null,
  },
]

export default function SettingsPage() {
  const [admins, setAdmins] = useState(dummyAdmins)
  const [newAdminEmail, setNewAdminEmail] = useState("")

  const addAdmin = () => {
    if (newAdminEmail) {
      const newAdmin = {
        id: admins.length + 1,
        name: "새 관리자",
        email: newAdminEmail,
        role: "관리자",
        avatar: null,
      }
      setAdmins([...admins, newAdmin])
      setNewAdminEmail("")
    }
  }

  const removeAdmin = (id: number) => {
    setAdmins(admins.filter((admin) => admin.id !== id))
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">설정</h1>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">프로필</TabsTrigger>
          <TabsTrigger value="admins">관리자</TabsTrigger>
          <TabsTrigger value="blog">블로그 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>프로필</CardTitle>
              <CardDescription>개인 정보를 관리하고 프로필을 업데이트하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/abstract-geometric-shapes.png" alt="프로필 이미지" />
                  <AvatarFallback>사용자</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    이미지 변경
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG 또는 GIF. 최대 2MB.</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">이름</Label>
                <Input id="name" defaultValue="관리자" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" defaultValue="admin@example.com" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">소개</Label>
                <Input id="bio" defaultValue="개인 블로그 운영자입니다." />
              </div>
            </CardContent>
            <CardFooter>
              <Button>저장</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>관리자 관리</CardTitle>
              <CardDescription>블로그 관리자를 추가하거나 제거합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="관리자 이메일 입력"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                </div>
                <Button onClick={addAdmin} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  관리자 추가
                </Button>
              </div>

              <div className="space-y-2">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={admin.avatar || "/placeholder.svg"} alt={admin.name} />
                        <AvatarFallback>{admin.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{admin.name}</div>
                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={admin.role === "소유자" ? "default" : "outline"}>
                        {admin.role === "소유자" ? (
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {admin.role}
                          </div>
                        ) : (
                          admin.role
                        )}
                      </Badge>

                      {admin.role !== "소유자" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              프로필 보기
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              이메일 보내기
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => removeAdmin(admin.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              관리자 제거
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>블로그 설정</CardTitle>
              <CardDescription>블로그의 기본 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="blog-name">블로그 이름</Label>
                <Input id="blog-name" defaultValue="내 개인 블로그" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="blog-description">블로그 설명</Label>
                <Input id="blog-description" defaultValue="개인 기록과 생각을 공유하는 공간입니다." />
              </div>

              <div className="flex items-center gap-2">
                <Switch id="comments-enabled" defaultChecked />
                <Label htmlFor="comments-enabled">댓글 허용</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch id="public-profile" defaultChecked />
                <Label htmlFor="public-profile">공개 프로필</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch id="show-contribution" defaultChecked />
                <Label htmlFor="show-contribution">활동 그래프 공개</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button>저장</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
