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
    addRequest(solicitante, solicitado, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO requests (emailSolicitante, emailSolicitado) VALUES (?,?)",
            [solicitante, solicitado],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
				else{
					callback(null,undefined);
				}
            }
            );
        });

    }

    //Eliminar Solicitud de amistad
    rmRequest(solicitante, solicitado, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "DELETE FROM requests WHERE emailSolicitante = ? AND emailSolicitado = ?;",
            [solicitante, solicitado],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
				else{
					callback(null,undefined);
				}
            }
            );
        });

    }

    //Coger todas las solicitudes de un usuario, devuelve todas las filas
    getRequests(solicitado, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT requests.emailSolicitante AS solicitante, user.nombre AS nombre, user.img AS img " +
                    "FROM user LEFT JOIN requests ON requests.emailSolicitante = user.email " +
                    "WHERE requests.emailSolicitado = ?;",
                    [solicitado],
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
	
	//Comprobar si se han solicitado amistad, devuelve true o false
    areRequest(solicitante, solicitado, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT *" +
                    " FROM requests" +
                    " WHERE emailSolicitante = ? AND emailSolicitado = ?",
                    [solicitante, solicitado],
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
                    "SELECT user.email AS solicitante, user.nombre AS nombre, user.img AS img " +
                    "FROM user LEFT JOIN friends ON friends.friend = user.email " +
                    "WHERE friends.user = ?;",
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
                    "INSERT INTO friends (user, friend) VALUES (?,?)",
            [user, friend],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
				else{
					callback(null,undefined);
				}
            }
            );
        });

    }

    //Eliminar amistad
    rmFriend(user, friend, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "DELETE FROM friends WHERE user = ? AND friend = ?;",
            [user, friend],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
				else{
					callback(null,undefined);
				}
            }
            );
        });

    }

    //Comprobar si son amigos, devuelve true o false
    areFriend(user, friend, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT *" +
                    " FROM friends" +
                    " WHERE user = ? AND friend = ?",
                    [user, friend],
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
            }
            );
        });

    }

}

module.exports = {
    DAOFriends: DAOFriends
}