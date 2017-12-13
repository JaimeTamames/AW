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
    
	//Añadir solicitud de amistad
	addRequest(solicitante, solicitado, callback){
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO requests (emailSolicitante, emailSolicitado) VALUES (?,?)"
                    [solicitante, solicitado],
                    (err, rows) => {
					if (err) {
						callback(err);
						return;
					}
				}            
            );
        });
        
    }
	
	//Eliminar Solicitud de amistad
	rmRequest(solicitante, solicitado, callback){
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "DELETE FROM requests WHERE emailSolicitante = ? AND emailSolicitado = ?;"
                    [solicitante, solicitado],
                    (err, rows) => {
					if (err) {
						callback(err);
						return;
					}
				}            
            );
        });
        
    }

}

module.exports = {
    DAOFriends: DAOFriends
}