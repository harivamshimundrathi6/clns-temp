import { fetchPlatformUsers, fetchConsultationRequests } from "@/app/actions/admin";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export const metadata = {
    title: "Admin Dashboard | CLNS",
    description: "Manage clients and advocates across the CLNS platform",
};

export default async function AdminDashboardPage() {
    const session = await auth();

    // Verify admin role strictly
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/login");
    }

    const [usersResult, consultationsResult] = await Promise.all([
        fetchPlatformUsers(),
        fetchConsultationRequests()
    ]);
    
    if (!usersResult.success) {
        return (
            <div className="flex-1 p-8 text-center mt-20">
                <p className="text-slate-400 text-lg">Failed to load admin dashboard.</p>
                <p className="text-slate-500 text-sm mt-2">{usersResult.error}</p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-emerald-500" />
                        Admin Dashboard
                    </h2>
                    <p className="text-slate-400 mt-2">
                        Monitor and manage all clients and advocates on the CLNS network.
                    </p>
                </div>
            </div>

            <AdminDashboard 
                users={usersResult.data || []} 
                consultations={consultationsResult.success ? consultationsResult.data : []} 
            />
        </div>
    );
}
