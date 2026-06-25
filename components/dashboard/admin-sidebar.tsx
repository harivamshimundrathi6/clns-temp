"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, ShieldAlert, FileText, Search, MessageSquare, CreditCard, LogOut } from "lucide-react";

const sidebarItems = [
    { name: "Overview", url: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Advocate Requests", url: "/dashboard/developer/advocates", icon: Users },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950">
            <div className="flex h-14 items-center border-b border-slate-800 px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-white">
                    <ShieldAlert className="h-5 w-5 text-emerald-500" />
                    <span>CLNS Admin</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-4">
                    {sidebarItems.map((item, index) => {
                        const isActive = item.url === "/dashboard/admin"
                            ? pathname === item.url
                            : pathname?.startsWith(item.url);
                            
                        return (
                            <Link key={index} href={item.url}>
                                <span
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white",
                                        isActive ? "bg-slate-800 text-white" : "text-slate-400"
                                    )}
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.name}</span>
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t border-slate-800 p-4">
                <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-rose-400 hover:bg-rose-500/10" asChild>
                    <Link href="/login">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Link>
                </Button>
            </div>
        </div>
    );
}
