const connection = require('./../database/connection')


// obtiene los datos del gráfico de un ejercicio
module.exports.exerciseGraph_post = async (req, res) => {
    try {
        // recibe dos fechas, valor (si obtendrá valores de la primera o segunda unidad), y el id del ejercicio
        const { valor, fecha1, fecha2 } = req.body
        const idEjercicio = req.params.idEjercicio
        const userId = res.locals.userId
        
        console.log(4)
        // obtengo la fecha y el valor máximo (del valor1 y valor2, depende de cual se haya pedido) por día. Un único registro por fecha
        const sql = `
    SELECT 
            fecha, 
            CASE 
                WHEN ? = 'valor1' THEN MAX(valor1)
                WHEN ? = 'valor2' THEN MAX(valor2)
            END AS valor_maximo
        FROM 
            SERIE
        WHERE 
            idEjercicio = ? 
            AND fecha BETWEEN ? AND ?
            AND idUsuario = ?
        GROUP BY 
            fecha
        ORDER BY 
            fecha ASC; 
    `
        
        // busco los resultados
        const [rows] = await connection.query(sql, [valor, valor, idEjercicio, fecha1, fecha2, userId]);       
        
        // guardo los datos en el formato que usa js (la librería D3) para pintar el gráfico
        const datosFormateados = rows.map(row => ({
            fecha: row.fecha.toISOString().split('T')[0],  // 'aaaa-mm-dd'
            valor: row.valor_maximo
        }));
        
        res.status(200).json(datosFormateados);
    } catch (error) {
        // Si hay algun error lo capturo y envio un mensaje
        res.status(500).json({ error: 'Error al obtener los datos del gráfico' });
    }
}





module.exports.exerciseLogs_post = async (req, res) => {
    try {
        // Recibir parámetros del cuerpo de la solicitud y de los parámetros de ruta
        const { valor, fecha1, fecha2 } = req.body;
        const idEjercicio = req.params.idEjercicio;
        const userId = res.locals.userId;
        
        // Consulta SQL para obtener las series entre las fechas especificadas, ordenadas por fecha ascendente
        const sql = `
        SELECT 
        Serie.id AS idSerie,
        Ejercicio.nombre AS nombreEjercicio,
        Unidad.unidad1,
        Unidad.unidad2,
        Serie.valor1,
        Serie.valor2,
        Serie.fecha
        FROM 
        serie AS Serie
        INNER JOIN ejercicio AS Ejercicio ON Serie.idEjercicio = Ejercicio.id
        INNER JOIN unidad AS Unidad ON Ejercicio.idUnidad = Unidad.id
        WHERE 
        Serie.idEjercicio = ? 
        AND Serie.fecha BETWEEN ? AND ?
        AND Serie.idUsuario = ?
        ORDER BY 
        Serie.fecha ASC; 
        `;
        
        // Ejecutar la consulta SQL
        const [rows] = await connection.query(sql, [idEjercicio, fecha1, fecha2, userId]);
        
        // Objeto para agrupar las series por fecha
        const seriesPorFecha = {};
        
        // Formatear los resultados según el requerimiento
        rows.forEach(row => {
            const { fecha, idSerie, nombreEjercicio, unidad1, unidad2, valor1, valor2 } = row;
            
            if (!seriesPorFecha[fecha]) {
                seriesPorFecha[fecha] = [];
            }
            
            seriesPorFecha[fecha].push({
                idSerie,
                nombreEjercicio,
                ud1: unidad1,
                ud2: unidad2,
                valor1,
                valor2
            });
        });
        
        // Convertir el objeto a un array de objetos con el formato solicitado
        const resultadosFormateados = Object.keys(seriesPorFecha).map(fecha => ({
            fecha,
            series: seriesPorFecha[fecha]
        }));
        
        console.log(resultadosFormateados);
        console.log(33333);
        
        // Enviar la respuesta con los datos formateados
        res.status(200).json(resultadosFormateados);
    } catch (error) {
        // Manejar errores y enviar una respuesta de error al cliente
        console.error('Error al obtener los registros de series:', error);
        res.status(500).json({ error: 'Error al obtener los registros de series' });
    }
};
