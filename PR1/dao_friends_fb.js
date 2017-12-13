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
	
	//Coger todas las solicitudes de un usuario, devuelve todas las filas
	getRequests(solicitado, callback){
		this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT *" +
                    " FROM requests" +
                    " WHERE emailSolicitado = ?",
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
	
	
	/////// TABLA DE AMIGOS ////////////
	
	//Coger todas los amigos de un usuario, devuelve todas las filas
	getFriends(user, callback){
		this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "SELECT *" +
                    " FROM friends" +
                    " WHERE user = ?",
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
	addFriend(user, friend, callback){
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "INSERT INTO friends (user, friend) VALUES (?,?)"
                    [user, friend],
                    (err, rows) => {
					if (err) {
						callback(err);
						return;
					}
				}            
            );
        });
        
    }
	
	//Eliminar amistad
	rmFriend(user, friend, callback){
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query(
                    "DELETE FROM requests WHERE user = ? AND friend = ?;"
                    [user, friend],
                    (err, rows) => {
					if (err) {
						callback(err);
						return;
					}
				}            
            );
        });
        
    }
	
	//Comprobar si son amigos, devuelve true o false
	areFriend(user, friend, callback){
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