import { ContributionGraph } from "@/components/contribution-graph"

export default function ActivityPage() {
  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">활동</h1>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">활동 기록</h2>
          <ContributionGraph />
        </div>
      </div>
    </div>
  )
}
