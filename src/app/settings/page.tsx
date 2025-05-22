"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Shield,
  UserPlus,
  Trash,
  MoreHorizontal,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
import { User as UserType } from "@/types/auth";
import { api } from "@/utils/api";
import { debounce } from "lodash";

export default function SettingsPage() {
  const [userList, setUserList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, accessToken } = useAuthStore();
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchUserList = async () => {
      const response = await api.post("/api/admin/users", {
        headers: {
          Authorization: `${accessToken}`,
        },
        withCredentials: true,
      });
      const data = await response.data;
      setUserList(data.users);
      setAllUsers(data.users); // 전체 목록 저장
    };
    fetchUserList();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;
    
    return allUsers.filter(
      (user: UserType) =>
        user.name.includes(searchQuery) || 
        user.email.includes(searchQuery)
    );
  }, [allUsers, searchQuery]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 100),
    []
  );

  const removeAdmin = (id: string) => {
    setUserList(userList.filter((user: UserType) => user.id !== id));
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">설정</h1>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">프로필</TabsTrigger>
          {user?.role === "owner" && (
            <TabsTrigger value="admins">사용자 관리</TabsTrigger>
          )}
          {user?.role === "owner" && (
            <TabsTrigger value="blog">블로그 설정</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>프로필</CardTitle>
              <CardDescription>
                개인 정보를 관리하고 프로필을 업데이트하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src="/abstract-geometric-shapes.png"
                    alt="프로필 이미지"
                  />
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    이미지 변경
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG 또는 GIF. 최대 2MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">이름</Label>
                <Input id="name" defaultValue={user?.name} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" defaultValue={user?.email} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">소개</Label>
                <Input id="bio" defaultValue={user?.bio} />
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
              <CardDescription>
                블로그 관리자를 추가하거나 제거합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="사용자 검색(이메일 혹은 이름 입력)"
                    onChange={(e) => debouncedSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {filteredUsers.map((user: UserType) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.avatarUrl || "/placeholder.svg"}
                          alt={user.name}
                        />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={user.role === "owner" ? "default" : "outline"}
                      >
                        {user.role === "owner" ? (
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {user.role}
                          </div>
                        ) : (
                          user.role
                        )}
                      </Badge>

                      {user.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              프로필 보기
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => removeAdmin(user.id)}
                            >
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
              <CardDescription>
                블로그의 기본 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="blog-name">블로그 이름</Label>
                <Input id="blog-name" defaultValue="내 개인 블로그" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="blog-description">블로그 설명</Label>
                <Input
                  id="blog-description"
                  defaultValue="개인 기록과 생각을 공유하는 공간입니다."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="blog-url">깃허브 주소 공개</Label>
                <Input
                  id="blog-url"
                  defaultValue={`https://github.com/${user?.name}`}
                />
                <Switch id="blog-description" defaultChecked />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="blog-url">이메일 주소 공개</Label>
                <Input id="blog-url" defaultValue={`${user?.email}`} />
                <Switch id="blog-description" defaultChecked />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="blog-url">SNS 주소 공개</Label>
                <Input
                  id="blog-url"
                  defaultValue={`https://x.com/${user?.name}`}
                />
                <Switch id="blog-description" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>저장</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
