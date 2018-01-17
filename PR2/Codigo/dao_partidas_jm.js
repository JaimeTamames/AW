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
                    "VALUES (?)",
                    [nombrePartida],
                    (err, result) => {
                if (err) {
                    callback(err);
                    return;
                } else {

                    let partida = {
                        nombrePartida: nombrePartida,
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

                    let partida = {
                        nombrePartida: null,
                        idPartida: idPartida,
                        ok: false
                    }

                    connection.query(
                        "SELECT  nombre " +
                        "FROM partidas " +
                        "WHERE id = ?",
                        [idPartida],
                        (err, result) => {
                    if (err) {
                        callback(err);
                        return;
                    } else {
    
                        partida.nombrePartida = result[0].nombre;
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
                    callback(null, rows[0]);
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
                "SELECT juega_en.idPartida AS idPartida, partidas.nombre AS nombrePartida " +
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
                "SELECT  usuarios.login AS nombre " +
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
                    callback(null, rows[0]);
                }
            });
        });
    }


    /** ___________________________________________________________________________________________ */


    /**
     * Obtiene el nombre de fichero que contiene la imagen de perfil de un usuario.
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, una cadena con el nombre de la imagen de perfil (o undefined
     * en caso de producirse un error).
     * 
     * @param {string} email Identificador del usuario cuya imagen se quiere obtener
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    getUserImageName(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT img " +
                    "FROM user " +
                    "WHERE email = ?",
                    [email],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();
                if (rows.length === 0) {
                    callback(null, undefined);
                } else {
                    callback(null, rows[0].img);
                }
            });
        });
    }

    //Obtiene el sexo de un usuario
    getUserSex(email, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT sexo " +
                    " FROM user " +
                    " WHERE email = ?",
                    [email],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();
                if (rows.length === 0) {
                    callback(null, undefined);
                } else {
                    callback(null, rows[0].sexo);
                }
            }
            );
        });
    }

    //Obtiene la edad de un usuario
    getUserAge(email, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT fechaNacimiento " +
                    " FROM user " +
                    " WHERE email = ?",
                    [email],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();
                if (rows.length === 0) {
                    callback(null, undefined);
                } else {
                    callback(null, rows[0].fechaNacimiento);
                }
            }
            );
        });
    }

    //Obtiene los puntos de un usuario
    getUserPoints(email, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT puntuacion " +
                    " FROM user " +
                    " WHERE email = ?",
                    [email],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();
                if (rows.length === 0) {
                    callback(null, undefined);
                } else {
                    callback(null, rows[0].puntuacion);
                }
            }
            );
        });
    }

    //Obtiene el nombre de un usuario
    getUserName(email, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT nombre " +
                    " FROM user " +
                    " WHERE email = ?",
                    [email],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();
                if (rows.length === 0) {
                    callback(null, undefined);
                } else {
                    callback(null, rows[0].nombre);
                }
            }
            );
        });
    }

    //Cambia los datos de un usuario con los campos validados
    setUser(user, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE user SET password = ?, nombre = ?, sexo = ?, fechaNacimiento = ?, img = ? " +
                    "WHERE email = ?",
                    [user.pass, user.nombre, user.sexo, user.fechaNacimiento, user.img, user.email],
                    (err, result) => {
                if (err) {
                    callback(err);
                    return;
                } else {

                    connection.release();
                    callback(null, undefined);
                }
            }
            );
        });
    }

    //Cambia la contraseña de un usuario
    setPassword(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE user SET " +
                    "password = ? " +
                    "WHERE email = ?",
                    [user.pass, user.email],
                    (err, result) => {
                if (err) {
                    callback(err);
                    return;
                } else {
                    connection.release();
                    callback(null, undefined);
                }
            }
            );
        });
    }

    //Cambia la imagen de perfil de un usuario
    setImage(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE user SET " +
                    "img = ? " +
                    "WHERE email = ?",
                    [user.img, user.email],
                    (err, result) => {
                if (err) {
                    callback(err);
                    return;
                } else {
                    connection.release();
                    callback(null, undefined);
                }
            }
            );
        });
    }

    //Cambia el nombre de un usuario
    setName(user, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE user SET " +
                    "nombre = ? " +
                    "WHERE email = ?",
                    [user.nombre, user.email],
                    (err, result) => {
                if (err) {
                    callback(err);
                    return;
                } else {
                    connection.release();
                    callback(null, undefined);
                }
            }
            );
        });
    }

    //Cambia el sexo de un usuario
    setSex(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE user SET " +
                    "sexo = ? " +
                    "WHERE email = ?",
                    [user.sexo, user.email],
                    (err, result) => {
                if (err) {
                    callback(err);
                    return;
                } else {
                    connection.release();
                    callback(null, undefined);
                }
            }
            );
        });
    }

    //Cambia la fecha de nacimiento de un usuario
    setDate(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE user SET " +
                    "fechaNacimiento = ? " +
                    "WHERE email = ?",
                    [user.fechaNacimiento, user.email],
                    (err, result) => {
                if (err) {
                    callback(err);
                    return;
                } else {
                    connection.release();
                    callback(null, undefined);
                }
            }
            );
        });
    }

    //Busca a partir de una cadena de texto las coincidencias con el nombre de los usuarios de la app
    search(user, char, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT DISTINCT  user.email AS email, user.nombre AS nombre, user.img AS img,  friends.state AS state " +
                    "FROM user left JOIN friends ON user.email = friends.friend AND friends.user = ? " +
                    "WHERE user.nombre LIKE ?",
                    [user, char],
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

    //Comprueba si existe un usuario dado de alta con ese email, devuleve true o false
    existUser(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT email " +
                    "FROM user " +
                    "WHERE email = ?",
                    [user.email],
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
    DAOPartidas: DAOPartidas
};