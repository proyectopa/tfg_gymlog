const jwt = require('jsonwebtoken')
const connection = require('./../database/connection')
require('dotenv').config()

// FUNCIONES MIDDLEWARE. 
// Se ejecutan antes de la mayoría de los controladores para verificar la identidad del usuario y 
// guardar datos como su id en la petición.

// verifico si el usuario tiene una sesión (un token valido)
const requireAuth = (req, res, next) => {
    // obtener cookie con el token
    const token = req.cookies.jwt
    
    // si no existe no tiene acceso y se redirecciona a login
    if(!token) {
        res.redirect('/login')
        return
    }
        
    // si existe se verifica que sea válido y no haya caducado
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
        if(err) {
            res.redirect('/login')
            return
        }

        // si no hay un error guardo el token en la petición para poder usarla desde la funcion principal
        // para ver el id del usuario y paso a la siguiente funcion
        res.locals.userId = decodedToken.id
        next()

    })
}


function checkUser (req, res, next) {
    const token = req.cookies.jwt
    
    // si no existe no tiene acceso y se redirecciona a login
    res.locals.email = null
    if(!token) {
        // res.locals.user = null
        res.locals.email = null
        next()
        return
    }

    // si se detecta un token se verifica si es válido y no se ha editado
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
        // verifico si hay token. Si no hay continuo
        try {
            if(err) {
                throw new Error(err)
            }
            
            // si hay obtengo su id para ver el usuario y correo
            const [rows] = await connection.query(`
            SELECT correo FROM usuario WHERE id = ?;
            `, [decodedToken.id])
    
            // si hay resultados guardo el correo e idUsuario en la peticion
            if(rows[0] && rows[0].correo) {
                res.locals.email = rows[0].correo
                res.locals.userId = decodedToken.id;
            }
    
            next()
            return
        } catch (error) {
            // res.locals.user = null
            res.locals.userId = null
            res.locals.email = null
            next()
            return
        }
        

    })

}

module.exports = { requireAuth, checkUser }