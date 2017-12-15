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

    /**
     * Determina si un determinado usuario aparece en la BD con la contraseña
     * pasada como parámetro.
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, un booleano indicando el resultado de la operación
     * (true => el usuario existe, false => el usuario no existe o la contraseña es incorrecta)
     * En caso de error error, el segundo parámetro de la función callback será indefinido.
     * 
     * @param {string} email Identificador del usuario a buscar
     * @param {string} password Contraseña a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    isUserCorrect(email, password, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT *" +
                    " FROM user" +
                    " WHERE email = ? AND password = ?",
                    [email, password],
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
                    "WHERE answersforme.id_user = ?) " +
                    "ORDER BY RAND() LIMIT 5;",
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

    getQuestion(id_pregunta, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT id_pregunta, preguntas " +
                    "FROM questions " +
                    "WHERE id_pregunta = ?;",
                    [id_pregunta],
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

    getQuestionWAnswers(id_pregunta, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT id_respuesta, respuesta " +
                    "FROM answers " +
                    "WHERE id_pregunta = ?;",
                    [id_pregunta],
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

    getMyAnswer(id_pregunta, user, callback) {

        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT respuesta " +
                    "FROM answers, answersforme " +
                    "WHERE answersforme.id_user = ? " +
                    "AND answersforme.id_pregunta = ? " +
                    "AND answersforme.id_respuesta = answers.id_respuesta;",
                    [user, id_pregunta],
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
            }
            );
        });
    }

    addUserAnswer(id_pregunta, id_respuesta, user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO answersforme (id_user, id_pregunta, id_respuesta) " +
                    "VALUES (?, ?, ?);",
                    [user, id_pregunta, id_respuesta],
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

    addProperUserAnswer(id_pregunta, respuesta, user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO answers VALUES (?, ?), " +
                    "INSERT INTO answersforme (id_user, id_pregunta, id_respuesta) " +
                    "VALUES (?, ?, ?);",
                    [id_pregunta, respuesta, user, id_pregunta, LAST_INSERT_ID()],
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

}

module.exports = {
    DAOQuestions: DAOQuestions
};