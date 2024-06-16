-- He quitado la tabla entrenamiento


-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS proyecto_db;

-- Seleccionar la base de datos recién creada
USE proyecto_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contrasena VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL
);

-- Tabla de unidades - 
CREATE TABLE IF NOT EXISTS unidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unidad1 VARCHAR(255) NOT NULL,
    unidad2 VARCHAR(255) NOT NULL,
    idUsuario INT NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Tabla de ejercicios 
CREATE TABLE IF NOT EXISTS ejercicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    idUnidad INT NOT NULL,
    idUsuario INT NOT NULL,
    FOREIGN KEY (idUnidad) REFERENCES unidad(id),
    FOREIGN KEY (idUsuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Tabla de etiquetas - nombre, color 
CREATE TABLE IF NOT EXISTS etiqueta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL,
    idUsuario INT NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Tabla de ejercicios_etiquetas relaciona una etiqueta a varios ejercicios
CREATE TABLE IF NOT EXISTS ejercicio_etiqueta (
    idEjercicio INT,
    idEtiqueta INT,
    PRIMARY KEY (idEjercicio, idEtiqueta),
    FOREIGN KEY (idEjercicio) REFERENCES ejercicio(id) ON DELETE CASCADE,
    FOREIGN KEY (idEtiqueta) REFERENCES etiqueta(id) ON DELETE CASCADE
);

-- Tabla de series
CREATE TABLE IF NOT EXISTS serie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEjercicio INT,
    idUsuario INT,
    fecha DATE,
    valor1 FLOAT,
    valor2 FLOAT,
    nota VARCHAR(255), 
    FOREIGN KEY (idEjercicio) REFERENCES ejercicio(id) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario) REFERENCES usuario(id) ON DELETE CASCADE
);
