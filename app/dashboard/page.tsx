import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const role = (session.user as any).role?.toLowerCase();
    const developerEmail = process.env.DEVELOPER_EMAIL;
    if (developerEmail && session.user.email === developerEmail) {
        redirect("/dashboard/developer");
    }
    
    if (role === "admin") {
        redirect("/dashboard/admin");
    }

    const userStatus = (session.user as any).status?.toUpperCase();

    // Redirect pending/rejected advocates to pending-approval
    if (userStatus === "PENDING_VERIFICATION" || userStatus === "REJECTED") {
        redirect("/pending-approval");
    }

    if (!role) {
        redirect("/login"); // Fallback if no role
    }

    redirect(`/dashboard/${role}`);
}
