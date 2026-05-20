import { Users, Trophy, Image, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Players"
          icon={<Users className="w-8 h-8" />}
          href="/admin/players"
          color="blue"
        />
        <DashboardCard
          title="Tournaments"
          icon={<Trophy className="w-8 h-8" />}
          href="/admin/tournaments"
          color="green"
        />
        <DashboardCard
          title="Gallery"
          icon={<Image className="w-8 h-8" />}
          href="/admin/gallery"
          color="purple"
        />
        <DashboardCard
          title="Audit Log"
          icon={<Activity className="w-8 h-8" />}
          href="/admin/audit-log"
          color="orange"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/players/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-5 h-5 text-blue-600 mr-3" />
            <span className="font-medium text-gray-900">Add New Player</span>
          </Link>
          <Link
            href="/admin/tournaments/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Trophy className="w-5 h-5 text-green-600 mr-3" />
            <span className="font-medium text-gray-900">Create Tournament</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  icon,
  href,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  href: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    green: "bg-green-50 text-green-600 hover:bg-green-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
  };

  return (
    <Link
      href={href}
      className={`${colorClasses[color]} rounded-lg p-6 transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm opacity-75">Manage {title.toLowerCase()}</p>
        </div>
        {icon}
      </div>
    </Link>
  );
}
