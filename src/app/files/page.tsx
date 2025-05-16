import { FileExplorer } from "@/components/file-explorer"

export default function FilesPage() {
  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">파일</h1>
        </div>
        <FileExplorer />
      </div>
    </div>
  )
}
