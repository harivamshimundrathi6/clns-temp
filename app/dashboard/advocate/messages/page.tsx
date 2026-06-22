import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MessageCenter } from "@/components/chat/message-center";

export const metadata = {
    title: "Messages | CLNS Advocate",
    description: "Chat with your clients and student mentees",
};

export default async function AdvocateMessagesPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADVOCATE") {
        redirect("/login");
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Messages</h2>
                    <p className="text-slate-400">Communicate directly with your assigned clients and students.</p>
                </div>
            </div>
            
            <MessageCenter role="ADVOCATE" myId={session.user.id!} />
        </div>
    );
}
