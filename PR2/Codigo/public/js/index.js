"use strict";

let login = null;
let cadenaBase64 = null;

$(document).ready(() => {

    $("#aceptarLogin").on("click", acceder);
    $("#nuevoUsuario").on("click", nuevoUsuario);
    $("#desconectarSesion").on("click", desconectar);
    $("#crear").on("click", crearPartida);
    $("#unirse").on("click", unirsePartida);


});

function acceder(){

    let usuario = $("#nombreUsuario").val();
    let contraseña = $("#contraseñaUsuario").val();

    $.ajax({
        type: 'POST',
        url: '/login',
        contentType: "application/json",
        data: JSON.stringify ({
            usuario: usuario,
            contraseña: contraseña,
        }),
        success: (data) => {

            login = usuario;

            cadenaBase64 = btoa(usuario + ":" + contraseña)

            ocultar();

            $("#sesion").show();
            $("#crearPartida").show();
            $("#unirsePartida").show();
            $("#usuario").text(usuario);
            
        },
        error: (data) =>{

        }
    });
}

//Funcion que da de alta un nuevo usuario
function nuevoUsuario(){

    let usuario = $("#nombreUsuario").val();
    let contraseña = $("#contraseñaUsuario").val();

    $.ajax({
        type: 'GET',
        url: '/nuevoUsuario', 
        contentType: "application/json",
        data: JSON.stringify ({
            usuario: usuario,
            contraseña: contraseña,
        }),
        success: (data) => {

            document.getElementById("mensaje").innerHTML = "El usuario ha sido creado correctamente, puede loguearse!";
            
        },
        error: (data) =>{

        }
    });
}

//Funcion que desconecta al usuario
function desconectar(){

        login = null;

        ocultar();

        $("#login").show();
        $("#bienvenido").show();

}

//Funcion que crea una nueva partida
function crearPartida(){

    let nombrePartida = $("#nombreNuevaPartida").val();

    $.ajax({
        type: 'GET',
        url: '/', 
        beforeSend: function(req) {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization",
            "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify ({
            nombrePartida: nombrePartida,
        }),
        success: (data) => {
            
        },
        error: (data) =>{

        }
    });
}

//Funcion que une al usuario a una partida existente
function unirsePartida(){

    let nombrePartida = $("#nombreUnirsePartida").val();

    $.ajax({
        type: 'GET',
        url: '/', 
        beforeSend: function(req) {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization",
            "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify ({
            nombrePartida: nombrePartida,
        }),
        success: (data) => {

            
        },
        error: (data) =>{

        }
    });
}

//Funcion que oculta todos los elementos
function ocultar(){

    $("#login").hide();
    $("#bienvenido").hide();
    $("#sesion").hide();
    $("#crearPartida").hide();
    $("#unirsePartida").hide();
    

}