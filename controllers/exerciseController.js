const connection = require('./../database/connection')


// obtener todos los ejercicios (y etiquetas?)
module.exports.getExercises = async (req, res) => {
    const tagIds = req.query.tags ? req.query.tags.split(',') : [];

    try {
        let exercisesQuery = `
            SELECT e.id, e.nombre, e.idUnidad, u.unidad1, u.unidad2
            FROM ejercicio e
            JOIN unidad u ON e.idUnidad = u.id
            WHERE e.idUsuario = ?
        `;
        const exercisesParams = [res.locals.userId];

        if (tagIds.length > 0) {
            const placeholders = tagIds.map(() => '?').join(',');
            exercisesQuery += `
                AND e.id IN (
                    SELECT ee.idEjercicio
                    FROM ejercicio_etiqueta ee
                    WHERE ee.idEtiqueta IN (${placeholders})
                    GROUP BY ee.idEjercicio
                    HAVING COUNT(DISTINCT ee.idEtiqueta) = ?
                )
            `;
            exercisesParams.push(...tagIds, tagIds.length);
        }

        const [exercises] = await connection.query(exercisesQuery, exercisesParams);

        const exerciseIds = exercises.map(exercise => exercise.id);

        const [tags] = await connection.query(`
            SELECT ee.idEjercicio, et.id AS tagId, et.nombre AS tagName, et.color AS tagColor
            FROM ejercicio_etiqueta ee
            JOIN etiqueta et ON ee.idEtiqueta = et.id
            WHERE ee.idEjercicio IN (?)
        `, [exerciseIds]);

        const exercisesWithTags = exercises.map(exercise => {
            return {
                ...exercise,
                tags: tags.filter(tag => tag.idEjercicio === exercise.id).map(tag => ({
                    id: tag.tagId,
                    nombre: tag.tagName,
                    color: tag.tagColor
                }))
            };
        });

        res.status(200).json(exercisesWithTags);
    } catch (error) {
        console.error('Error al obtener ejercicios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}


// Crear/actualizar ejercicio
// toma un ejercicio y lo verifica
// si no existe lo crea, si no lo machaca
module.exports.postExercise = async (req, res) => {
    const { id, nombre, idUnidad, tags } = req.body;
    try {
        if(!id) {
            // Crear nuevo ejercicio
            const [result] = await connection.query('INSERT INTO ejercicio (nombre, idUnidad, idUsuario) VALUES (?, ?, ?)', [nombre, idUnidad, res.locals.userId]);
            const newExerciseId = result.insertId;
            
            // Insertar etiquetas
            if (tags && tags.length > 0) {
                const tagInserts = tags.map(tagId => [newExerciseId, tagId]);
                await connection.query('INSERT INTO ejercicio_etiqueta (idEjercicio, idEtiqueta) VALUES ?', [tagInserts]);
            }
            
            res.status(201).json({ message: 'Ejercicio creado exitosamente' });
            return
        }
        
        // Actualizar ejercicio existente
        const [exercise] = await connection.query('SELECT * FROM ejercicio WHERE id = ? AND idUsuario = ?', [id, res.locals.userId]);
        if (exercise.length === 0) {
            throw new Error('Ejercicio no encontrado o no es del usuario')
        }
        
        await connection.query('UPDATE ejercicio SET nombre = ?, idUnidad = ? WHERE id = ?', [nombre, idUnidad, id]);
        
        // Actualizar etiquetas
        await connection.query('DELETE FROM ejercicio_etiqueta WHERE idEjercicio = ?', [id]);
        if (tags && tags.length > 0) {
            const tagInserts = tags.map(tagId => [id, tagId]);
            await connection.query('INSERT INTO ejercicio_etiqueta (idEjercicio, idEtiqueta) VALUES ?', [tagInserts]);
        }
        
        res.status(200).json({ message: 'Ejercicio actualizado exitosamente' });
        
    } catch (error) {
        console.error('Error al crear o actualizar ejercicio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// borrar ejercicio
// obtiene un ejercicio (nomb/id) y lo borra
// sus series también
module.exports.deleteExercise = async (req, res) => {
    const id = req.params.id;
    
    try {
        // Verificar si el ejercicio pertenece al usuario
        await connection.query('START TRANSACTION')
        const [exercise] = await connection.query('SELECT * FROM ejercicio WHERE id = ? AND idUsuario = ?', [id, res.locals.userId]);
        if (exercise.length === 0) {
            throw new Error('El ejercicio no existe o no pertenece al usuario');
        }
        
        // Eliminar series asociadas al ejercicio
        await connection.query('DELETE FROM serie WHERE idEjercicio = ?', [id]);
        
        // Eliminar asociaciones con etiquetas
        await connection.query('DELETE FROM ejercicio_etiqueta WHERE idEjercicio = ?', [id]);
        
        // Eliminar el ejercicio
        await connection.query('DELETE FROM ejercicio WHERE id = ? AND idUsuario = ?', [id, res.locals.userId]);
        await connection.query('COMMIT')
        
        res.status(200).json({ message: 'Ejercicio eliminado exitosamente' });
    } catch (error) {
        await connection.query('ROLLBACK')
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}



// -----------------------------------------------------------------------------------------------

// crear unidades de medida (kg/reps, km/min, peso...)
// crea un diccionario de medidas que se usa al cerar ejercicios. 
// Así es más fácil agruparlos

// toma ud1 y ud2 y la añade. Si pasa id y existe actualiza
module.exports.units_post = async (req, res) => {
    const { id, unidad1, unidad2 } = req.body;
    try {
        // si no se pasa un id se crea una nueva unidad 
        if(!id) {
            // Si ya existe una unidad con el mismo par de unidades, devuelve un mensaje de error
            const [unidadesIguales] = await connection.query('SELECT * FROM unidad WHERE ((unidad1 = ? AND unidad2 = ?) OR (unidad1 = ? AND unidad2 = ?)) AND idUsuario = ?', [unidad1, unidad2, unidad2, unidad1, res.locals.userId]);


            if (unidadesIguales.length > 0) {
                throw new Error('Ya existe')
            }
            
            await connection.query('INSERT INTO unidad (unidad1, unidad2, idUsuario) VALUES (?, ?, ?)', [unidad1, unidad2, res.locals.userId]);
            res.status(201).json({ message: 'Unidad creada exitosamente' });
            return
        }
        
        // si se pasa un id actualiza la unidad con ese id           
        const [respuesta] = await connection.query('SELECT * FROM unidad WHERE id = ? AND idUsuario = ?', [id, res.locals.userId]);
        
        if (respuesta.length === 0) {
            throw new Error('No se encontró ninguna unidad con el ID proporcionado');
        }
        await connection.query('UPDATE unidad SET unidad1 = ?, unidad2 = ? WHERE id = ? AND idUsuario = ?', [unidad1, unidad2, id, res.locals.userId]);
        
        res.status(200).json({ message: 'Unidad actualizada exitosamente' });
        return
    } catch (err) {
        // console.error('Error al crear o actualizar la unidad:', err);
        res.status(500).json({ error: 'Error al crear o actualizar la unidad' + err });
    }
}

// obtener array/diccionario medidas para crear ejercicio...
// [[ud1,ud2], [ud1, ud2]...]
module.exports.units_get = async (req, res) => {
    try {
        const [rows] = await connection.query('SELECT * FROM unidad WHERE idUsuario = ?', [res.locals.userId]);
        
        // Verificar si no hay unidades disponibles
        if (rows.length === 0) {
            // Si no hay unidades, enviar un array vacío como respuesta
            return res.status(200).json([]);
        }
        
        const unidades = []
        rows.forEach(row => {
            unidades.push({
                id: row.id,
                unidad1: row.unidad1,
                unidad2: row.unidad2
            })
        })
        
        res.status(200).json(unidades);
    } catch (err) {
        console.error('Error al obtener unidades:', err);
        res.status(500).json({ error: 'Error al obtener las unidades' });
    }
}

// borra unidades de mediada.
// toma ud1 y ud2 (o id) y borra la medida (si no tiene ejercicios asociados)
module.exports.deleteUnits = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Verificar si la unidad existe
        const [existingUnits] = await connection.query('SELECT * FROM unidad WHERE id = ? AND idUsuario = ?', [id, res.locals.userId]);
        if (existingUnits.length === 0) {
            throw new Error('No existe la unidad')
        }
        
        const [associatedExercises] = await connection.query('SELECT * FROM ejercicio WHERE idUnidad = ? AND idUsuario = ?', [id, res.locals.userId]);
        if (associatedExercises.length > 0) {
            throw new Error('Error, no se puede eliminar una unidad asociada a algun ejercicio')
        }
        
        await connection.query('DELETE FROM unidad WHERE id = ? AND idUsuario = ?', [id, res.locals.userId]);
        
        res.status(200).json({ message: 'Unidad eliminada exitosamente' });
    } catch (error) {
        if(error.message == 'Error, no se puede eliminar una unidad asociada a algun ejercicio') {
            res.status(400).json({ error: error.message })
            return
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}



// -----------------------------------------------------------------------------------------------

// obtener todas las etiquetas
// [{id, nombre, color}, {id, nombre, color}]
module.exports.getTags = async (req, res) => {
    try {
        const [tags] = await connection.query('SELECT * FROM etiqueta WHERE idUsuario = ?', [res.locals.userId]);
        // Enviar las etiquetas como respuesta
        res.status(200).json(tags);
    } catch (error) {
        console.error('Error al obtener las etiquetas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// crear etiqueta
// toma el nombre. Si no existe la crea
module.exports.postTag = async (req, res) => {
    const { id, nombre, color } = req.body;
    
    try {
        // Verificar si ya existe una etiqueta con el mismo nombre
        const [existingTags] = await connection.query('SELECT * FROM etiqueta WHERE nombre = ? AND idUsuario = ?', [nombre, res.locals.userId]);
        
        // Si ya existe una etiqueta con el mismo nombre y no es la misma que se está actualizando, devolver un error
        if (existingTags.length > 0 && (!id || existingTags[0].id !== id)) {
            res.status(400).json({ error: 'Ya existe una etiqueta con este nombre' });
            return;
        }
        
        if (id) {
            // Si se proporciona un ID, actualizar la etiqueta existente
            await connection.query('UPDATE etiqueta SET nombre = ?, color = ? WHERE id = ? AND idUsuario = ? ', [nombre, color, id, res.locals.userId]);
            res.status(200).json({ message: 'Etiqueta actualizada exitosamente' });
            return
        } 
        // Si no se proporciona un ID, crear una nueva etiqueta
        await connection.query('INSERT INTO etiqueta (nombre, color, idUsuario) VALUES (?, ?, ?)', [nombre, color, res.locals.userId]);
        res.status(201).json({ message: 'Etiqueta creada exitosamente' });
    } catch (error) {
        console.error('Error al crear o actualizar la etiqueta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// borrar etiqueta. Toma su id
module.exports.deleteTag = async (req, res) => {
    const { id } = req.params;
    try {
        const [tags] = await connection.query('SELECT id FROM etiqueta WHERE id = ? AND idUsuario = ?', [id, res.locals.userId]);
        
        if (tags.length === 0) {
            throw new Error('el usuario no tiene esa etiqueta')
        }
        
        // Verificar si existen ejercicios asociados a esta etiqueta para este usuario
        const [associatedExercises] = await connection.query(`
            SELECT ee.idEjercicio 
            FROM ejercicio_etiqueta ee
            JOIN ejercicio e ON ee.idEjercicio = e.id
            WHERE ee.idEtiqueta = ? AND e.idUsuario = ?
        `, [id, res.locals.userId]);
        
        if (associatedExercises.length > 0) {
            throw new Error('Error, no puedes eliminar etiquetas asociadas a ejercicios')
        }
        
        // Borrar la etiqueta
        await connection.query('DELETE FROM etiqueta WHERE id = ?', [id]);
        res.status(200).json({ message: 'Etiqueta eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la etiqueta:', error);
        if(error.message == 'Error, no puedes eliminar etiquetas asociadas a ejercicios') {
            res.status(400).json({ error: error.message });
            return
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
