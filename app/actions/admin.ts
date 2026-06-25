"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { 
    sendCaseAssignedEmailToClient, 
    sendCaseAssignedEmailToAdvocate, 
    sendCaseReassignedEmailToOriginalAdvocate, 
    sendCaseCancelledEmail,
    sendCaseAssignedToExternalEmail,
    sendCaseReassignedGentleEmailToAdvocate
} from "@/lib/email";

export async function fetchPlatformUsers() {
    try {
        const session = await auth();
        // Allow access to users with ADMIN role
        // For demonstration/testing, if the current user is logged in, we let them view it if we want to test easily
        // but let's strictly require ADMIN
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        // Use findMany and filter manually if the mock DB doesn't support 'in' well
        const allUsers = await db.user.findMany();
        
        const filteredUsers = allUsers.filter((u: any) => 
            u.role === "CLIENT" || u.role === "ADVOCATE"
        );

        // Filter and map out to basic types
        const mappedUsers = filteredUsers.map((user: any) => ({
            id: user.id,
            name: user.name || "Unknown",
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            barId: user.barId,
        }));

        // Sort by newest first
        mappedUsers.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        return { success: true, data: mappedUsers };
    } catch (error) {
        console.error("Failed to fetch platform users:", error);
        return { success: false, error: "Failed to fetch platform users" };
    }
}

export async function fetchConsultationRequests() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        // Fetch all cases that are waiting to be assigned
        const cases = await db.case.findMany({
            where: {
                status: "PENDING_ASSIGNMENT"
            },
            include: {
                client: true,
                advocate: true
            }
        });

        // Also fetch preferred advocate details if needed
        const enrichedCases = await Promise.all(cases.map(async (c: any) => {
            let preferredAdvocate = null;
            if (c.preferredAdvocateId) {
                preferredAdvocate = await db.user.findUnique({
                    where: { id: c.preferredAdvocateId },
                    select: { name: true, email: true, barId: true }
                });
            }
            return {
                id: c.id,
                title: c.title,
                description: c.description,
                type: c.type,
                status: c.status,
                createdAt: c.createdAt,
                clientId: c.clientId,
                clientName: c.client?.name || "Unknown Client",
                preferredAdvocateId: c.preferredAdvocateId,
                preferredAdvocateName: preferredAdvocate?.name || "Unknown Advocate"
            };
        }));

        // Sort newest first
        enrichedCases.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        return { success: true, data: enrichedCases };
    } catch (error) {
        console.error("Failed to fetch consultation requests:", error);
        return { success: false, error: "Failed to fetch consultation requests" };
    }
}

export async function assignConsultation(caseId: string, advocateId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        // Fetch the existing case to see preferred advocate and client
        const existingCase = await db.case.findUnique({
            where: { id: caseId },
            include: { client: true }
        }) as any;

        if (!existingCase) {
            return { success: false, error: "Case not found" };
        }

        // Assign the case to the selected advocate
        const updatedCase = await db.case.update(caseId, {
            advocateId: advocateId,
            status: "PENDING" // Advocate will now see it as PENDING their review
        });

        // Fetch selected advocate details
        const selectedAdvocate = await db.user.findUnique({
            where: { id: advocateId },
            select: { name: true, email: true }
        });

        const clientEmail = existingCase.client?.email;
        const clientName = existingCase.client?.name || "Client";
        const selectedAdvocateName = selectedAdvocate?.name || "Advocate";

        // Dispatch emails asynchronously
        const emailPromises = [];

        // 1. New Advocate gets assigned email
        if (selectedAdvocate?.email) {
            emailPromises.push(sendCaseAssignedEmailToAdvocate(selectedAdvocate.email, selectedAdvocateName, clientName));
        }

        // 2. Client gets assigned email
        if (clientEmail) {
            emailPromises.push(sendCaseAssignedEmailToClient(clientEmail, clientName, selectedAdvocateName));
        }

        // 3. If reassigned, notify the originally preferred advocate
        if (existingCase.preferredAdvocateId && existingCase.preferredAdvocateId !== advocateId) {
            const preferredAdvocate = await db.user.findUnique({
                where: { id: existingCase.preferredAdvocateId },
                select: { name: true, email: true }
            });
            if (preferredAdvocate?.email) {
                emailPromises.push(sendCaseReassignedEmailToOriginalAdvocate(preferredAdvocate.email, preferredAdvocate.name || "Advocate"));
            }
        }

        Promise.allSettled(emailPromises).catch(console.error);

        return { success: true, data: updatedCase };
    } catch (error) {
        console.error("Failed to assign consultation:", error);
        return { success: false, error: "Failed to assign consultation" };
    }
}

export async function cancelConsultation(caseId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const existingCase = await db.case.findUnique({
            where: { id: caseId },
            include: { client: true }
        }) as any;

        if (!existingCase) {
            return { success: false, error: "Case not found" };
        }

        // Update status to CANCELLED
        const updatedCase = await db.case.update(caseId, {
            status: "CANCELLED"
        });

        const clientEmail = existingCase.client?.email;
        const clientName = existingCase.client?.name || "Client";

        if (clientEmail) {
            sendCaseCancelledEmail(clientEmail, clientName).catch(console.error);
        }

        return { success: true, data: updatedCase };
    } catch (error) {
        console.error("Failed to cancel consultation:", error);
        return { success: false, error: "Failed to cancel consultation" };
    }
}

export async function assignConsultationToExternalEmail(caseId: string, email: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const existingCase = await db.case.findUnique({
            where: { id: caseId },
            include: { client: true }
        }) as any;

        if (!existingCase) {
            return { success: false, error: "Case not found" };
        }

        // We update status to ASSIGNED_EXTERNALLY, keeping advocateId null since they aren't registered
        const updatedCase = await db.case.update(caseId, {
            status: "ASSIGNED_EXTERNALLY",
            externalAdvocateEmail: email // Store it if your db supports loose fields
        } as any);

        const clientEmail = existingCase.client?.email;
        const clientName = existingCase.client?.name || "Client";

        // Dispatch emails asynchronously
        const emailPromises = [];

        // 1. External typed email gets notification
        emailPromises.push(sendCaseAssignedToExternalEmail(email, clientName));

        // 2. Original advocate gets gentle notification
        if (existingCase.preferredAdvocateId) {
            const preferredAdvocate = await db.user.findUnique({
                where: { id: existingCase.preferredAdvocateId },
                select: { name: true, email: true }
            });
            if (preferredAdvocate?.email) {
                emailPromises.push(sendCaseReassignedGentleEmailToAdvocate(preferredAdvocate.email, preferredAdvocate.name || "Advocate"));
            }
        }

        Promise.allSettled(emailPromises).catch(console.error);

        return { success: true, data: updatedCase };
    } catch (error) {
        console.error("Failed to assign consultation to external email:", error);
        return { success: false, error: "Failed to assign consultation externally" };
    }
}
