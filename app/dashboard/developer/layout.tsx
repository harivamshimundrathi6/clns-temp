import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, ShieldAlert, LogOut } from "lucide-react";

export default function DeveloperLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Dev Mode
          </h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard/developer" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </Link>
          <Link href="/dashboard/developer/affiliations" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 text-white transition">
            <Users className="w-5 h-5" />
            Affiliations
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition">
            <LogOut className="w-5 h-5" />
            Exit Dev Mode
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
