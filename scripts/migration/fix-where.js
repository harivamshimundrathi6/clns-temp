const fs = require('fs');
const path = require('path');

function walkSync(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        let filepath = path.join(dir, file);
        let stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walkSync(filepath, callback);
        } else if (stat.isFile() && (filepath.endsWith('.ts') || filepath.endsWith('.tsx'))) {
            callback(filepath);
        }
    });
}

const dir = path.join(__dirname, 'app');
walkSync(dir, (filepath) => {
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;
    
    // Replace { field: "xxx", value: yyy } with { xxx: yyy }
    content = content.replace(/where:\s*\{\s*field:\s*"([^"]+)",\s*value:\s*([^}]+)\s*\}/g, (match, field, value) => {
        return `where: { ${field}: ${value.trim()} }`;
    });

    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log("Fixed:", filepath);
    }
});
