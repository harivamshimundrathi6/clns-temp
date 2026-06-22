const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'lib', 'firebase-db.ts');
let content = fs.readFileSync(dbPath, 'utf8');

// The faulty pattern is usually:
// q = query(q, orderBy(options.orderBy.createdAt || "createdAt", options.orderBy.order || "desc"));
// or options.orderBy.date || "date"
content = content.replace(/q = query\(q, orderBy\(options\.orderBy\.[a-zA-Z]+ \|\| "[a-zA-Z]+", options\.orderBy\.order \|\| "(asc|desc)"\)\);/g, 
    `const field = Object.keys(options.orderBy)[0];\n      const direction = options.orderBy[field];\n      q = query(q, orderBy(field, direction));`);

fs.writeFileSync(dbPath, content);
console.log("Fixed orderBy bugs.");
