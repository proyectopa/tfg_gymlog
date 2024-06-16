const connection = require('./../database/connection')


// crear/actualizar ejercicio (sus series) de entrenamiento. 
// toma un ejercicio y sus series y lo verifica
// guarda las series machacando las anteriores
module.exports.postTrainningExercise = async (req, res) => {
    const { fecha, idEjercicio, series } = req.body;
    
    // Validar datos de entrada
    if (!fecha || !idEjercicio || !series || !Array.isArray(series)) {
        return res.status(400).send('Invalid request data');
    }
    
    let connection;
    try {
        await connection.beginTransaction();
        
        // Obtener el entrenamiento por fecha y usuario
        const [entrenamientos] = await connection.execute(
            'SELECT id FROM ENTRENAMIENTO WHERE fecha = ?',
            [fecha]
        );
        
        if (entrenamientos.length === 0) {
            await connection.rollback();
            return res.status(404).send('Training not found for the given date');
        }
        
        const entrenamientoId = entrenamientos[0].id;
        
        // Eliminar las series anteriores del ejercicio en el entrenamiento específico
        await connection.execute(
            'DELETE FROM SERIE WHERE idEjercicio = ? AND idEntrenamiento = ?',
            [idEjercicio, entrenamientoId]
        );
        
        // Insertar las nuevas series
        for (const serie of series) {
            await connection.execute(
                'INSERT INTO SERIE (idEntrenamiento, idEjercicio, valor1, valor2) VALUES (?, ?, ?, ?)',
                [entrenamientoId, idEjercicio, serie.valor1, serie.valor2]
            );
        }
        
        // Confirmar la transacción
        await connection.commit();
        
        // Responder con éxito
        res.status(200).send('Exercise series updated successfully');
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating exercise series:', error);
        res.status(500).send('Internal server error');
    } 
}
