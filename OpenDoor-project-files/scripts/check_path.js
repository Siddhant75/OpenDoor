const path = require('path');
const fs = require('fs');

console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);
const publicPath1 = path.resolve(__dirname, '../public');
const publicPath2 = path.resolve(__dirname, '../../public');
const publicPathCwd = path.resolve(process.cwd(), 'public');

console.log('Path 1 (../public):', publicPath1, 'exists:', fs.existsSync(publicPath1));
console.log('Path 2 (../../public):', publicPath2, 'exists:', fs.existsSync(publicPath2));
console.log('Path CWD (cwd/public):', publicPathCwd, 'exists:', fs.existsSync(publicPathCwd));
