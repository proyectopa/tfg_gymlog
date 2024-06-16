// const bcrypt = require('bcrypt');

// // Función para generar usuarios y sus consultas SQL
// async function generateUsers() {
//   const queries = [];
//   for (let i = 1; i <= 50; i++) {
//     const email = `usuario${i}@gmail.com`;
//     const password = `Ejemplo${i}`;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const query = `INSERT INTO usuario (contrasena, correo, nombre) VALUES ('${hashedPassword}', '${email}', 'Usuario${i}');`;
//     queries.push(query);
//   }

//   // Imprime las consultas SQL
//   queries.forEach(query => console.log(query));
// }

// // Ejecuta la función
// generateUsers().catch(err => console.error(err));


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
  
  console.log(query);
})();
