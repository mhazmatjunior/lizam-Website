const bcrypt = require('bcryptjs');
const fs = require('fs');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
fs.writeFileSync('temp_hash.txt', hash);
console.log('Hash written to temp_hash.txt');
