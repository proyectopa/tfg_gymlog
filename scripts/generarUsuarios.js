

const bcrypt = require('bcrypt');

(async () => {
  const promises = [];
  
  for (let i = 1; i <= 50; i++) {
    const password = `Ejemplo${i}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const email = `usuario${i}@gmail.com`;
    const queryValues = `('${hashedPassword}', '${email}')`;
    promises.push(queryValues);
  }

  const values = await Promise.all(promises);
  const query = `INSERT INTO usuario (contrasena, correo) VALUES ${values.join(', ')};`;
  
})();
