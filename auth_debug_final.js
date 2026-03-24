const bcrypt = require('bcryptjs');
const hash = '$2b$10$4RKOnpZfyvfNb1VS3ADIx.KuY4YpcqIQPfky8nBnVA';
const password = 'admin123';

bcrypt.compare(password, hash, function(err, res) {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Match:', res);
});
