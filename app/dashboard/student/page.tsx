import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardContent } from "./dashboard-content";

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id || session.user.role !== "STUDENT") {
    // In a real app this might redirect to login or 403, 
    // but middleware usually handles role checks.
    // For safety we redirect if role mismatch.
    if (session?.user) {
      return redirect(`/dashboard/${session.user.role.toLowerCase()}`);
    }
    return redirect("/login");
  }

  const userId = session.user.id;

  const [applicationsCount, mentorships, allPostings] = await Promise.all([
    db.internshipApplication.count({ where: { studentId: userId } }),
    db.mentorship.findMany({
      where: { studentId: userId },
      include: { mentor: true }
    }),
    db.internshipPosting.findMany({
      orderBy: { createdAt: "desc" }
    })
  ]);

  const postings = allPostings.slice(0, 5).map(p => ({
    ...p,
    id: p.id || ''
  }));

  // Calculate mentorship sessions data manually
  const allMentorshipSessions = await db.mentorshipSession.findMany();
  const userMentorshipIds = mentorships.map(m => m.id).filter(Boolean);
  const userSessions = allMentorshipSessions.filter((session: any) => 
    userMentorshipIds.includes(session.mentorshipId)
  );
  
  const upcomingSessionsCount = userSessions.filter((session: any) => 
    new Date(session.date) >= new Date()
  ).length;
  
  const totalDuration = userSessions.reduce((sum: number, session: any) => 
    sum + (session.duration || 0), 0
  );

  const metrics = {
    applicationsSent: applicationsCount,
    upcomingSessions: upcomingSessionsCount,
    mentorshipHours: totalDuration / 60, // Assuming duration is in minutes
  };

  const formattedMentorships = mentorships.map(m => ({
    id: m.id || '',
    name: m.mentor?.name || 'Unknown',
    email: m.mentor?.email || '',
    status: m.status
  }));

  return <DashboardContent
    metrics={metrics}
    postings={postings}
    mentorships={formattedMentorships}
  />;
}
