//Jaime Tamames y Ruben Barrado

"use strict";

/**
 * Proporciona operaciones para la gestión de usuarios
 * en la base de datos.
 */
class DAOUsers {

    /**
     * Inicializa el DAO de usuarios.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Determina si un determinado usuario aparece en la BD con la contraseña
     * pasada como parámetro.
     * 
     * @param {string} usuario Nombre del usuario a buscar
     * @param {string} contraseña Contraseña a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    usuarioCorrecto(usuario, contraseña, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT * " +
                    "FROM usuarios " +
                    "WHERE login = ? AND password = ?",
                    [usuario, contraseña],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();
                if (rows.length === 0) {
                    callback(null, false);
                } else {
                    callback(null, rows[0]);
                }
            });
        });
    }

    /**
     * Añade un usuario, devuelve true si todo va bien
     * 
     * @param {string} usuario Nombre del nuevo usuario
     * @param {string} contraseña Contraseña del nuevo usuario
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
     nuevoUsuario(usuario, contraseña, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO usuarios (login, password) " +
                    "VALUES (?, ?)",
                    [usuario, contraseña],
                    (err, result) => {
                if (err) {
                    callback(err);
                    return;
                } else {

                    connection.release();
                    callback(null, true);
                }
            }
            );
        });
    }

    /**
     * Comprueba si existe un usuario, devuelve true o false
     * 
     * @param {string} usuario Nombre del usuario a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    existeUsuario(usuario, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT * " +
                    "FROM usuarios " +
                    "WHERE login = ?",
                    [usuario],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();
                if (rows.length === 0) {
                    callback(null, false);
                } else {
                    callback(null, true);
                }
            });
        });
    }

    /** ___________________________________________________________________________________________ */

}

module.exports = {
    DAOUsers: DAOUsers
};