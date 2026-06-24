// Global types to replace Prisma generated types
declare global {
  interface User {
    id: string; // Made required globally
    email: string;
    name?: string | null;
    password?: string | null;
    role: string;
    status: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    barId?: string | null;
    bio?: string | null;
    college?: string | null;
    resumeUrl?: string | null;
    imageUrl?: string | null;
    firebaseUid?: string | null;
    city?: string | null;
    court?: string | null;
  }

  interface Case {
    id: string; // Made required
    title: string;
    description?: string | null;
    type: string;
    status: string;
    clientId: string;
    advocateId?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    client?: User;
    advocate?: User;
    hearings?: Hearing[];
  }

  interface ClientCase extends Case {
      // Any specific fields if needed
  }

  interface Hearing {
    id: string; // Made required
    date: string;
    title: string;
    court?: string;
    caseId: string;
    createdAt?: string;
    updatedAt?: string;
    case?: Case;
  }

  interface VerificationRequest {
    id: string; // Made required
    userId: string;
    status: string;
    documentUrl?: string;
    barId?: string;
    advocateName?: string;
    advocateEmail?: string;
    reviewedBy?: string;
    reviewNote?: string;
    createdAt?: string;
    updatedAt?: string;
    user?: User;
  }

  interface InternshipPosting {
    id: string; // Made required
    title: string;
    company: string;
    location: string;
    description: string;
    type: string;
    deadline?: string | null;
    duration?: string | null;
    stipend?: string | null;
    status: string;
    authorId?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    _count?: { applications: number };
  }

  interface InternshipApplication {
    id: string; // Made required
    studentId: string;
    postingId: string;
    status: string;
    coverNote?: string | null;
    resumeUrl?: string | null;
    feedback?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    posting?: InternshipPosting;
    student?: User;
  }

  interface Mentorship {
    id: string; // Made required
    mentorId: string;
    studentId: string;
    programId?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
    mentor?: User;
    student?: User;
    mentorshipSessions?: MentorshipSession[];
    _count?: { mentorshipSessions: number };
  }

  interface MentorshipSession {
    id: string;
    mentorshipId: string;
    date: string;
    duration: number;
    notes?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface SystemLog {
    id: string;
    action: string;
    description: string;
    userId?: string;
    createdAt?: string;
  }
  
  interface Advocate extends User {
      specialization: string;
      verified: boolean;
  }
}

export {};
