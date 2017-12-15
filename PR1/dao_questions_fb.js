//Jaime Tamames y Ruben Barrado

"use strict";

/**
 * Proporciona operaciones para la gestión de preguntas
 * en la base de datos.
 */
class DAOQuestions {

    /**
     * Inicializa el DAO de preguntas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    getUserNoAnsweredQuestions(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT id_pregunta, preguntas " +
                    "FROM questions " +
                    "WHERE questions.id_pregunta NOT IN (SELECT questions.id_pregunta " +
                    "FROM questions left join answersforme ON questions.id_pregunta = answersforme.id_userAnswer " +
                    "WHERE answersforme.id_user = ?);",
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
                    callback(null, rows);
                }
            });
        });
    }

    getQuestion(idQuestion, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT id_pregunta, preguntas " +
                    "FROM questions " +
                    "WHERE id_pregunta = ?;",
                    [idQuestion],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();

                callback(null, rows[0]);
            }
            );
        });
    }

    getQuestionWAnswers(idQuestion, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT id_respuesta, repuesta " +
                    "FROM answers " +
                    "WHERE id_pregunta = ?;",
                    [idQuestion],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
                connection.release();

                callback(null, rows);
            }
            );
        });
    }

    getUserPoints(email, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT puntuacion" +
                    " FROM user" +
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

    getUserName(email, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT nombre" +
                    " FROM user" +
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

    addUser(user, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO user (email, password, nombre, sexo, puntuacion, fechaNacimiento, img)" +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [user.email, user.pass, user.nombre, user.sexo, 0, user.fechaNacimiento, user.img],
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

    setPassword(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE user SET " +
                    "password = ? " +
                    "WHERE email = ?;",
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

    setImage(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE user SET " +
                    "img = ? " +
                    "WHERE email = ?;",
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

    setName(user, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE user SET " +
                    "nombre = ? " +
                    "WHERE email = ?;",
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

    setSex(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE user SET " +
                    "sexo = ?" +
                    "WHERE email = ?;",
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

    setDate(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE user SET " +
                    "fechaNacimiento = ?" +
                    "WHERE email = ?;",
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

    search(user, char, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT DISTINCT  user.email AS email, user.nombre AS nombre, user.img AS img,  friends.state AS state " +
                    "FROM user left JOIN friends ON user.email = friends.friend AND friends.user = ? " +
                    "WHERE user.nombre LIKE ?;",
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
}

module.exports = {
    DAOQuestions: DAOQuestions
};