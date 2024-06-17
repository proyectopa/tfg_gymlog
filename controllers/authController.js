const connection = require('./../database/connection')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// RUTAS RELACIONADAS CON CUENTAS DE USUARIO Y SESIONES.


// crear token que guarda el id del usuario utilizando la clave secreta y la caducidad (s) 
const maxAgeSeconds = 3*24*60*60 
const createToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: maxAgeSeconds
    })
}

    // ruta página registrarse
    module.exports.signup_get = (req, res) => {
        res.render('signup')
    }
    
    // ruta página login
    module.exports.login_get = (req, res) => {
        res.render('login')
    }


// verificar si la contraseña es segura usando regex
function isStrongPassword(password) {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    
    if ( password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber ) return true
    return false
    
}

// ruta de registrarse. Verifica los datos introducidos y crea un usuario, y devuelve un token para iniciar sesión automaticamente.
module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body
    
    try {
        // se verifica si el email es válido
        if(!isEmail(email)) throw new Error('Introduce un correo válido')
            
        // Comprobar si el usuario ya existe
        const [rows] = await connection.query('SELECT correo FROM usuario WHERE correo = ?', [email]);
        if (rows.length > 0) {
            throw new Error('Ya existe un usuario con ese correo');
        }
        
        // comprobar si la contraseña cumple los requisitos de seguridad
        if (!isStrongPassword(password)) throw new Error('Introduce una contraseña válida con 8 carácteres mínimo: un número y mayúsculas y minúsculas')
            
        // se crea el usuario con el correo y el hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10)
        const insert = await connection.query(`
        INSERT INTO usuario (contrasena, correo)
        VALUES(? , ?); 
        `, [hashedPassword, email])
            
            // si se ha creado bien se devuelve un token para ese usuario y se le guarda en una cookie
            const newId = (insert[0] && insert[0].insertId)
            const token = createToken(newId)
            
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: maxAgeSeconds * 1000 
            })
            
            res.status(201).json({ user: newId })
        } catch (err) {
            // si hay algun fallo se lanza un error con un mensaje que se maneja desde aquí
            // si hay algun error se gestiona y se envia el mensaje de error correspondiente
            if(err.sqlMessage == "Column 'contrasena' cannot be null") {
                res.status(400).json({errors :{ email: 'Introduce una contraseña válida'}})
            }
            if(err.sqlMessage == "Column 'correo' cannot be null") {
                res.status(400).json({errors: { password: 'Introduce un correo válido'}})
            }
            if (/Duplicate entry .* for key 'usuario.unique_correo'/.test(err.sqlMessage)) {
                res.status(400).json({errors: { email: 'Ya existe una cuenta con ese email'}})
            } 
            if(err.message == 'Introduce un correo válido') {
                res.status(400).json({errors: {email: 'Introduce un email válido'}})
            } 
            if(err.message == 'Introduce una contraseña válida con 8 carácteres mínimo: un número y mayúsculas y minúsculas') {
                res.status(400).json({errors: { password: 'Introduce una contraseña válida con 8 carácteres mínimo, un número y mayúsculas y minúsculas'}})
            }
            if(err.message == 'Ya existe un usuario con ese correo') {
                res.status(400).json({errors: { email: 'Ya existe un usuario con ese correo '}})
            }
            if(!res.headersSent) {
                res.status(400).json({errors: { general: "Error, vuelve a intentarlo", err: err.message}})
            }
            
        }
    }
    
    
    
    // ruta login. Recibe email y contraseña, devuelve un token que se verifica en todas las rutas protegidas
    module.exports.login_post = async (req, res) => {
        
        // Obtengo el email y contraseña del cuerpo de la petición
        const { email, password } = req.body;
        
        try {
            // Se verifica si existe el usuario
            const [rows] = await connection.query('SELECT * FROM usuario WHERE correo = ?', [email]);
            if (rows.length === 0) {
                throw new Error('No existe una cuenta con ese email');
            }
            
            const user = rows[0];
            
            // Se compara la contraseña de la bbdd (hasheada) con el hash de la contraseña introducida
            const match = await bcrypt.compare(password, user.contrasena);
            if (!match) {
                throw new Error('Contraseña incorrecta');
            }
            
            
            // Si la contraseña coincide es correcta y se crea un token y se manda a una cookie
            const token = createToken(user.id);
            
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: maxAgeSeconds * 1000 // ms
            });
            
            res.status(200).json({ user: user.id });
            
        } catch (err) {
            // Manejo los posibles errores para enviar una respuesta con la que el cliente pueda mostrar un error especifico
            if(err.message == "No existe una cuenta con ese email") {
                res.status(400).json({errors :{ email: 'No existe una cuenta con ese email'}})
                return
            }
            if(err.message == "Contraseña incorrecta") {
                res.status(400).json({errors: { password: 'Contraseña incorrecta'}})
                return
            }
            if(!res.headersSent) {
                res.status(400).json({errors: { general: "Error, vuelve a intentarlo", err: err.message}})
            }
        }
    }
    
    // ruta cerrar sesión. Se borra el token y se redirige a /home
    module.exports.logout_get = function(req, res) {
        // se obtiene la cookie que contiene el token del usuario (y guarda su sesión) y se borra (se le da vida de 1ms)
        res.cookie('jwt', '', { maxAge: 1 })
        res.redirect('/')
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    // --------------------------------
    
    module.exports.deleteAccount_delete = async (req, res) => {
        const userId = res.locals.userId;
        
        try {
            // Verificar que userId esté presente y sea válido (podrías agregar validaciones adicionales aquí)
            if (!userId) {
                throw new Error('No se encontró el userId en res.locals');
            }
            
            // Consulta para eliminar usuario y sus datos relacionados
            const sqlDeleteUser = `
            DELETE FROM usuario WHERE id = ?
        `;
            
            // Ejecutar la consulta
            await connection.query(sqlDeleteUser, [userId])
            
            res.status(200).json({ message: `Usuario con id ${userId} eliminado correctamente` });
            
        } catch (error) {
            res.status(500).json({ error: 'Error interno al eliminar usuario' });
        }
    };
    
    
    module.exports.updateAccountPassword_post = async (req, res) => {
        const { password } = req.body;
        const userId = res.locals.userId;
        
        try {
            // Validar la contraseña
            if (!isStrongPassword(password)) {
                throw new Error('Introduce una contraseña válida con 8 caracteres mínimo, un número y mayúsculas y minúsculas');
            }
            
            // Generar hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Actualizar la contraseña en la base de datos
            await connection.query('UPDATE usuario SET contrasena = ? WHERE id = ?', [hashedPassword, userId]);
            
            res.status(200).json({ message: 'Contraseña actualizada correctamente' });
        } catch (error) {
            if(error.message == 'Introduce una contraseña válida con 8 caracteres mínimo, un número y mayúsculas y minúsculas') {
                res.status(400).json({errors: { password: 'Introduce una contraseña válida con 8 caracteres mínimo, un número y mayúsculas y minúsculas'}})
                return
            }
            res.status(400).json({ error: error.message });
        }
        
    }
    
    module.exports.updateAccountEmail_post = async (req, res) => {
        const { email } = req.body;
        const userId = res.locals.userId;
        
        try {
            // Validar el correo electrónico
            if (!isEmail(email)) {
                throw new Error('Introduce un correo electrónico válido');
            }
            
            // Verificar si ya existe un usuario con ese correo electrónico
            const [rows] = await connection.query('SELECT correo FROM usuario WHERE correo = ? AND id != ?', [email, userId]);
            if (rows.length > 0) {
                throw new Error('Ya existe un usuario con ese correo electrónico');
            }
            
            // Actualizar el correo electrónico en la base de datos
            await connection.query('UPDATE usuario SET correo =  ?  WHERE id = ?', [email, userId]);
            
            // Generar un nuevo token con el nuevo correo electrónico
            const token = createToken(userId, email); // Asumiendo que createToken acepta userId y correo electrónico como parámetros
            
            // Guardar el nuevo token en una cookie
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: maxAgeSeconds * 1000 // Tiempo de expiración del token en milisegundos
            });
            res.status(200).json({ message: 'Correo electrónico actualizado correctamente', token });
        } catch (error) {
            if(error.message == 'Introduce un correo electrónico válido') {
                res.status(400).json({errors: { email: 'Introduce un correo electrónico válido'}})
                return
            }
            if(error.message == 'Ya existe un usuario con ese correo electrónico') {
                res.status(400).json({errors: { email: 'Ya existe un usuario con ese correo electrónico'}})
                return
            }
            res.status(400).json({ error: error.message });
            
        }
        
    }
    
    
    
    
    
