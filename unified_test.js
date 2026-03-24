const bcrypt = require('bcryptjs');
const password = 'admin123';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
const isMatch = bcrypt.compareSync(password, hash);
console.log('Hash:', hash);
console.log('Match Check:', isMatch);
