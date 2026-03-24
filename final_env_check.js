const bcrypt = require('bcryptjs');
const fs = require('fs');
const dotenv = require('dotenv');

// Read directly from .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const hash = envConfig.ADMIN_PASSWORD_HASH;
const password = 'admin123';

console.log('Testing Password Match against .env.local hash...');
bcrypt.compare(password, hash, function(err, res) {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Result:', res ? 'SUCCESS' : 'FAILURE');
});
