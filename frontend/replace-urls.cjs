const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');
const servicesPath = path.join(__dirname, 'services');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace standard 'http://localhost:5000/api/...' in fetch or consts
    content = content.replace(/'http:\/\/localhost:5000\/api(.*?)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}$1`");
    // Replace template literals `http://localhost:5000/api/...`
    content = content.replace(/`http:\/\/localhost:5000\/api(.*?)`/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}$1`");
    
    // Fix specific cases for constants
    if (filePath.endsWith('api.js') || filePath.endsWith('teamService.js')) {
        content = content.replace(/const BASE_URL = `\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000\/api'}`/, "const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'");
        content = content.replace(/const API_URL = `\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000\/api'}\/teams`/, "const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/teams`");
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    }
}

walk(directoryPath);
if (fs.existsSync(servicesPath)) {
    walk(servicesPath);
}
