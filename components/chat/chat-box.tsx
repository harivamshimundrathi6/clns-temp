"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchMessages, sendMessage, Message } from "@/app/actions/message";
import { format } from "date-fns";

interface ChatBoxProps {
    contactId: string;
    contactName: string;
    myId: string;
}

export function ChatBox({ contactId, contactName, myId }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadMessages = async () => {
        const msgs = await fetchMessages(contactId);
        setMessages(msgs);
        setLoading(false);
    };

    useEffect(() => {
        loadMessages();
        // Polling every 3 seconds for new messages
        const interval = setInterval(() => {
            loadMessages();
        }, 3000);
        return () => clearInterval(interval);
    }, [contactId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const content = newMessage;
        setNewMessage(""); // optimistic clear

        // Optimistic UI update
        const tempMsg: Message = {
            id: Date.now().toString(),
            senderId: myId,
            receiverId: contactId,
            content,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        const res = await sendMessage(contactId, content);
        if (!res.success) {
            // If failed, reload to remove optimistic
            loadMessages();
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-[#020817] border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-white/5">
                <div className="h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">{contactName}</h3>
                    <p className="text-xs text-slate-400">Online</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0f1c] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-slate-500">
                        No messages yet. Say hello!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === myId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                                    isMe 
                                        ? 'bg-teal-600 text-white rounded-br-none' 
                                        : 'bg-white/10 text-slate-200 border border-white/5 rounded-bl-none'
                                }`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${isMe ? 'text-teal-200/70' : 'text-slate-500'} text-right`}>
                                        {format(new Date(msg.createdAt), "HH:mm")}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-black/40 border-white/10 text-white focus-visible:ring-teal-500 placeholder:text-slate-500"
                />
                <Button type="submit" disabled={!newMessage.trim()} className="bg-teal-600 hover:bg-teal-500 text-white shadow-lg">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
