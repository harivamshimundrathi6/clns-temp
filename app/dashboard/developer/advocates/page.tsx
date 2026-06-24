"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Shield, CheckCircle2, XCircle, Clock, User, Scale, 
    Mail, ChevronDown, ChevronUp, Loader2, AlertTriangle,
    BadgeCheck
} from "lucide-react";

interface VerificationRequest {
    id: string;
    userId: string;
    status: string;
    barId?: string;
    advocateName?: string;
    advocateEmail?: string;
    reviewedBy?: string;
    reviewNote?: string;
    createdAt?: string;
    updatedAt?: string;
    user?: {
        id: string;
        name?: string;
        email?: string;
        barId?: string;
        status?: string;
        createdAt?: string;
    };
}

export default function AdvocateApprovalsPage() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
    const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/advocate-approval");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setRequests(data.requests || []);
        } catch (e) {
            setError("Failed to load verification requests.");
        } finally {
            setLoading(false);
        }
    }

    async function handleAction(requestId: string, action: "APPROVE" | "REJECT") {
        setActionLoading(prev => ({ ...prev, [requestId]: true }));
        try {
            const res = await fetch("/api/admin/advocate-approval", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId,
                    action,
                    reviewNote: reviewNotes[requestId] || "",
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Action failed");
            }

            // Refresh the list
            await fetchRequests();
        } catch (e: any) {
            alert(e.message || "Something went wrong");
        } finally {
            setActionLoading(prev => ({ ...prev, [requestId]: false }));
        }
    }

    const pendingCount = requests.filter(r => r.status === "PENDING").length;
    const approvedCount = requests.filter(r => r.status === "APPROVED").length;
    const rejectedCount = requests.filter(r => r.status === "REJECTED").length;

    const filteredRequests = filter === "ALL" 
        ? requests 
        : requests.filter(r => r.status === filter);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <Clock className="h-3 w-3" /> Pending
                    </span>
                );
            case "APPROVED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Approved
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <XCircle className="h-3 w-3" /> Rejected
                    </span>
                );
            default:
                return <span className="text-xs text-gray-500">{status}</span>;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-blue-600" />
                        Advocate Approvals
                    </h1>
                    <p className="text-gray-500 mt-1">Review and approve advocate registration requests.</p>
                </div>
                <button
                    onClick={fetchRequests}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <button
                    onClick={() => setFilter("ALL")}
                    className={`p-4 rounded-xl border transition-all text-left ${
                        filter === "ALL" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                    <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                    <p className="text-sm text-gray-500">Total Requests</p>
                </button>
                <button
                    onClick={() => setFilter("PENDING")}
                    className={`p-4 rounded-xl border transition-all text-left ${
                        filter === "PENDING" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                    <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                    <p className="text-sm text-gray-500">Pending Review</p>
                </button>
                <button
                    onClick={() => setFilter("APPROVED")}
                    className={`p-4 rounded-xl border transition-all text-left ${
                        filter === "APPROVED" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                    <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
                    <p className="text-sm text-gray-500">Approved</p>
                </button>
                <button
                    onClick={() => setFilter("REJECTED")}
                    className={`p-4 rounded-xl border transition-all text-left ${
                        filter === "REJECTED" ? "border-red-500 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                    <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                    <p className="text-sm text-gray-500">Rejected</p>
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            )}

            {/* Request List */}
            {!loading && filteredRequests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No {filter !== "ALL" ? filter.toLowerCase() : ""} requests found.</p>
                </div>
            )}

            <div className="space-y-4">
                <AnimatePresence>
                    {filteredRequests.map((request) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                                request.status === "PENDING" ? "border-amber-200" : "border-gray-200"
                            }`}
                        >
                            {/* Card Header */}
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                            {(request.advocateName || "A")[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                {request.advocateName || "Unknown"}
                                                {request.status === "APPROVED" && <BadgeCheck className="h-4 w-4 text-emerald-500" />}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {request.advocateEmail || "No email"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Scale className="h-3.5 w-3.5" />
                                                    Bar ID: <strong>{request.barId || request.user?.barId || "N/A"}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(request.status)}
                                        <button
                                            onClick={() => setExpandedCards(prev => ({ ...prev, [request.id]: !prev[request.id] }))}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            {expandedCards[request.id] ? (
                                                <ChevronUp className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                    <span>Applied: {request.createdAt ? new Date(request.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Unknown"}</span>
                                    {request.reviewedBy && <span>Reviewed by: {request.reviewedBy}</span>}
                                </div>
                            </div>

                            {/* Expanded Section */}
                            <AnimatePresence>
                                {expandedCards[request.id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-gray-100"
                                    >
                                        <div className="p-5 space-y-4">
                                            {/* User Details */}
                                            {request.user && (
                                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <User className="h-4 w-4" /> User Details
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div><span className="text-gray-500">Name:</span> {request.user.name}</div>
                                                        <div><span className="text-gray-500">Email:</span> {request.user.email}</div>
                                                        <div><span className="text-gray-500">Bar ID:</span> {request.user.barId || request.barId || "N/A"}</div>
                                                        <div><span className="text-gray-500">User Status:</span> {request.user.status}</div>
                                                        <div><span className="text-gray-500">Joined:</span> {request.user.createdAt ? new Date(request.user.createdAt).toLocaleDateString() : "N/A"}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Review Note */}
                                            {request.reviewNote && (
                                                <div className="bg-blue-50 rounded-lg p-4">
                                                    <p className="text-sm text-blue-800">
                                                        <strong>Review Note:</strong> {request.reviewNote}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Action Buttons (only for PENDING) */}
                                            {request.status === "PENDING" && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Review Note (optional)
                                                        </label>
                                                        <textarea
                                                            value={reviewNotes[request.id] || ""}
                                                            onChange={(e) => setReviewNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
                                                            placeholder="Add a note about your decision..."
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleAction(request.id, "APPROVE")}
                                                            disabled={actionLoading[request.id]}
                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                        >
                                                            {actionLoading[request.id] ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            )}
                                                            Approve Advocate
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(request.id, "REJECT")}
                                                            disabled={actionLoading[request.id]}
                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                        >
                                                            {actionLoading[request.id] ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4" />
                                                            )}
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
