"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Gavel, ShieldCheck, Mail, Calendar, User as UserIcon, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { assignConsultation, cancelConsultation, assignConsultationToExternalEmail } from "@/app/actions/admin";
import { toast } from "sonner";

type UserType = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: Date | string;
    barId?: string | null;
};

type ConsultationType = {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    createdAt: Date | string;
    clientName: string;
    preferredAdvocateName: string;
    preferredAdvocateId: string;
};

interface AdminDashboardProps {
    users: UserType[];
    consultations?: ConsultationType[];
}

export function AdminDashboard({ users, consultations = [] }: AdminDashboardProps) {
    const clients = users.filter(u => u.role === "CLIENT");
    const advocates = users.filter(u => u.role === "ADVOCATE");

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clients.length}</div>
                        <p className="text-xs text-slate-400 mt-1">Registered clients</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Total Advocates</CardTitle>
                        <Gavel className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{advocates.length}</div>
                        <p className="text-xs text-slate-400 mt-1">Registered advocates</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="clients" className="w-full">
                <TabsList className="bg-slate-800/50 border border-slate-700/50 mb-6">
                    <TabsTrigger value="clients" className="data-[state=active]:bg-blue-600">
                        Clients
                    </TabsTrigger>
                    <TabsTrigger value="advocates" className="data-[state=active]:bg-purple-600">
                        Advocates
                    </TabsTrigger>
                    <TabsTrigger value="consultations" className="data-[state=active]:bg-emerald-600">
                        Consultation Requests
                        {consultations.length > 0 && (
                            <span className="ml-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {consultations.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="clients">
                    <Card className="border-white/10 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-white">Client Members</CardTitle>
                            <CardDescription className="text-slate-400">Manage all registered clients on the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserList users={clients} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="advocates">
                    <Card className="border-white/10 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-white">Advocate Members</CardTitle>
                            <CardDescription className="text-slate-400">Manage all registered advocates and verify their bar IDs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserList users={advocates} isAdvocate={true} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="consultations">
                    <Card className="border-white/10 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-white">Consultation Requests</CardTitle>
                            <CardDescription className="text-slate-400">Review and assign pending consultation requests to advocates.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ConsultationList consultations={consultations} advocates={advocates} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function UserList({ users, isAdvocate = false }: { users: UserType[], isAdvocate?: boolean }) {
    if (users.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-lg">
                <p className="text-slate-400">No members found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {users.map((user, i) => (
                <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors gap-4"
                >
                    <div className="flex items-center gap-4 flex-1">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold
                            ${isAdvocate ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h4 className="text-white font-medium flex items-center gap-2">
                                {user.name}
                                {user.status === "ACTIVE" && <ShieldCheck className="h-4 w-4 text-emerald-400" />}
                            </h4>
                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined {format(new Date(user.createdAt), "MMM d, yyyy")}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {isAdvocate && user.barId && (
                            <div className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-md border border-slate-700">
                                Bar ID: <span className="font-mono text-purple-300">{user.barId}</span>
                            </div>
                        )}
                        <div className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                            user.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            user.status === "PENDING_VERIFICATION" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}>
                            {user.status}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function ConsultationList({ consultations, advocates }: { consultations: ConsultationType[], advocates: UserType[] }) {
    if (consultations.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-lg">
                <p className="text-slate-400">No pending consultation requests.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {consultations.map((req, i) => (
                <ConsultationItem key={req.id} req={req} index={i} advocates={advocates} />
            ))}
        </div>
    );
}

function ConsultationItem({ req, index, advocates }: { req: ConsultationType, index: number, advocates: UserType[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [selectedAdvocateId, setSelectedAdvocateId] = useState<string>(req.preferredAdvocateId || "");
    const [externalEmail, setExternalEmail] = useState<string>("");

    const handleAssign = async () => {
        if (!selectedAdvocateId && !externalEmail) {
            toast.error("Please select an advocate or type an email first.");
            return;
        }

        setLoadingId("assign");
        try {
            let res;
            if (externalEmail) {
                res = await assignConsultationToExternalEmail(req.id, externalEmail);
            } else {
                res = await assignConsultation(req.id, selectedAdvocateId);
            }

            if (res.success) {
                toast.success("Case successfully assigned.");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                toast.error(res.error || "Failed to assign case.");
            }
        } catch (error) {
            toast.error("An error occurred while assigning.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this consultation request?")) return;
        
        setLoadingId("cancel");
        try {
            const res = await cancelConsultation(req.id);
            if (res.success) {
                toast.success("Consultation request cancelled.");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                toast.error(res.error || "Failed to cancel request.");
            }
        } catch (error) {
            toast.error("An error occurred while cancelling.");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 gap-4"
        >
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{req.title}</h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider">
                        {req.type}
                    </span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">{req.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" /> Client: <span className="text-slate-300">{req.clientName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <Gavel className="h-3 w-3" /> Requested: <span className="text-purple-300 font-medium">{req.preferredAdvocateName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {format(new Date(req.createdAt), "MMM d, yyyy")}
                    </span>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <select 
                        value={selectedAdvocateId}
                        onChange={(e) => {
                            setSelectedAdvocateId(e.target.value);
                            setExternalEmail(""); // Clear text box if selecting from dropdown
                        }}
                        className="bg-slate-800 border border-slate-700 text-sm rounded-md px-3 py-2 text-white outline-none w-full sm:w-48"
                        disabled={loadingId !== null}
                    >
                        <option value="" disabled>Select Advocate</option>
                        {advocates.map(adv => (
                            <option key={adv.id} value={adv.id}>
                                {adv.name} {req.preferredAdvocateId === adv.id ? "(Requested)" : ""}
                            </option>
                        ))}
                    </select>
                    <div className="text-xs text-slate-500 text-center">- OR -</div>
                    <input 
                        type="email"
                        placeholder="Type an external email..."
                        value={externalEmail}
                        onChange={(e) => {
                            setExternalEmail(e.target.value);
                            if (e.target.value) setSelectedAdvocateId(""); // Clear select if typing
                        }}
                        className="bg-slate-800 border border-slate-700 text-sm rounded-md px-3 py-2 text-white outline-none w-full sm:w-48"
                        disabled={loadingId !== null}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white flex-1"
                        onClick={handleAssign}
                        disabled={loadingId !== null || (!selectedAdvocateId && !externalEmail)}
                    >
                        {loadingId === "assign" ? "Assigning..." : (
                            <>
                                <CheckCircle className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Assign</span>
                            </>
                        )}
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={handleCancel}
                        disabled={loadingId !== null}
                    >
                        {loadingId === "cancel" ? "..." : (
                            <>
                                <XCircle className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Cancel</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
