const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'lib', 'firebase-db.ts');
let content = fs.readFileSync(dbPath, 'utf8');

// Replace everything between // Type definitions and // User operations
const start = content.indexOf('// Type definitions');
const end = content.indexOf('// User operations');

if (start !== -1 && end !== -1) {
    content = content.substring(0, start) + content.substring(end);
    fs.writeFileSync(dbPath, content, 'utf8');
    console.log("Removed local types from firebase-db.ts");
}
