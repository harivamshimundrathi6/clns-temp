import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";

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

async function makeAdmin() {
  console.log("Searching for test@bwmyga.com...");
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", "test@bwmyga.com"));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("Could not find user test@bwmyga.com");
    return;
  }
  
  const userDoc = snapshot.docs[0];
  console.log(`Found user! Current role: ${userDoc.data().role}`);
  
  console.log("Updating role to ADMIN...");
  await updateDoc(doc(db, "users", userDoc.id), {
    role: "ADMIN"
  });
  
  console.log("Success! test@bwmyga.com is now an ADMIN.");
}

makeAdmin().catch(console.error);
