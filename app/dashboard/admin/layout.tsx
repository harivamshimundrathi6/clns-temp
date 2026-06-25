import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-950">
            <AdminSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto bg-slate-950">
                    {children}
                </main>
            </div>
        </div>
    );
}
