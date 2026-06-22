"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { auth } from "@/auth";

export type Message = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
};

export async function fetchMessages(contactId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const myId = session.user.id;
        
        // Fetch messages where I am sender and contact is receiver
        const q1 = query(
            collection(db, "messages"),
            where("senderId", "==", myId),
            where("receiverId", "==", contactId)
        );
        
        // Fetch messages where contact is sender and I am receiver
        const q2 = query(
            collection(db, "messages"),
            where("senderId", "==", contactId),
            where("receiverId", "==", myId)
        );

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        
        const messages: Message[] = [];
        
        snap1.forEach(doc => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt || new Date().toISOString()
            } as Message);
        });
        
        snap2.forEach(doc => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt || new Date().toISOString()
            } as Message);
        });

        // Sort by time
        return messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        return [];
    }
}

export async function sendMessage(receiverId: string, content: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const myId = session.user.id;

        await addDoc(collection(db, "messages"), {
            senderId: myId,
            receiverId: receiverId,
            content,
            createdAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send message:", error);
        return { success: false, error: "Failed to send message" };
    }
}

export async function fetchContacts(role: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];
        const myId = session.user.id;
        
        const contacts: { id: string; name: string; role: string; email: string }[] = [];
        const addedIds = new Set<string>();

        // If I am advocate, get my clients and mentees
        if (role === "ADVOCATE") {
            const qCases = query(collection(db, "cases"), where("advocateId", "==", myId));
            const caseSnaps = await getDocs(qCases);
            for (const c of caseSnaps.docs) {
                const clientId = c.data().clientId;
                if (clientId && !addedIds.has(clientId)) {
                    addedIds.add(clientId);
                    // fetch user
                    const uSnap = await getDoc(doc(db, "users", clientId));
                    if (uSnap.exists()) {
                        contacts.push({ id: clientId, name: uSnap.data().name || "Unknown", email: uSnap.data().email, role: "CLIENT" });
                    }
                }
            }
            
            const qMentorships = query(collection(db, "mentorships"), where("mentorId", "==", myId), where("status", "==", "ACTIVE"));
            const mentSnaps = await getDocs(qMentorships);
            for (const m of mentSnaps.docs) {
                const studentId = m.data().studentId;
                if (studentId && !addedIds.has(studentId)) {
                    addedIds.add(studentId);
                    const uSnap = await getDoc(doc(db, "users", studentId));
                    if (uSnap.exists()) {
                        contacts.push({ id: studentId, name: uSnap.data().name || "Unknown", email: uSnap.data().email, role: "STUDENT" });
                    }
                }
            }
        } 
        // If I am a client, get my advocates
        else if (role === "CLIENT") {
            const qCases = query(collection(db, "cases"), where("clientId", "==", myId));
            const caseSnaps = await getDocs(qCases);
            for (const c of caseSnaps.docs) {
                const advocateId = c.data().advocateId;
                if (advocateId && !addedIds.has(advocateId)) {
                    addedIds.add(advocateId);
                    const uSnap = await getDoc(doc(db, "users", advocateId));
                    if (uSnap.exists()) {
                        contacts.push({ id: advocateId, name: uSnap.data().name || "Unknown", email: uSnap.data().email, role: "ADVOCATE" });
                    }
                }
            }
        }
        // If I am a student, get my mentors
        else if (role === "STUDENT") {
            const qMentorships = query(collection(db, "mentorships"), where("studentId", "==", myId), where("status", "==", "ACTIVE"));
            const mentSnaps = await getDocs(qMentorships);
            for (const m of mentSnaps.docs) {
                const mentorId = m.data().mentorId;
                if (mentorId && !addedIds.has(mentorId)) {
                    addedIds.add(mentorId);
                    const uSnap = await getDoc(doc(db, "users", mentorId));
                    if (uSnap.exists()) {
                        contacts.push({ id: mentorId, name: uSnap.data().name || "Unknown", email: uSnap.data().email, role: "ADVOCATE" });
                    }
                }
            }
        }

        return contacts;
    } catch (error) {
        console.error("Failed to fetch contacts:", error);
        return [];
    }
}
