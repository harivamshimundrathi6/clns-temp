"use client";

import { useState, useEffect } from "react";
import { User, MessageSquare } from "lucide-react";
import { fetchContacts } from "@/app/actions/message";
import { ChatBox } from "./chat-box";

interface MessageCenterProps {
    role: "ADVOCATE" | "CLIENT" | "STUDENT";
    myId: string;
}

export function MessageCenter({ role, myId }: MessageCenterProps) {
    const [contacts, setContacts] = useState<{ id: string; name: string; role: string; email: string }[]>([]);
    const [activeContact, setActiveContact] = useState<{ id: string; name: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContacts = async () => {
            const data = await fetchContacts(role);
            setContacts(data);
            setLoading(false);
        };
        loadContacts();
    }, [role]);

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-220px)] min-h-[500px] gap-6">
            {/* Contacts Sidebar */}
            <div className="w-full md:w-80 flex flex-col bg-[#020817] border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-teal-400" />
                        Conversations
                    </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <div className="animate-spin h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full" />
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">
                            No active conversations yet.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {contacts.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setActiveContact({ id: c.id, name: c.name })}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                                        activeContact?.id === c.id 
                                            ? 'bg-teal-500/20 border border-teal-500/30' 
                                            : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <div className="h-10 w-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-slate-300" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-sm font-medium text-white truncate">{c.name}</h4>
                                        <p className="text-xs text-slate-400 truncate">{c.role}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1">
                {activeContact ? (
                    <ChatBox contactId={activeContact.id} contactName={activeContact.name} myId={myId} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-[#020817] border border-white/10 rounded-xl">
                        <MessageSquare className="h-16 w-16 text-slate-700 mb-4" />
                        <h3 className="text-xl font-medium text-slate-300">Select a conversation</h3>
                        <p className="text-slate-500 mt-2">Choose a contact from the sidebar to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
