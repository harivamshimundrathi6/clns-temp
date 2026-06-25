import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

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

async function deleteMails() {
  console.log("Fetching all test mails from 'mail' collection...");
  const mailCollection = collection(db, "mail");
  const snapshot = await getDocs(mailCollection);
  
  console.log(`Found ${snapshot.size} mails to delete.`);
  
  for (const document of snapshot.docs) {
    await deleteDoc(doc(db, "mail", document.id));
    console.log(`Deleted mail: ${document.id}`);
  }
  
  console.log("All test mails removed successfully!");
}

deleteMails().catch(console.error);
