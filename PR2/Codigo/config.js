//Jaime Tamames y Ruben Barrado

module.exports = {
    /* Configuración de los datos de acceso a la BD */
    mysqlConfig: {
        dbName: "BDPractica2",
        dbHost: "localhost",
        dbUser: "root",
        dbPassword: "awaw",
        /* Puerto de escucha */
        port: 5555
    },
    certificados: {
        certificate: "./certificados/certificado_firmado.crt",
        private_key: "./certificados/mi_clave.pem"
    }
};

