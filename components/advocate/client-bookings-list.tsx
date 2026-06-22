"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar, FileText, User, Mail, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateCaseStatus } from "@/app/actions/advocate";

interface ClientCase {
    id: string;
    title: string;
    description: string | null;
    type: string;
    status: string;
    createdAt: Date;
    client: {
        name: string | null;
        email: string;
    };
}

interface ClientBookingsListProps {
    cases: ClientCase[];
}

export function ClientBookingsList({ cases }: ClientBookingsListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<"OPEN" | "CLOSED" | null>(null);

    const handleStatusUpdate = async (caseId: string, status: "OPEN" | "CLOSED") => {
        setLoadingId(caseId);
        setActionType(status);
        try {
            const res = await updateCaseStatus(caseId, status);
            if (res.success) {
                toast.success(`Booking ${status === "OPEN" ? "accepted" : "rejected"} successfully`);
            } else {
                toast.error(res.error || "Failed to update booking status");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoadingId(null);
            setActionType(null);
        }
    };
    if (!cases || cases.length === 0) {
        return (
            <div className="p-8 text-center border border-white/10 rounded-xl bg-white/5">
                <p className="text-slate-400">No client bookings or consultations found.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((booking, index) => (
                <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 hover:border-emerald-500/30 transition-all"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-semibold text-white text-lg">{booking.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded border ${booking.status === "OPEN"
                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                                        : "bg-slate-500/20 text-slate-400 border-slate-500/20"
                                    }`}>
                                    {booking.status}
                                </span>
                                <span className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/20 px-2 py-0.5 rounded border">
                                    {booking.type}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 flex-1 mb-5">
                        <div className="flex items-start gap-2 text-sm">
                            <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white">{booking.client.name || "Unknown Client"}</p>
                                <p className="text-slate-400 text-xs mt-0.5">{booking.client.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-slate-300">
                                {format(new Date(booking.createdAt), "MMM d, yyyy")}
                            </p>
                        </div>

                        {booking.description && (
                            <div className="flex items-start gap-2 text-sm mt-3 pt-3 border-t border-white/10">
                                <FileText className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                <p className="text-slate-300 line-clamp-3 leading-relaxed">
                                    {booking.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {booking.status === "PENDING" ? (
                        <div className="flex items-center gap-2 mt-auto pt-4">
                            <Button
                                disabled={loadingId === booking.id}
                                variant="outline"
                                className="flex-1 border-white/10 text-white hover:bg-white/10 hover:text-white"
                                onClick={() => handleStatusUpdate(booking.id, "CLOSED")}
                            >
                                {loadingId === booking.id && actionType === "CLOSED" ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4 mr-2 text-rose-400" />
                                )}
                                Reject
                            </Button>
                            <Button
                                disabled={loadingId === booking.id}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                                onClick={() => handleStatusUpdate(booking.id, "OPEN")}
                            >
                                {loadingId === booking.id && actionType === "OPEN" ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                )}
                                Accept
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mt-auto pt-4">
                            <Button
                                className="w-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-2"
                                onClick={() => window.location.href = `mailto:${booking.client.email}?subject=Regarding your consultation request: ${encodeURIComponent(booking.title)}`}
                            >
                                <Mail className="h-4 w-4" />
                                Contact Client
                            </Button>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
