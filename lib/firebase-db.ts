import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentData,
  Query,
  setDoc,
  documentId
} from "firebase/firestore";
import { db } from "./firebase";

// User operations
export const userOperations = {
  async count(options?: { where?: any }): Promise<number> {
    let q: Query<DocumentData> = collection(db, "users");
    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          q = query(q, where(key, "==", value));
        }
      });
    }
    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  async findMany(options: { where?: any; orderBy?: any; take?: number; select?: any } = {}): Promise<User[]> {
    let q: Query<DocumentData> = collection(db, "users");
    
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          q = query(q, where(key, "==", value));
        }
      });
    }

    if (options.orderBy) {
      const field = Object.keys(options.orderBy)[0];
      const direction = options.orderBy[field];
      q = query(q, orderBy(field, direction));
    }

    if (options.take) {
      q = query(q, limit(options.take));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  },

  async findUnique(options: { where: any, select?: any }): Promise<User | null> {
    if (options.where.id) {
      const docRef = doc(db, "users", options.where.id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as User;
    }
    const field = Object.keys(options.where)[0];
    const value = options.where[field];
    const q = query(collection(db, "users"), where(field, "==", value));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User;
  },

  async findFirst(options: { where?: any }): Promise<User | null> {
    let q: Query<DocumentData> = collection(db, "users");
    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          q = query(q, where(key, "==", value));
        }
      });
    }
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User;
  },

  async create(data: Omit<User, 'id'> & { id?: string }): Promise<User> {
    // If firebaseUid is provided, use it as the document ID to pass security rules
    if (data.firebaseUid) {
        await setDoc(doc(db, "users", data.firebaseUid), data as any);
        return { id: data.firebaseUid, ...data } as User;
    }
    const docRef = await addDoc(collection(db, "users"), data as any);
    return { id: docRef.id, ...data } as User;
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    await updateDoc(doc(db, "users", id), data);
    return { id, ...data } as User;
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "users", id));
  }
};

// Case operations
export const caseOperations = {
  async count(options?: { where?: any }): Promise<number> {
    let q: Query<DocumentData> = collection(db, "cases");
    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          q = query(q, where(key, "==", value));
        }
      });
    }
    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  async findMany(options: { where?: any; orderBy?: any; include?: any; select?: any; take?: number; distinct?: any } = {}): Promise<Case[]> {
    let q: Query<DocumentData> = collection(db, "cases");
    
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined && key !== "case") {
          q = query(q, where(key, "==", value));
        }
      });
    }

    if (options.orderBy) {
      const field = Object.keys(options.orderBy)[0];
      const direction = options.orderBy[field];
      q = query(q, orderBy(field, direction));
    }

    const snapshot = await getDocs(q);
    const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Case));

    // Handle includes
    if (options.include?.client) {
      await Promise.all(cases.map(async (caseItem) => {
        if (caseItem.clientId) {
          const clientDoc = await getDoc(doc(db, "users", caseItem.clientId));
          if (clientDoc.exists()) {
            (caseItem as any).client = { id: clientDoc.id, ...clientDoc.data() };
          }
        }
      }));
    }

    if (options.include?.advocate) {
      await Promise.all(cases.map(async (caseItem) => {
        if (caseItem.advocateId) {
          const advocateDoc = await getDoc(doc(db, "users", caseItem.advocateId));
          if (advocateDoc.exists()) {
            (caseItem as any).advocate = { id: advocateDoc.id, ...advocateDoc.data() };
          }
        }
      }));
    }

    if (options.include?.hearings) {
      await Promise.all(cases.map(async (caseItem) => {
        const hearingsQ = query(collection(db, "hearings"), where("caseId", "==", caseItem.id));
        const hearingsSnapshot = await getDocs(hearingsQ);
        (caseItem as any).hearings = hearingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }));
    }

    return cases;
  },

  async create(data: Omit<Case, 'id'>): Promise<Case> {
    const docRef = await addDoc(collection(db, "cases"), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  },

  async findUnique(options: { where: any, select?: any }): Promise<Case | null> {
    if (options.where.id) {
      const docRef = doc(db, "cases", options.where.id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as Case;
    }
    const field = Object.keys(options.where)[0];
    const value = options.where[field];
    const q = query(collection(db, "cases"), where(field, "==", value));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Case;
  },

  async findFirst(options: { where?: any; include?: any }): Promise<Case | null> {
    let q: Query<DocumentData> = collection(db, "cases");
    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === "id") {
            q = query(q, where(documentId(), "==", value));
          } else {
            q = query(q, where(key, "==", value));
          }
        }
      });
    }
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const caseItem = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Case;

    if (options.include?.client && caseItem.clientId) {
      const clientDoc = await getDoc(doc(db, "users", caseItem.clientId));
      if (clientDoc.exists()) {
        (caseItem as any).client = { id: clientDoc.id, ...clientDoc.data() };
      }
    }

    if (options.include?.advocate && caseItem.advocateId) {
      const advocateDoc = await getDoc(doc(db, "users", caseItem.advocateId));
      if (advocateDoc.exists()) {
        (caseItem as any).advocate = { id: advocateDoc.id, ...advocateDoc.data() };
      }
    }

    if (options.include?.hearings) {
      const hearingsQ = query(collection(db, "hearings"), where("caseId", "==", caseItem.id));
      const hearingsSnapshot = await getDocs(hearingsQ);
      (caseItem as any).hearings = hearingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return caseItem;
  },

  async update(id: string, data: Partial<Case>): Promise<Case> {
    await updateDoc(doc(db, "cases", id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
    const updatedDoc = await getDoc(doc(db, "cases", id));
    return { id, ...updatedDoc.data() } as Case;
  }
};

// Hearing operations
export const hearingOperations = {
  async count(options?: { where?: any }): Promise<number> {
    let q: Query<DocumentData> = collection(db, "hearings");
    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          q = query(q, where(key, "==", value));
        }
      });
    }
    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  async findMany(options: { where?: any; orderBy?: any; include?: any; select?: any; take?: number; distinct?: any } = {}): Promise<Hearing[]> {
    let q: Query<DocumentData> = collection(db, "hearings");
    
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined && key !== "case") {
          q = query(q, where(key, "==", value));
        }
      });
    }

    if (options.orderBy) {
      const field = Object.keys(options.orderBy)[0];
      const direction = options.orderBy[field];
      q = query(q, orderBy(field, direction));
    }

    const snapshot = await getDocs(q);
    const hearings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hearing));

    if (options.include?.case) {
      for (const hearing of hearings) {
        if (hearing.caseId) {
          const caseDoc = await getDoc(doc(db, "cases", hearing.caseId));
          if (caseDoc.exists()) {
            (hearing as any).case = { id: caseDoc.id, ...caseDoc.data() };
          }
        }
      }
    }

    return hearings;
  },

  async create(data: Omit<Hearing, 'id'>): Promise<Hearing> {
    const docRef = await addDoc(collection(db, "hearings"), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  },

  async findUnique(options: { where: any, select?: any }): Promise<Hearing | null> {
    if (options.where.id) {
      const docRef = doc(db, "hearings", options.where.id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as Hearing;
    }
    const field = Object.keys(options.where)[0];
    const value = options.where[field];
    const q = query(collection(db, "hearings"), where(field, "==", value));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Hearing;
  },

  async findFirst(options: { where?: any }): Promise<Hearing | null> {
    let q: Query<DocumentData> = collection(db, "hearings");
    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          q = query(q, where(key, "==", value));
        }
      });
    }
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Hearing;
  },

  async update(id: string, data: Partial<Hearing>): Promise<Hearing> {
    await updateDoc(doc(db, "hearings", id), data);
    const updatedDoc = await getDoc(doc(db, "hearings", id));
    return { id, ...updatedDoc.data() } as Hearing;
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "hearings", id));
  }
};

// Verification Request operations
export const verificationRequestOperations = {
  async count(options?: { where?: any }): Promise<number> {
    let q: Query<DocumentData> = collection(db, "verificationRequests");
    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          q = query(q, where(key, "==", value));
        }
      });
    }
    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  async findMany(options: { where?: any; orderBy?: any; include?: any; take?: number; select?: any } = {}): Promise<VerificationRequest[]> {
    let q: Query<DocumentData> = collection(db, "verificationRequests");
    
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          q = query(q, where(key, "==", value));
        }
      });
    }

    if (options.orderBy) {
      const field = Object.keys(options.orderBy)[0];
      const direction = options.orderBy[field];
      q = query(q, orderBy(field, direction));
    }

    if (options.take) {
      q = query(q, limit(options.take));
    }

    const snapshot = await getDocs(q);
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VerificationRequest));

    if (options.include?.user) {
      for (const request of requests) {
        if (request.userId) {
          const userDoc = await getDoc(doc(db, "users", request.userId));
          if (userDoc.exists()) {
            (request as any).user = { id: userDoc.id, ...userDoc.data() };
          }
        }
      }
    }

    return requests;
  },

  async update(id: string, data: Partial<VerificationRequest>): Promise<VerificationRequest> {
    await updateDoc(doc(db, "verificationRequests", id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { id, ...data } as VerificationRequest;
  },

  async create(data: Omit<VerificationRequest, 'id'>): Promise<VerificationRequest> {
    const docRef = await addDoc(collection(db, "verificationRequests"), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data } as VerificationRequest;
  },

  async findUnique(options: { where: any }): Promise<VerificationRequest | null> {
    if (options.where.id) {
      const docRef = doc(db, "verificationRequests", options.where.id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as VerificationRequest;
    }
    const field = Object.keys(options.where)[0];
    const value = options.where[field];
    const q = query(collection(db, "verificationRequests"), where(field, "==", value));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as VerificationRequest;
  }
};

// Internship Posting operations
export const internshipPostingOperations = {
  async findMany(options: { where?: any; orderBy?: any; include?: any } = {}): Promise<InternshipPosting[]> {
    let q: Query<DocumentData> = collection(db, "internshipPostings");
    
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          q = query(q, where(key, "==", value));
        }
      });
    }

    if (options.orderBy) {
      const field = Object.keys(options.orderBy)[0];
      const direction = options.orderBy[field];
      q = query(q, orderBy(field, direction));
    }

    const snapshot = await getDocs(q);
    const postings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InternshipPosting));

    if (options.include?._count?.select?.applications) {
      for (const posting of postings) {
        const appsQ = query(collection(db, "internshipApplications"), where("postingId", "==", posting.id));
        const appsSnapshot = await getDocs(appsQ);
        (posting as any)._count = { applications: appsSnapshot.size };
      }
    }

    return postings;
  },

  async create(data: Omit<InternshipPosting, 'id'>): Promise<InternshipPosting> {
    const docRef = await addDoc(collection(db, "internshipPostings"), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  },

  async findUnique(options: { where: any, select?: any }): Promise<InternshipPosting | null> {
    if (options.where.id) {
      const docRef = doc(db, "internshipPostings", options.where.id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as InternshipPosting;
    }
    const field = Object.keys(options.where)[0];
    const value = options.where[field];
    const q = query(collection(db, "internshipPostings"), where(field, "==", value));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as InternshipPosting;
  },

  async update(id: string, data: Partial<InternshipPosting>): Promise<InternshipPosting> {
    await updateDoc(doc(db, "internshipPostings", id), data);
    const updatedDoc = await getDoc(doc(db, "internshipPostings", id));
    return { id, ...updatedDoc.data() } as InternshipPosting;
  }
};

// Internship Application operations
export const internshipApplicationOperations = {
  async count(options: { where?: any } = {}): Promise<number> {
    let q: Query<DocumentData> = collection(db, "internshipApplications");
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          q = query(q, where(key, "==", value));
        }
      });
    }
    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  async findMany(options: { where?: any; orderBy?: any; include?: any; select?: any; take?: number } = {}): Promise<InternshipApplication[]> {
    let q: Query<DocumentData> = collection(db, "internshipApplications");
    
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          q = query(q, where(key, "==", value));
        }
      });
    }

    if (options.orderBy) {
      const field = Object.keys(options.orderBy)[0];
      const direction = options.orderBy[field];
      q = query(q, orderBy(field, direction));
    }

    const snapshot = await getDocs(q);
    const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InternshipApplication));

    if (options.include?.posting) {
      for (const app of applications) {
        if (app.postingId) {
          const postingDoc = await getDoc(doc(db, "internshipPostings", app.postingId));
          if (postingDoc.exists()) {
            (app as any).posting = { id: postingDoc.id, ...postingDoc.data() };
          }
        }
      }
    }

    if (options.include?.student) {
      for (const app of applications) {
        if (app.studentId) {
          const studentDoc = await getDoc(doc(db, "users", app.studentId));
          if (studentDoc.exists()) {
            (app as any).student = { id: studentDoc.id, ...studentDoc.data() };
          }
        }
      }
    }

    return applications;
  },

  async findFirst(options: { where?: any }): Promise<InternshipApplication | null> {
    let q: Query<DocumentData> = collection(db, "internshipApplications");
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          q = query(q, where(key, "==", value));
        }
      });
    }
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as InternshipApplication;
  },

  async create(data: Omit<InternshipApplication, 'id'>): Promise<InternshipApplication> {
    const docRef = await addDoc(collection(db, "internshipApplications"), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  },

  async findUnique(options: { where: any, select?: any }): Promise<InternshipApplication | null> {
    if (options.where.id) {
      const docRef = doc(db, "internshipApplications", options.where.id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as InternshipApplication;
    }
    const field = Object.keys(options.where)[0];
    const value = options.where[field];
    const q = query(collection(db, "internshipApplications"), where(field, "==", value));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as InternshipApplication;
  },

  async update(id: string, data: Partial<InternshipApplication>): Promise<InternshipApplication> {
    await updateDoc(doc(db, "internshipApplications", id), data);
    const updatedDoc = await getDoc(doc(db, "internshipApplications", id));
    return { id, ...updatedDoc.data() } as InternshipApplication;
  }
};

// Mentorship operations
export const mentorshipOperations = {
  async count(options: { where?: any } = {}): Promise<number> {
    let q: Query<DocumentData> = collection(db, "mentorships");
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined && key !== "mentorship") {
          q = query(q, where(key, "==", value));
        }
      });
    }
    const snapshot = await getDocs(q);
    return snapshot.size;
  },
  async findFirst(options: { where?: any }): Promise<Mentorship | null> {
    let q: Query<DocumentData> = collection(db, "mentorships");
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined && key !== "mentorship") {
          // Handle { in: [...] } if needed, otherwise fallback to basic equality if value is not object
          if (typeof value === 'object' && value !== null && 'in' in value) {
            q = query(q, where(key, "in", value.in));
          } else {
            q = query(q, where(key, "==", value));
          }
        }
      });
    }
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Mentorship;
  },

  async findMany(options: { where?: any; orderBy?: any; include?: any; select?: any; take?: number } = {}): Promise<Mentorship[]> {
    let q: Query<DocumentData> = collection(db, "mentorships");
    
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined && key !== "mentorship") {
          q = query(q, where(key, "==", value));
        }
      });
    }

    if (options.orderBy) {
      const field = Object.keys(options.orderBy)[0];
      const direction = options.orderBy[field];
      q = query(q, orderBy(field, direction));
    }

    const snapshot = await getDocs(q);
    const mentorships = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentorship));

    if (options.include?.mentor) {
      for (const mentorship of mentorships) {
        if (mentorship.mentorId) {
          const mentorDoc = await getDoc(doc(db, "users", mentorship.mentorId));
          if (mentorDoc.exists()) {
            (mentorship as any).mentor = { id: mentorDoc.id, ...mentorDoc.data() };
          }
        }
      }
    }

    if (options.include?.student) {
      for (const mentorship of mentorships) {
        if (mentorship.studentId) {
          const studentDoc = await getDoc(doc(db, "users", mentorship.studentId));
          if (studentDoc.exists()) {
            (mentorship as any).student = { id: studentDoc.id, ...studentDoc.data() };
          }
        }
      }
    }

    if (options.include?.mentorshipSessions) {
      for (const mentorship of mentorships) {
        const sessionsQ = query(collection(db, "mentorshipSessions"), where("mentorshipId", "==", mentorship.id));
        const sessionsSnapshot = await getDocs(sessionsQ);
        (mentorship as any).mentorshipSessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    }

    if (options.include?._count?.select?.mentorshipSessions) {
      for (const mentorship of mentorships) {
        const sessionsQ = query(collection(db, "mentorshipSessions"), where("mentorshipId", "==", mentorship.id));
        const sessionsSnapshot = await getDocs(sessionsQ);
        (mentorship as any)._count = { mentorshipSessions: sessionsSnapshot.size };
      }
    }

    return mentorships;
  },

  async create(data: Omit<Mentorship, 'id'>): Promise<Mentorship> {
    const docRef = await addDoc(collection(db, "mentorships"), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  },

  async update(id: string, data: Partial<Mentorship>): Promise<Mentorship> {
    const docRef = doc(db, "mentorships", id);
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(docRef, updateData);
    
    // Fetch and return the updated document
    const updatedDoc = await getDoc(docRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Mentorship;
  }
};

// Mentorship Session operations
export const mentorshipSessionOperations = {
  async count(options?: { where?: any }): Promise<number> {
    let q: Query<DocumentData> = collection(db, "mentorshipSessions");
    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined && key !== "mentorship") {
          q = query(q, where(key, "==", value));
        }
      });
    }
    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  async aggregate(options?: { where?: any; _sum?: any }): Promise<{ _sum: { duration: number } }> {
    let q: Query<DocumentData> = collection(db, "mentorshipSessions");
    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined && key !== "mentorship") {
          q = query(q, where(key, "==", value));
        }
      });
    }
    const snapshot = await getDocs(q);
    let total = 0;
    snapshot.forEach(doc => {
      if (doc.data().duration) {
        total += doc.data().duration;
      }
    });
    return { _sum: { duration: total } };
  },

  async findMany(options: { where?: any; include?: any } = {}): Promise<MentorshipSession[]> {
    let q: Query<DocumentData> = collection(db, "mentorshipSessions");
    
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined && key !== "mentorship") {
          q = query(q, where(key, "==", value));
        }
      });
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MentorshipSession));
  }
};

// System Log operations
export const systemLogOperations = {
  async findMany(options: { orderBy?: any; take?: number } = {}): Promise<SystemLog[]> {
    let q: Query<DocumentData> = collection(db, "systemLogs");
    
    if (options.orderBy) {
      const field = Object.keys(options.orderBy)[0];
      const direction = options.orderBy[field];
      q = query(q, orderBy(field, direction));
    }

    if (options.take) {
      q = query(q, limit(options.take));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SystemLog));
  },

  async create(data: Omit<SystemLog, 'id'>): Promise<SystemLog> {
    const docRef = await addDoc(collection(db, "systemLogs"), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data } as SystemLog;
  }
};

// Export a unified db object similar to Prisma
export const firebaseDb = {
  user: userOperations,
  case: caseOperations,
  hearing: hearingOperations,
  verificationRequest: verificationRequestOperations,
  internshipPosting: internshipPostingOperations,
  internshipApplication: internshipApplicationOperations,
  mentorship: mentorshipOperations,
  mentorshipSession: mentorshipSessionOperations,
  systemLog: systemLogOperations
};
