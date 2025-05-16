"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, EyeOff, FileText, ImageIcon, MoreHorizontal, File, Download, Trash, Upload } from "lucide-react"

// 가상의 파일 데이터
const dummyFiles = [
  {
    id: 1,
    name: "프로젝트 계획서.docx",
    type: "document",
    size: "245 KB",
    date: "2023-05-15",
    isPublic: true,
  },
  {
    id: 2,
    name: "여행 사진.jpg",
    type: "image",
    size: "1.2 MB",
    date: "2023-05-10",
    isPublic: true,
  },
  {
    id: 3,
    name: "개발 일정.xlsx",
    type: "spreadsheet",
    size: "156 KB",
    date: "2023-05-08",
    isPublic: false,
  },
  {
    id: 4,
    name: "발표자료.pdf",
    type: "pdf",
    size: "3.4 MB",
    date: "2023-05-01",
    isPublic: false,
  },
]

export function FileExplorer() {
  const [files, setFiles] = useState(dummyFiles)
  const [filter, setFilter] = useState("all") // all, public, private

  const filteredFiles = files.filter((file) => {
    if (filter === "all") return true
    if (filter === "public") return file.isPublic
    if (filter === "private") return !file.isPublic
    return true
  })

  const toggleVisibility = (id: number) => {
    setFiles(files.map((file) => (file.id === id ? { ...file, isPublic: !file.isPublic } : file)))
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            전체
          </Button>
          <Button variant={filter === "public" ? "default" : "outline"} size="sm" onClick={() => setFilter("public")}>
            공개
          </Button>
          <Button variant={filter === "private" ? "default" : "outline"} size="sm" onClick={() => setFilter("private")}>
            비공개
          </Button>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              파일 업로드
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>파일 업로드</DialogTitle>
              <DialogDescription>업로드할 파일을 선택하고 공개 여부를 설정하세요.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">파일</Label>
                <Input id="file" type="file" />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="visibility">공개 여부</Label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="visibility" className="h-4 w-4 rounded border-gray-300" />
                  <Label htmlFor="visibility" className="text-sm font-normal">
                    공개
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">업로드</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>크기</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.type)}
                    {file.name}
                  </div>
                </TableCell>
                <TableCell>{file.size}</TableCell>
                <TableCell>{file.date}</TableCell>
                <TableCell>
                  <Badge variant={file.isPublic ? "default" : "outline"}>{file.isPublic ? "공개" : "비공개"}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        다운로드
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleVisibility(file.id)}>
                        {file.isPublic ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            비공개로 전환
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            공개로 전환
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
