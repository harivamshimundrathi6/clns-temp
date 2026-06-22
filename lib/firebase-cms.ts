import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

export interface ServiceItem {
  id?: string;
  title: string;
  description: string;
  iconName?: string;
  category?: string;
  createdAt?: number;
}

export interface CareerItem {
  id?: string;
  title: string;
  department: string;
  location: string;
  description: string;
  applyLink: string;
  createdAt?: number;
}

export interface ContactItem {
  id?: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  createdAt?: number;
}

// Generic CRUD factory
function createOperations<T>(collectionName: string) {
  return {
    add: async (data: Omit<T, "id" | "createdAt">) => {
      try {
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: Date.now(),
        });
        return { success: true, id: docRef.id };
      } catch (error: any) {
        console.error(`Error adding to ${collectionName}:`, error);
        return { success: false, error: error.message };
      }
    },
    getAll: async (): Promise<T[]> => {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as T[];
        
        // Sort locally so items without createdAt are not excluded
        return items.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      } catch (error) {
        console.error(`Error getting ${collectionName}:`, error);
        return [];
      }
    },
    update: async (id: string, data: Partial<T>) => {
      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, data);
        return { success: true };
      } catch (error: any) {
        console.error(`Error updating ${collectionName}:`, error);
        return { success: false, error: error.message };
      }
    },
    remove: async (id: string) => {
      try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        return { success: true };
      } catch (error: any) {
        console.error(`Error deleting from ${collectionName}:`, error);
        return { success: false, error: error.message };
      }
    }
  };
}

export const servicesCMS = createOperations<ServiceItem>("cms_services");
export const careersCMS = createOperations<CareerItem>("cms_careers");
export const contactCMS = createOperations<ContactItem>("cms_contacts");
