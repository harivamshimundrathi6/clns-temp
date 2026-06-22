const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, query, where, getDocs, doc, setDoc } = require("firebase/firestore");
const bcrypt = require("bcryptjs");

const firebaseConfig = {
  apiKey: "AIzaSyBA_u5h_tZh6_gxgoA4Ar1Wr6wmiWOhpiQ",
  authDomain: "clns-backend.firebaseapp.com",
  projectId: "clns-backend",
  storageBucket: "clns-backend.firebasestorage.app",
  messagingSenderId: "1093693694119",
  appId: "1:1093693694119:web:a3d6733bccbce0f9c17b82"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedFirebase() {
  console.log("Seeding Firebase database...");
  
  const password = await bcrypt.hash("password123", 10);

  const users = [
    { email: "admin@clns.com", name: "Admin User", role: "ADMIN", status: "ACTIVE", password },
    { email: "advocate@clns.com", name: "Advocate User", role: "ADVOCATE", status: "VERIFIED", password },
    { email: "client@clns.com", name: "Client User", role: "CLIENT", status: "ACTIVE", password },
    { email: "student@clns.com", name: "Student User", role: "STUDENT", status: "ACTIVE", password },
  ];

  for (const user of users) {
    // Check if user exists
    const q = query(collection(db, "users"), where("email", "==", user.email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await addDoc(collection(db, "users"), {
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }

  // Create some sample data
  const usersSnapshot = await getDocs(collection(db, "users"));
  const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const admin = userList.find(u => u.role === "ADMIN");
  const advocate = userList.find(u => u.role === "ADVOCATE");
  const client = userList.find(u => u.role === "CLIENT");
  const student = userList.find(u => u.role === "STUDENT");

  if (advocate && client) {
    // Create a sample case
    const casesQ = query(collection(db, "cases"), where("clientId", "==", client.id));
    const casesSnapshot = await getDocs(casesQ);
    
    if (casesSnapshot.empty) {
      await addDoc(collection(db, "cases"), {
        title: "Sample Legal Case",
        description: "This is a sample case for testing",
        type: "General",
        status: "OPEN",
        clientId: client.id,
        advocateId: advocate.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log("Created sample case");
    }
  }

  if (advocate) {
    // Create a sample internship posting
    const postingsQ = query(collection(db, "internshipPostings"), where("authorId", "==", advocate.id));
    const postingsSnapshot = await getDocs(postingsQ);
    
    if (postingsSnapshot.empty) {
      await addDoc(collection(db, "internshipPostings"), {
        title: "Legal Internship",
        company: "Law Firm ABC",
        location: "New York",
        description: "Great opportunity for law students",
        type: "Full-time",
        status: "OPEN",
        authorId: advocate.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log("Created sample internship posting");
    }
  }

  console.log("Firebase seeding completed!");
}

seedFirebase().catch(console.error);
