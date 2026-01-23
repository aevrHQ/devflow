#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Add .js to relative imports (./xxx or ../xxx) that don't already have it
      content = content.replace(
        /from\s+['"](\.[^'"]*?)(?<!\.js)['"]/g,
        (match, importPath) => `from '${importPath}.js'`
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });
}

try {
  fixImports(distDir);
  console.log('✓ Import paths fixed');
} catch (err) {
  console.error('✗ Error fixing imports:', err);
  process.exit(1);
}

