//Jaime Tamames y Ruben Barrado

"use strict";

/**
 * Proporciona operaciones para la gestión de partidas
 * en la base de datos.
 */
class DAOPartidas {

    /**
     * Inicializa el DAO de partidas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    //Crea una partida. Devuelve el nombre y el id de la partida
    crearPartida(nombrePartida, idUsuario, callback) {
        
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO partidas (nombre, estado) " +
                    "VALUES (?, ?)",
                    [nombrePartida, "creada"],
                    (err, result) => {
                if (err) {
                    callback(err);
                    return;
                } else {

                    let partida = {
                        idPartida: result.insertId,
                        ok: false
                    }

                    connection.query(
                        "INSERT INTO juega_en (idUsuario, idPartida) " +
                        "VALUES (?, ?)",
                        [idUsuario, result.insertId],
                        (err, result) => {
                    if (err) {
                        callback(err);
                        return;
                    } else {

                        partida.ok = true;
                        connection.release();
                        callback(null, partida);
                    }
                }
                );
                }
            }
            );
        });
    }

    //Unirse a una partida. Devuelve el nombre y el id de la partida
    unirsePartida(idPartida, idUsuario, callback) {
        
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO juega_en (idUsuario, idPartida) " +
                    "VALUES (?, ?)",
                    [idUsuario, idPartida],
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

    //Devuelve el numero de inscritos en una partida
    numeroJugadoresPartida(idPartida, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                "SELECT idPartida, COUNT(*) AS num " +
                "FROM juega_en " +
                "WHERE idPartida = ? " +
                "GROUP BY idPartida",
                    [idPartida],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();
                if (rows.length === 0) {
                    callback(null, undefined);
                } else {
                    callback(null, rows[0].num);
                }
            });
        });
    }

    //Cpmprueba si existe la partida en la BBDD
    existePartida(idPartida, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                "SELECT id " +
                "FROM partidas " +
                "WHERE id = ? ",
                    [idPartida],
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

    //Devuelve en que partidas juega el usuario
    participaEnPartidas(idUsuario, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                "SELECT juega_en.idPartida AS id, partidas.nombre AS nombre " +
                "FROM juega_en INNER JOIN partidas ON juega_en.idPartida = partidas.id " +
                "WHERE juega_en.idUsuario = ?",
                    [idUsuario],
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
            });
        });
    }

    //Devuelve un array con los participantes de una partida
    participantesDePartida(idPartida, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                "SELECT  usuarios.login AS nombre usuarios.id AS id " +
                "FROM juega_en INNER JOIN usuarios ON juega_en.idUsuario = usuarios.id " +
                "WHERE juega_en.idPartida = ?",
                    [idPartida],
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
            });
        });
    }

    //comprueba si un usuario pertenece a la partida
    perteneceAPartida(idPartida, idUsuario, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                "SELECT  idUsuario " +
                "FROM juega_en " +
                "WHERE idUsuario = ? AND idPartida = ?",
                    [idUsuario, idPartida],
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

    //Devuelve el estado de una partida
    estadoPartida(idPartida, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                "SELECT  estado " +
                "FROM partidas " +
                "WHERE id = ?",
                    [idPartida],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();
                if (rows.length === 0) {
                    callback(null, undefined);
                } else {
                    callback(null, rows[0].estado);
                }
            });
        });
    }

    //Guarda el estado de una partida
    guardarPartida(idPartida, estado, callback) {
        
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE partidas SET " +
                    "estado = ? " +
                    "WHERE id = ?",
                    [estado, idPartida],
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

    //Busca el historial de una partida
    buscarHistorial(idPartida, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT evento, hora " +
                    "FROM historial " +
                    "WHERE idPartida = ?",
                    [idPartida],
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
            });
        });
    }

    //Añade al historial de una partida
    añadeHistorial(idPartida, evento, callback) {
        
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO historial (idPartida, evento) " +
                    "VALUES (?, ?)",
                    [idPartida, evento, ],
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


    /** ___________________________________________________________________________________________ */

}

module.exports = {
    DAOPartidas: DAOPartidas
};