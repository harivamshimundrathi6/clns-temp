import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

export interface Affiliation {
  id?: string;
  name: string;
  description: string;
  logoUrl: string;
  websiteLink: string;
  isFeatured?: boolean;
  createdAt?: number;
}

const COLLECTION_NAME = "affiliations";

// Add a new affiliation
export const addAffiliation = async (data: Omit<Affiliation, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: Date.now(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error adding affiliation:", error);
    return { success: false, error: error.message };
  }
};

// Get all affiliations
export const getAffiliations = async (): Promise<Affiliation[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Affiliation[];
    
    return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error("Error getting affiliations:", error);
    return [];
  }
};

// Update affiliation
export const updateAffiliation = async (id: string, data: Partial<Affiliation>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating affiliation:", error);
    return { success: false, error: error.message };
  }
};

// Delete affiliation
export const deleteAffiliation = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting affiliation:", error);
    return { success: false, error: error.message };
  }
};
