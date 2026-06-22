import Link from "next/link";
import { Users, Code, Activity, ShieldAlert, Briefcase, Wrench, PhoneCall } from "lucide-react";

export default function DeveloperDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
        <p className="text-gray-500 mt-2">Super-admin controls. Do not share access to this area.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Affiliations CMS</h3>
          <p className="text-gray-500 text-sm mb-4">Manage partners and affiliations shown on the marketing site.</p>
          <Link href="/dashboard/developer/affiliations" className="text-blue-600 font-medium hover:underline">Manage Affiliations &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Services CMS</h3>
          <p className="text-gray-500 text-sm mb-4">Manage the list of services offered on the platform.</p>
          <Link href="/dashboard/developer/services" className="text-green-600 font-medium hover:underline">Manage Services &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Careers CMS</h3>
          <p className="text-gray-500 text-sm mb-4">Manage open job postings and career opportunities.</p>
          <Link href="/dashboard/developer/careers" className="text-orange-600 font-medium hover:underline">Manage Careers &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Contact Info CMS</h3>
          <p className="text-gray-500 text-sm mb-4">Manage contact points and office locations.</p>
          <Link href="/dashboard/developer/contact" className="text-red-600 font-medium hover:underline">Manage Contacts &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm opacity-50">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">System Logs</h3>
          <p className="text-gray-500 text-sm mb-4">Coming soon. View raw server logs and error traces.</p>
          <span className="text-gray-400 font-medium">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
