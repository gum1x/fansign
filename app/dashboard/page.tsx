import { UserDashboard } from "@/components/user-dashboard"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-6xl mx-auto pt-8 pb-16">
        <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
          User Dashboard
        </h1>

        <UserDashboard />
      </div>
    </div>
  )
}
