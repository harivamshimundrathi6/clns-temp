const fs = require('fs');
const path = require('path');

function processDirectory(dir, isComponent) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath, isComponent);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            if (isComponent) {
                // Remove Prisma imports
                if (content.includes('@prisma/client')) {
                    content = content.replace(/import\s+{.*}\s+from\s+['"]@prisma\/client['"];?\n?/g, '');
                    modified = true;
                }
            } else {
                // Fix db.model.create({ data: { ... } })
                // We'll just replace 'data: {' with nothing and remove the closing brace.
                // A regex approach: replace `data: {\n(.*?)\n\s*}` with `$1` inside `.create(` or `.update(` calls.
                const regex = /(create|update)\(\{\s*data:\s*\{([\s\S]*?)\}(,\s*)?\s*\}\)/g;
                if (regex.test(content)) {
                    content = content.replace(regex, '$1({$2})');
                    modified = true;
                }
                
                const regex2 = /(create|update)\(\{\s*where:\s*\{([^}]*)\},\s*data:\s*\{([\s\S]*?)\}(,\s*)?\s*\}\)/g;
                if (regex2.test(content)) {
                    content = content.replace(regex2, 'update($2 /* TODO check where */, {$3})');
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed', fullPath);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'components'), true);
processDirectory(path.join(__dirname, 'app/api'), false);
