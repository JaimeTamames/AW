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

   /////////// FUNCIONES DE AMIGOS //////////////
    
	addRequest(solicitante, solicitado, callback){
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "UPDATE requests" +
                    "SET emailSolicitante = ?, emailSolicitado = ?;"
                    [char],
                    (err, rows) => {
                if (err) {
                    callback(err);
                    return;
                }
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
    DAOFriends: DAOFriends
}