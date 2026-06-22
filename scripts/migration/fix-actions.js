const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app', 'actions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // Fix .create({ data: { ... } })
    content = content.replace(/\.create\(\{\s*data:\s*\{([\s\S]*?)\}\s*\}\)/g, '.create({$1})');
    
    // Fix .update({ where: { id: something }, data: { ... } })
    content = content.replace(/\.update\(\{\s*where:\s*\{\s*id:\s*([a-zA-Z0-9_]+)\s*\},\s*data:\s*\{([\s\S]*?)\}\s*\}\)/g, '.update($1, {$2})');
    
    // Fix .update({ where: { field: "id", value: something }, data: { ... } }) -> This might exist
    content = content.replace(/\.update\(\{\s*where:\s*\{\s*field:\s*"id",\s*value:\s*([a-zA-Z0-9_]+)\s*\},\s*data:\s*\{([\s\S]*?)\}\s*\}\)/g, '.update($1, {$2})');

    // Fix .delete({ where: { id: something } })
    content = content.replace(/\.delete\(\{\s*where:\s*\{\s*id:\s*([a-zA-Z0-9_]+)\s*\}\s*\}\)/g, '.delete($1)');
    
    fs.writeFileSync(path.join(dir, file), content);
});

console.log("Fixed Prisma remnants in actions.");
