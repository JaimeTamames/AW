//Jaime Tamames y Ruben Barrado

"use strict";

/**
 * Proporciona operaciones para la gestión de usuarios
 * en la base de datos.
 */
class DAOFriends {

    /**
     * Inicializa el DAO de amigos.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /////////// TABLA DE SOLICITUDES //////////////

    //Añadir solicitud de amistad
    addRequest(user, friend, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO friends (user, friend, state) VALUES (?, ?, 'pedida')",
                    [user, friend],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();

                callback(null, undefined);

            }
            );
        });

    }

    //Coger todas las solicitudes de un usuario, devuelve todas las filas
    getRequests(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT friends.user AS email, user.nombre AS nombre, user.img AS img, friends.state AS state " +
                    "FROM user LEFT JOIN friends ON friends.user = user.email " +
                    "WHERE friends.friend = ? AND friends.state = 'pedida';",
                    [user],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();
                if (rows.length === 0) {
                    callback(null, undefined);
                } else {
                    callback(null, rows);
                }

            }
            );
        });
    }

    /////// TABLA DE AMIGOS ////////////

    //Coger todas los amigos de un usuario, devuelve todas las filas
    getFriends(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT friends.friend AS email, user.nombre AS nombre, user.img AS img " +
                    "FROM user LEFT JOIN friends ON friends.friend = user.email " +
                    "WHERE friends.user = ? AND friends.state = 'aceptada';",
                    [user],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();
                if (rows.length === 0) {
                    callback(null, undefined);
                } else {
                    callback(null, rows);
                }

            }
            );
        });
    }

    //Añadir amistad
    addFriend(user, friend, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE friends SET state = 'aceptada' WHERE user = ? AND friend = ?;",
                    [friend, user],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();
                connection.query(
                        "INSERT INTO friends (user, friend, state) VALUES (?, ?, 'aceptada');",
                        [user, friend],
                        (err, rows) => {
                    if (err) {
                        callback(err);
                        return;
                    } else {

                        callback(null, undefined);
                    }
                });

            });
        });
    }

}


module.exports = {
    DAOFriends: DAOFriends
};