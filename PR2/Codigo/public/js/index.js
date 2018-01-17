"use strict";

let login;
let loginId;
let cadenaBase64;

$(document).ready(() => {

    cargarPricipal();

    $("#aceptarLogin").on("click", acceder);
    $("#nuevoUsuario").on("click", nuevoUsuario);
    $("#desconectarSesion").on("click", desconectar);
    $("#crear").on("click", crearPartida);
    $("#unirse").on("click", unirsePartida);
    $("#listaPartidas").on("click", "li", cargarPartida);
});

//Funcion que carga las vistas principales
function cargarPricipal(){

    ocultar();
    $("#login").show();
    $("#bienvenido").show();
}

//Funcion que valida el usuario introducido e inicia la sesion
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
        success: (data, textStatus, jqXHR) => {

            login = data.nombre;
            loginId = data.id;

            cadenaBase64 = btoa(usuario + ":" + contraseña)

            $("#nombreUsuario").prop("value", "");
            $("#contraseñaUsuario").prop("value", "");

            ocultar();

            $("#sesion").show();
            $("#crearPartida").show();
            $("#unirsePartida").show();
            $("#usuario").text(usuario);
            muestraMenu();
            
        },
        error: (jqXHR, textStatus, errorThrown) => {

            alert("Se ha producido un error: " + errorThrown);
        }
    });
}

//Funcion que da de alta un nuevo usuario
function nuevoUsuario(){

    let usuario = $("#nombreUsuario").val();
    let contraseña = $("#contraseñaUsuario").val();

    $.ajax({
        type: 'POST',
        url: '/nuevoUsuario', 
        contentType: "application/json",
        data: JSON.stringify ({
            usuario: usuario,
            contraseña: contraseña,
        }),
        success: (data, textStatus, jqXHR) => {

            alert("Usuario " + data.nombre + " creado correctamente, logueate!");     
        },
        error: (jqXHR, textStatus, errorThrown) =>{

            alert("Se ha producido un error: " + errorThrown);
        }
    });
}

//Funcion que desconecta al usuario y finaliza la sesion
function desconectar(){

        login = null;
        cadenaBase64 = null;

        cargarPricipal();
}

//Funcion que crea una nueva partida
function crearPartida(){

    let nombrePartida = $("#nombreNuevaPartida").val();

    $.ajax({
        type: 'POST',
        url: '/crearPartida', 
        beforeSend: function(req) {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization",
            "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify ({
            nombrePartida: nombrePartida,
            idUsuario: loginId,
        }),
        success: (data, textStatus, jqXHR) => {

            alert("Partida " + data.nombrePartida + " creada correctamente!");

            $("#nombreNuevaPartida").prop("value", "");
            $("#misPartidas").after(nombrePartidaToDOMElement(data));
        },
        error: (jqXHR, textStatus, errorThrown) =>{

            alert("Se ha producido un error: " + errorThrown);
        }
    });
}

//Funcion que une al usuario a una partida existente
function unirsePartida(){

    let idPartida = $("#idUnirsePartida").val();

    $.ajax({
        type: 'POST',
        url: '/unirsePartida', 
        beforeSend: function(req) {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization",
            "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify ({
            idPartida: idPartida,
            idUsuario: loginId,
        }),
        success: (data, textStatus, jqXHR) => {

            alert("Te has unido a la partida con id " + data.idPartida);

            $("#idUnirsePartida").prop("value", "");
            $("#misPartidas").after(nombrePartidaToDOMElement(data));
        },
        error: (jqXHR, textStatus, errorThrown) =>{

            alert("Se ha producido un error: " + errorThrown);
        }
    });
}

//Funcion que muestra el menu
function muestraMenu(){

    $.ajax({
        type: 'GET',
        url: '/participaEnPartidas', 
        beforeSend: function(req) {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization",
            "Basic " + cadenaBase64);
        },
        data: {
            idUsuario: loginId,
        },
        success: (data, textStatus, jqXHR) => {

            data.forEach(elem => {
                
                $("#misPartidas").after(nombrePartidaToDOMElement(elem));
            });

        },
        error: (jqXHR, textStatus, errorThrown) =>{

            alert("Se ha producido un error: " + errorThrown);
        }
    });

    $("#menu").show();
}

//Convierte las partidas en pestañas
function nombrePartidaToDOMElement(partida) {
    let result = $("<li>").prop("id", partida.idPartida);
    result.append($("<a data-toggle='tab'>").addClass("nav-link").prop("role", "tab").prop("href", "#"+partida.idPartida).text(partida.nombrePartida));
    return result;
}

//Carga la vista de una partida
function cargarPartida(event){

    let partida = $(event.target);

    let idPartida = event.currentTarget.id;

    if(idPartida === "misPartidas"){

        ocultar();

        $("#sesion").show();
        $("a.active").removeClass("active");

        let pestaña = document.getElementById(idPartida);
        $(pestaña).children().addClass("active");
        $("#menu").show();
        $("#crearPartida").show();
        $("#unirsePartida").show();
        

    }else{

        $.ajax({
            type: 'GET',
            url: '/estadoPartida', 
            beforeSend: function(req) {
                // Añadimos la cabecera 'Authorization' con los datos de autenticación.
                req.setRequestHeader("Authorization",
                "Basic " + cadenaBase64);
            },
            data: {
                idPartida: idPartida,
                nombrePartida: partida.text(),
            },
            success: (data, textStatus, jqXHR) => {
    
                //Pintar los jugadores
                //data.arrayParticipantes.forEach(elem => {
                    
                    //$("#misPartidas").after(nombrePartidaToDOMElement(elem));
                //});

                ocultar();

                $("#sesion").show();
        
                $("a.active").removeClass("active");
        
                let pestaña = document.getElementById(idPartida);
                $(pestaña).children().addClass("active");
        
                $("#menu").show();
        
                $("#nombrePartida").text(partida.text());
                //$("#idPartida").text(idPartida);
        
                $("#partida").show();

            },
            error: (jqXHR, textStatus, errorThrown) =>{
    
                alert("Se ha producido un error: " + errorThrown);
            }
        });
    }
}

//Funcion que oculta todos los elementos
function ocultar(){

    $("#login").hide();
    $("#bienvenido").hide();
    $("#sesion").hide();
    $("#crearPartida").hide();
    $("#unirsePartida").hide();
    $("#menu").hide();
    $("#partida").hide();

}