const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'lib', 'firebase-db.ts');
let content = fs.readFileSync(dbPath, 'utf8');

// The faulty pattern is:
// async findUnique(options: { where: any, select?: any }): Promise<TYPE | null> {
//   const q = query(collection(db, "COLLECTION"), where(options.where.field, "==", options.where.value));
//   const snapshot = await getDocs(q);
//   if (snapshot.empty) return null;
//   return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as TYPE;
// }

// I will just replace the implementation of findUnique dynamically using regex

content = content.replace(/async findUnique\(options: \{ where: any(?:, select\?: any)? \}\): Promise<([^>]+) \| null> \{\s+const q = query\(collection\(db, "([^"]+)"\), where\(options\.where\.field, "==", options\.where\.value\)\);\s+const snapshot = await getDocs\(q\);\s+if \(snapshot\.empty\) return null;\s+return \{ id: snapshot\.docs\[0\]\.id, \.\.\.snapshot\.docs\[0\]\.data\(\) \} as \1;\s+\}/g, 
`async findUnique(options: { where: any, select?: any }): Promise<$1 | null> {
    if (options.where.id) {
      const docRef = doc(db, "$2", options.where.id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as $1;
    }
    const field = Object.keys(options.where)[0];
    const value = options.where[field];
    const q = query(collection(db, "$2"), where(field, "==", value));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as $1;
  }`);

// For some methods, the signature doesn't have select?: any
content = content.replace(/async findUnique\(options: \{ where: any \}\): Promise<([^>]+) \| null> \{\s+const q = query\(collection\(db, "([^"]+)"\), where\(options\.where\.field, "==", options\.where\.value\)\);\s+const snapshot = await getDocs\(q\);\s+if \(snapshot\.empty\) return null;\s+return \{ id: snapshot\.docs\[0\]\.id, \.\.\.snapshot\.docs\[0\]\.data\(\) \} as \1;\s+\}/g, 
`async findUnique(options: { where: any }): Promise<$1 | null> {
    if (options.where.id) {
      const docRef = doc(db, "$2", options.where.id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as $1;
    }
    const field = Object.keys(options.where)[0];
    const value = options.where[field];
    const q = query(collection(db, "$2"), where(field, "==", value));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as $1;
  }`);

fs.writeFileSync(dbPath, content, 'utf8');
console.log("findUnique functions updated.");
