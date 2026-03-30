const fs = require('fs');
const path = require('path');

function replaceLinkWithCDN(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceLinkWithCDN(fullPath);
        } else if (fullPath.endsWith('.ejs')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content.replace('<link rel="stylesheet" href="/css/style.css">', '<script src="https://cdn.tailwindcss.com"></script>');
            fs.writeFileSync(fullPath, content);
            console.log('Updated: ' + fullPath);
        }
    });
}
replaceLinkWithCDN(path.join(__dirname, 'views'));
