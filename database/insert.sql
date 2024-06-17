INSERT INTO usuario (id, contrasena, correo) VALUES (1, '$2b$10$abPzy4dQ9dhEh94hy2gey.g50w.ukjze.Z.bqY6kMbr.s.h5e/1Hm', 'usuario1@gmail.com');
-- usuario1@gmail.com
-- 12341234Aa

-- Insertar unidades con IDs específicos para el usuario 1
INSERT INTO unidad (id, unidad1, unidad2, idUsuario) VALUES (1, 'km', 'minutos', 1);
INSERT INTO unidad (id, unidad1, unidad2, idUsuario) VALUES (2, 'repeticiones', 'kg', 1);
INSERT INTO unidad (id, unidad1, unidad2, idUsuario) VALUES (3, 'repeticiones', 'minutos', 1);

-- Insertar etiquetas con colores específicos para el usuario 1
INSERT INTO etiqueta (id, nombre, color, idUsuario) VALUES (1, 'fuerza', '#FF0000', 1); -- rojo
INSERT INTO etiqueta (id, nombre, color, idUsuario) VALUES (2, 'resistencia', '#0000FF', 1); -- azul
INSERT INTO etiqueta (id, nombre, color, idUsuario) VALUES (3, 'abdominales', '#137100', 1); -- verde

-- Insertar ejercicios para el usuario 1
INSERT INTO ejercicio (id, nombre, idUnidad, idUsuario) VALUES (1, 'sentadillas', 2, 1);
INSERT INTO ejercicio (id, nombre, idUnidad, idUsuario) VALUES (2, 'press de banca', 2, 1);
INSERT INTO ejercicio (id, nombre, idUnidad, idUsuario) VALUES (3, 'correr', 1, 1);
INSERT INTO ejercicio (id, nombre, idUnidad, idUsuario) VALUES (4, 'andar', 1, 1);
INSERT INTO ejercicio (id, nombre, idUnidad, idUsuario) VALUES (5, 'crunch abdominal', 3, 1);

-- Asignar etiquetas a los ejercicios
INSERT INTO ejercicio_etiqueta (idEjercicio, idEtiqueta) VALUES (1, 1); -- sentadillas - fuerza
INSERT INTO ejercicio_etiqueta (idEjercicio, idEtiqueta) VALUES (2, 1); -- press de banca - fuerza
INSERT INTO ejercicio_etiqueta (idEjercicio, idEtiqueta) VALUES (3, 2); -- correr - resistencia
INSERT INTO ejercicio_etiqueta (idEjercicio, idEtiqueta) VALUES (4, 2); -- andar - resistencia
INSERT INTO ejercicio_etiqueta (idEjercicio, idEtiqueta) VALUES (5, 1); -- crunch abdominal - fuerza
INSERT INTO ejercicio_etiqueta (idEjercicio, idEtiqueta) VALUES (5, 3); -- crunch abdominal - abdominales


INSERT INTO serie (idEjercicio, idUsuario, fecha, valor1, valor2, nota)
VALUES
    (1, 1, '2024-01-05', 60, 12, 'Entrenamiento de fuerza'),
    (2, 1, '2024-01-10', 80, 10, 'Entrenamiento de fuerza'),
    (3, 1, '2024-01-15', 5, 30, 'Entrenamiento de resistencia'),
    (4, 1, '2024-01-20', 3, 45, 'Entrenamiento de resistencia'),
    (5, 1, '2024-01-25', 20, 120, 'Entrenamiento abdominal');

INSERT INTO serie (idEjercicio, idUsuario, fecha, valor1, valor2, nota)
VALUES
    (1, 1, '2024-02-03', 65, 10, 'Entrenamiento de fuerza'),
    (2, 1, '2024-02-08', 85, 8, 'Entrenamiento de fuerza'),
    (3, 1, '2024-02-13', 6, 32, 'Entrenamiento de resistencia'),
    (4, 1, '2024-02-18', 4, 50, 'Entrenamiento de resistencia'),
    (5, 1, '2024-02-23', 25, 110, 'Entrenamiento abdominal');

INSERT INTO serie (idEjercicio, idUsuario, fecha, valor1, valor2, nota)
VALUES
    (1, 1, '2024-03-02', 70, 11, 'Entrenamiento de fuerza'),
    (2, 1, '2024-03-07', 90, 9, 'Entrenamiento de fuerza'),
    (3, 1, '2024-03-12', 7, 35, 'Entrenamiento de resistencia'),
    (4, 1, '2024-03-17', 5, 48, 'Entrenamiento de resistencia'),
    (5, 1, '2024-03-22', 22, 115, 'Entrenamiento abdominal');

INSERT INTO serie (idEjercicio, idUsuario, fecha, valor1, valor2, nota)
VALUES
    (1, 1, '2024-04-04', 75, 12, 'Entrenamiento de fuerza'),
    (2, 1, '2024-04-09', 95, 7, 'Entrenamiento de fuerza'),
    (3, 1, '2024-04-14', 8, 38, 'Entrenamiento de resistencia'),
    (4, 1, '2024-04-19', 6, 52, 'Entrenamiento de resistencia'),
    (5, 1, '2024-04-24', 28, 105, 'Entrenamiento abdominal');

INSERT INTO serie (idEjercicio, idUsuario, fecha, valor1, valor2, nota)
VALUES
    (1, 1, '2024-05-06', 80, 13, 'Entrenamiento de fuerza'),
    (2, 1, '2024-05-11', 100, 6, 'Entrenamiento de fuerza'),
    (3, 1, '2024-05-16', 9, 40, 'Entrenamiento de resistencia'),
    (4, 1, '2024-05-21', 7, 55, 'Entrenamiento de resistencia'),
    (5, 1, '2024-05-26', 30, 100, 'Entrenamiento abdominal');

INSERT INTO serie (idEjercicio, idUsuario, fecha, valor1, valor2, nota)
VALUES
    (1, 1, '2024-06-07', 85, 14, 'Entrenamiento de fuerza'),
    (2, 1, '2024-06-12', 110, 5, 'Entrenamiento de fuerza'),
    (3, 1, '2024-06-17', 10, 42, 'Entrenamiento de resistencia'),
    (4, 1, '2024-06-22', 8, 60, 'Entrenamiento de resistencia'),
    (5, 1, '2024-06-27', 32, 95, 'Entrenamiento abdominal');

INSERT INTO serie (idEjercicio, idUsuario, fecha, valor1, valor2, nota)
VALUES
    (1, 1, '2024-07-08', 90, 15, 'Entrenamiento de fuerza'),
    (2, 1, '2024-07-13', 120, 4, 'Entrenamiento de fuerza'),
    (3, 1, '2024-07-18', 11, 45, 'Entrenamiento de resistencia'),
    (4, 1, '2024-07-23', 9, 65, 'Entrenamiento de resistencia'),
    (5, 1, '2024-07-28', 35, 90, 'Entrenamiento abdominal');

INSERT INTO serie (idEjercicio, idUsuario, fecha, valor1, valor2, nota)
VALUES
    (1, 1, '2024-08-09', 95, 16, 'Entrenamiento de fuerza'),
    (2, 1, '2024-08-14', 130, 3, 'Entrenamiento de fuerza'),
    (3, 1, '2024-08-19', 12, 48, 'Entrenamiento de resistencia'),
    (4, 1, '2024-08-24', 10, 70, 'Entrenamiento de resistencia'),
    (5, 1, '2024-08-29', 38, 85, 'Entrenamiento abdominal');

INSERT INTO serie (idEjercicio, idUsuario, fecha, valor1, valor2, nota)
VALUES
    (1, 1, '2024-09-10', 100, 17, 'Entrenamiento de fuerza'),
    (2, 1, '2024-09-15', 140, 2, 'Entrenamiento de fuerza'),
    (3, 1, '2024-09-20', 13, 50, 'Entrenamiento de resistencia'),
    (4, 1, '2024-09-25', 11, 75, 'Entrenamiento de resistencia'),
    (5, 1, '2024-09-30', 40, 80, 'Entrenamiento abdominal');

INSERT INTO serie (idEjercicio, idUsuario, fecha, valor1, valor2, nota)
VALUES
    (1, 1, '2024-10-05', 105, 18, 'Entrenamiento de fuerza'),
    (2, 1, '2024-10-10', 150, 1, 'Entrenamiento de fuerza'),
    (3, 1, '2024-10-15', 14, 55, 'Entrenamiento de resistencia'),
    (4, 1, '2024-10-20', 12, 80, 'Entrenamiento de resistencia'),
    (5, 1, '2024-10-25', 42, 75, 'Entrenamiento abdominal');

INSERT INTO serie (idEjercicio, idUsuario, fecha, valor1, valor2, nota)
VALUES
    (1, 1, '2024-11-07', 110, 19, 'Entrenamiento de fuerza'),
    (2, 1, '2024-11-12', 160, 1, 'Entrenamiento de fuerza'),
    (3, 1, '2024-11-17', 15, 60, 'Entrenamiento de resistencia'),
    (4, 1, '2024-11-22', 13, 85, 'Entrenamiento de resistencia'),
    (5, 1, '2024-11-27', 45, 70, 'Entrenamiento abdominal');

INSERT INTO serie (idEjercicio, idUsuario, fecha, valor1, valor2, nota)
VALUES
    (1, 1, '2024-12-08', 115, 20, 'Entrenamiento de fuerza'),
    (2, 1, '2024-12-12', 170, 2, 'Entrenamiento de fuerza'),
    (3, 1, '2024-12-16', 16, 65, 'Entrenamiento de resistencia'),
    (4, 1, '2024-12-20', 14, 90, 'Entrenamiento de resistencia'),
    (5, 1, '2024-12-24', 48, 65, 'Entrenamiento abdominal');
