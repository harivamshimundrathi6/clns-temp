import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function checkUsers() {
    const snapshot = await getDocs(collection(db, "users"));
    console.log("Total users:", snapshot.size);
    snapshot.forEach(doc => {
        console.log(doc.id, "=>", doc.data().email, doc.data().role, doc.data().status);
    });
    process.exit(0);
}

checkUsers();
