const bcrypt = require('bcryptjs');
const hash = '$2b$10$Uag37FXaJJfJtDpj5qHkruIpFXbGa/izfk/M/iTzl0l7/TgCFo4CG';
const password = 'admin123';

console.log('Final check for admin123...');
console.log('Result:', bcrypt.compareSync(password, hash) ? 'SUCCESS' : 'FAILURE');
