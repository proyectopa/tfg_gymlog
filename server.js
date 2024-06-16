// servidor, variables de entorno, cookies
const express = require('express')
require('dotenv').config()
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')
const app = express()


// middlewares. Ruta de archivos estaticos, pasar json bodya objetos js y meterlos en el req.body, manejar cookies
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

// motor de plantillas
app.set('view engine', 'ejs')

// iniciar servior
const port = process.env.PORT
app.listen(port)

// por defecto las url se manejan en authroutes
app.use(authRoutes)

