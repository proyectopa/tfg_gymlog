const mysql2 = require('mysql2')

// conexion bbdd

// obtengo las variables del fichero /.env que contienen la información 
// de la conexión a la bbdd
const connection = mysql2.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT

    
    // host: process.env.MYSQL_HOST,
    // user: process.env.MYSQL_USER,
    // password: process.env.MYSQL_PASSWORD,
    // database: process.env.MYSQL_DATABASE,
    // port: process.env.MYSQL_PORT

    // host: process.env.MYSQL_HOST || '127.0.0.1',
    // user: process.env.MYSQL_USER || 'root',
    // password: process.env.MYSQL_PASSWORD || '1234',
    // database: process.env.MYSQL_DATABASE || 'proyecto2',
    // port: process.env.MYSQL_PORT || 3306 
}).promise()

  

module.exports = connection


