const { Router } = require('express')
const authController = require('./../controllers/authController')
const analysisController = require('./../controllers/analysisController')
const exerciseController = require('./../controllers/exerciseController')
const calendarController = require('./../controllers/calendarController')
const { requireAuth, checkUser } = require('../middleware/authMiddleware')
require('dotenv').config()

const router = Router() 

// en todas las rutas intento obtener los datos de usuario y pasarselos a la plantilla ejs
router.get('*', checkUser)

// redirijo peticiones de / a /home
// obtengo el email del administrador de la aplicación y lo paso a la plantilla ejs para que los
// usuarios puedan contactar con él de manera sencilla
const adminEmail = process.env.ADMIN_EMAIL
router.get('/', (req, res) => res.redirect('/home'))
router.get('/home', (req, res) => res.render('home', { adminEmail }))

// rutas login/signup
router.get('/signup', authController.signup_get)
router.post('/signup', authController.signup_post)
router.get('/login', authController.login_get)
router.post('/login', authController.login_post)
router.get('/logout', authController.logout_get)


// rutas que requieren acceso. RequireAuth comprueba el acceso y redirecciona a /login si no tiene 

// paginas principales
router.get('/calendar', requireAuth, (req, res) => res.render('calendar'))
router.get('/exercises', requireAuth, (req, res) => res.render('exercises'))
router.get('/analysis', requireAuth, (req, res) => res.render('analysis'))
router.get('/account', requireAuth, (req, res) => res.render('account'))

// rutas de las peticiones ajax de la pagina calendario
router.get('/events', requireAuth, calendarController.events_get)
router.get('/trainning', requireAuth, calendarController.trainning_get)
router.post('/saveTraining', requireAuth, calendarController.saveTraining_post) 
router.post('/buscar-ejercicios', requireAuth, calendarController.exercises_get)

// rutas de las peticiones ajax de la pagina ejercicio
router.post('/tag', requireAuth, exerciseController.postTag)
router.get('/tag', requireAuth, exerciseController.getTags)
router.delete('/tag/:id', requireAuth, exerciseController.deleteTag)
router.post('/unit', requireAuth, exerciseController.units_post)
router.get('/unit', requireAuth, exerciseController.units_get)
router.delete('/unit/:id', requireAuth, exerciseController.deleteUnits)
router.post('/exercise', requireAuth, exerciseController.postExercise)
router.get('/exercise', requireAuth, exerciseController.getExercises)
router.delete('/exercise/:id', requireAuth, exerciseController.deleteExercise)

// rutas de las peticiones ajax de la pagina analisis
router.post('/graphData/:idEjercicio', requireAuth, analysisController.exerciseGraph_post)
router.post('/graphLogs/:idEjercicio', requireAuth, analysisController.exerciseLogs_post)

// rutas actualizar/editar cuenta
router.delete('/delete-account', requireAuth, authController.deleteAccount_delete) 
router.post('/update-account-password', requireAuth, authController.updateAccountPassword_post) 
router.post('/update-account-email', requireAuth, authController.updateAccountEmail_post) 

// por último si ninguna ruta coincide redirijo a /home
router.use((req,res) => res.redirect('/home'))

module.exports = router