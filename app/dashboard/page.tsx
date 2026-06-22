import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const developerEmail = process.env.DEVELOPER_EMAIL;
    if (developerEmail && session.user.email === developerEmail) {
        redirect("/dashboard/developer");
    }

    const role = (session.user as any).role?.toLowerCase();

    if (!role) {
        redirect("/login"); // Fallback if no role
    }

    redirect(`/dashboard/${role}`);
}
