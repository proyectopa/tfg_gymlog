const connection = require('./../database/connection')

// RUTAS USADAS DESDE LA PAGINA CALENDARIO

// obtener etiquetas mes actual
module.exports.events_get = async (req, res) => { 
    try {
        // obtengo el mes y año de la peticion
        const month = req.query.month
        const year = req.query.year
        
        const sql = `
        SELECT DATE(SERIE.fecha) AS fecha, ETIQUETA.nombre AS etiqueta, ETIQUETA.color
        FROM SERIE
        JOIN EJERCICIO ON SERIE.idEjercicio = EJERCICIO.id
        JOIN EJERCICIO_ETIQUETA ON EJERCICIO.id = EJERCICIO_ETIQUETA.idEjercicio
        JOIN ETIQUETA ON EJERCICIO_ETIQUETA.idEtiqueta = ETIQUETA.id
        WHERE MONTH(SERIE.fecha) = ? AND YEAR(SERIE.fecha) = ? AND SERIE.idUsuario = ?
        GROUP BY DATE(SERIE.fecha), ETIQUETA.nombre, ETIQUETA.color
        `

        const [rows] = await connection.query(sql, [month, year, res.locals.userId])
        
        // Crear un array de eventos en el formato que usa fullcalendar (la librería de calendario del cliente)
        const events = rows.map(row => ({
            title: row.etiqueta,
            start: row.fecha,
            backgroundColor: row.color,
            borderColor: row.color,
            editable: false
        }))
        
        res.json({ events })
    } catch (error) {
        // Capturo posibles errores y envío un mensaje de error
        res.status(500).json({ error: 'Error al obtener los eventos del calendario' })
    }
}







// obtener entrenamiento fecha seleccionada (todos los ejercicios y sus series)
module.exports.trainning_get = async (req, res) => { 
    try {
        // obtengo la fecha seleccionada y le cambio el formato para hacer la consulta
        const fecha = req.query.fecha
        const formattedDate = fecha.split('-').reverse().join('-') // aaaa-mm-dd
        
        // obtengo el entrenamiento fecha, id ejercicio, nombre ejercicio, unidad1 y unidad2, serie id y sus valores
        // que pertenezca al usuario y a la fecha seleccionada
        const [rows] = await connection.execute(`
        SELECT 
        SERIE.fecha AS fechaEntrenamiento,
        EJERCICIO.id AS idEjercicio,
        EJERCICIO.nombre AS nombreEjercicio,
        UNIDAD.unidad1 AS unidad1Ejercicio,
        UNIDAD.unidad2 AS unidad2Ejercicio,
        SERIE.id AS idSerie,
        SERIE.valor1 AS valor1Serie,
        SERIE.valor2 AS valor2Serie,
        SERIE.nota AS notaSerie
        FROM 
        SERIE
        JOIN 
        EJERCICIO ON SERIE.idEjercicio = EJERCICIO.id
        JOIN 
        UNIDAD ON EJERCICIO.idUnidad = UNIDAD.id
        WHERE
        DATE(SERIE.fecha) = ? AND
        SERIE.idUsuario = ?
        `, [formattedDate, res.locals.userId])
        
        // creo el objeto que se enviará al usuario
        const entrenamiento = {
            fecha: fecha,
            ejercicios: []
        }
        
        // recorro los resultados de la consulta para meter los datos en el objeto que se devuelve al usuario
        // formateo los datos necesarios y elimino registros innecesarios
        rows.forEach(row => {
            const idEjercicio = row.idEjercicio
            const idSerie = row.idSerie
            
            // busco si ya se ha insertado el objeto ejercicio en el array ejercicios
            let ejercicio = entrenamiento.ejercicios.find(ej => ej.idEjercicio === idEjercicio);
            
            // si el ejercicio aún no está en el array, lo agrego con los datos del ejercicio 
            // y creo un array para meter todas sus series
            if (!ejercicio) {
                ejercicio = {
                    idEjercicio: idEjercicio,
                    nombre: row.nombreEjercicio,
                    unidad1: row.unidad1Ejercicio,
                    unidad2: row.unidad2Ejercicio,
                    series: []
                }
                entrenamiento.ejercicios.push(ejercicio)
            }
            
            // añado cada serie al objeto ejercicio creado y a su array series
            ejercicio.series.push({
                idSerie: idSerie,
                valor1: row.valor1Serie,
                valor2: row.valor2Serie,
                nota: row.notaSerie
            })
        })
        
        res.json({ entrenamiento })
    } catch (error) {
        // detecto errores y envío un mensaje de error para poder manejarlo desde el cliente
        res.status(500).json({ error: 'Error al obtener el entrenamiento' })
    }
}



// guardar/actualizar entrenamiento. Todos sus ejercicios y sus series
module.exports.saveTraining_post = async (req, res) => {
    // obtengo los datos del entrenamiento
    const userId = res.locals.userId
    const ejercicio = req.body.ejercicio
    const fechaEntrenamiento = req.body.fechaEntrenamiento

    try {
        // Inicio una transacción para poder deshacer cambios que ya he hecho
        // en caso de que alguno de los pasos de la función falle
        await connection.query("START TRANSACTION")
        
        // Eliminar todas las series del ejercicio para esa fecha y usuario
        await connection.query(`
        DELETE FROM SERIE
        WHERE idUsuario = ? AND idEjercicio = ? AND fecha = ?
        `, [userId, ejercicio.idEjercicio, fechaEntrenamiento])
        
        // Insertar las nuevas series (si existen)
        if (ejercicio.series && ejercicio.series.length > 0) {
            for (const serie of ejercicio.series) {
                await connection.query(`
                INSERT INTO SERIE (idEjercicio, valor1, valor2, nota, fecha, idUsuario)
                VALUES (?, ?, ?, ?, ?, ?)
                `, [ejercicio.idEjercicio, serie.valor1, serie.valor2, serie.nota, fechaEntrenamiento, userId])
            }
        }
        
        // si no ha habido ningún error finalizo la transacción y aplico los cambios
        await connection.query("COMMIT")
        res.status(200).json({ message: 'Entrenamiento guardado correctamente' })
    } catch (error) {
        // En caso de error en alguno de los pasos revierto todos los cambios usando rollback en la transacción
        await connection.query("ROLLBACK")
        res.status(500).json({ error: 'Error al guardar el entrenamiento' })
    }
}







// buscar ejercicios - pasas texto, etiquetas y devuelve los ejercicios que 
// tengan ese nombre y etiquetas: {nombre, id, uds, [{etiquetas}]}
module.exports.exercises_get = async (req, res) => {
    // obtengo los datos pasados y doy valores predefinidos en el caso de que no se pase alguno
    const query = req.body.query || ''
    const etiquetas = req.body.etiquetas || []
    const userId = res.locals.userId

    // función para obtener los ejercicios
    async function obtenerEjercicios(query, etiquetas, userId) {
        
        // consulta para obtener el id, nombre, unidades y array de objetos etiquetas del ejercicio que coincida con 
        // la consulta del nombre
        let sql = `
            SELECT e.id, e.nombre, u.unidad1, u.unidad2,
                   JSON_ARRAYAGG(JSON_OBJECT('nombre', t.nombre, 'color', t.color, 'id', t.id)) AS etiquetas
            FROM EJERCICIO e
            LEFT JOIN EJERCICIO_ETIQUETA ee ON e.id = ee.idEjercicio
            LEFT JOIN ETIQUETA t ON ee.idEtiqueta = t.id
            LEFT JOIN UNIDAD u ON e.idUnidad = u.id
            WHERE e.nombre LIKE ? AND e.idUsuario = ?
        `

        const params = [`%${query}%`, userId]

        // si paso un array de etiquetas añado más codigo a la consulta para añadir que el id de la etiqueta 
        // coincida con alguno de las etiquetaas pasadas
        if (etiquetas && etiquetas.length > 0) {
            const placeholders = etiquetas.map(() => '?').join(',')
            sql += ` AND t.id IN (${placeholders})`
            params.push(...etiquetas)
        }

        // por último reduzco los datos agrupando por varios campos y por eficiencia limito los resultados a 30 registros
        sql += ' GROUP BY e.id, e.nombre, u.unidad1, u.unidad2 LIMIT 30'

        const [rows] = await connection.execute(sql, params)

        return rows
    }

    try {
        // obtengo losejercicios y los devuelvo
        const ejercicios = await obtenerEjercicios(query, etiquetas, userId)
        res.json(ejercicios)
    } catch (error) {
        // en el caso de error envio un mensaje 
        res.status(500).json({ error: 'Error al buscar ejercicios' })
    
    }

}

