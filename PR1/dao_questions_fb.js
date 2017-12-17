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

    //Devuelve una lista aleatoria de preguntas no contestadas para el usuario, si hay menos de 5 preguntas mete algunas que pueden estar contestadas
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

    //Dado un id_pregunta devuelve su texto
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

    //Dado un id_pregunta devuelve el texto de la misma y sus posibles respuestas
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

    //Dado un id_pregunta devuelve la contestacion de ese usuario
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

    //Inserta la respuesta de un usuario a una pregunta
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

    //Inserta la respuesta de un usuario a una pregunta y ademas añade esta nueva respuesta a la pregunta
    addProperUserAnswer(id_pregunta, respuesta, user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO answers (id_pregunta, respuesta) VALUES (?, ?);",
                    [id_pregunta, respuesta],
                    (err, result) => {
                if (err) {
                    callback(err);
                    return;
                } else {
                    
                    connection.query(
                            "INSERT INTO answersforme (id_user, id_pregunta, id_respuesta) " +
                            "VALUES (?, ?, ?);",
                            [user, id_pregunta, result.insertId],
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
                }
            }
            );
        });
    }
	
	addQuestion(pregunta, callback) {

        //Implementar 
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO questions (preguntas) VALUES (?);",
                    [pregunta.pregunta],
                    (err, result) => {
                if (err) {
                    callback(err);
                    return;
                } else {


                    if (pregunta.respuestas.length > 0) {

                        let i;
                        let sql = "INSERT INTO answers (id_pregunta, respuesta) VALUES ?";
                        let sqlValues = [];
						

                        for (i = 0; i < pregunta.respuestas.length; i++) {

                            sqlValues.push([result.insertId, pregunta.respuestas[i]]);
                        }

                        connection.query(
                                sql, [sqlValues],
                                (err, rows) => {
                            if (err) {
                                callback(err);
                                return;
                            }
                            connection.release();
                            callback(null, undefined);
                        }
                        );
                    }
                }
            }
            );
        });
    }
	
	

}

module.exports = {
    DAOQuestions: DAOQuestions
};