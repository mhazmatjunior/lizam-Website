const bcrypt = require('bcryptjs');
const hash = '$2b$10$.fb9a5H/fJk33FPdmeTipyALoVbQ6KmFY2frw0N/.e';
const password = 'admin123';

bcrypt.compare(password, hash, function(err, res) {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Match:', res);
});
