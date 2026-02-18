const bcrypt = require('bcryptjs');

const password = 'admin123'; // Cambia esto por la contraseña que quieras
bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log('Tu contraseña hasheada es:');
    console.log(hash);
    console.log('\nCopia este hash y pégalo en la base de datos (tabla users).');
});
