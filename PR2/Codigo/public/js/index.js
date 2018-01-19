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
    $("#listaPartidas").on("click", "li", muestraPartida);
    $("#actualiarPartida").on("click", actualizaPartida);
});

//Funcion que carga las vistas principales
function cargarPricipal(){

    borrarmsg();
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
           
            borrarmsg();
            login = data.nombre;
            loginId = data.id;

            cadenaBase64 = btoa(usuario + ":" + contraseña);

            $("#nombreUsuario").prop("value", "");
            $("#contraseñaUsuario").prop("value", "");

            ocultar();

            $("#sesion").show();
            $("#crearPartida").show();
            $("#unirsePartida").show();
            $("#usuario").text(usuario);
            cargaMenu();
            
        },
        error: (jqXHR, textStatus, errorThrown) => {

            if(jqXHR.status === 400){
                borrarmsg();
                $("#login").after(pintarError("El usuario y/o contraseña introducidos son incorrectos"));
            }
            if(jqXHR.status === 401){
                borrarmsg();
                $("#login").after(pintarError("Los campos de login y contraseña no están correctamente rellenos"));
            }

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
            borrarmsg();
            $("#login").after(pintarInfo("Usuario " + data.nombre + " creado correctamente, logueate!"));     
        },
        error: (jqXHR, textStatus, errorThrown) =>{
            if(jqXHR.status === 400){
                borrarmsg();
                $("#login").after(pintarError("El usuario ya existe en la BBDD"));
            }
            if(jqXHR.status === 401){
                borrarmsg();
                $("#login").after(pintarError("Los campos de login y contraseña no están correctamente rellenos"));
            }           
        }
    });
}

//Funcion que desconecta al usuario y finaliza la sesion
function desconectar(){

        login = null;
        cadenaBase64 = null;
        borrarmsg();
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

            borrarmsg();
            $("#unirsePartida").after(pintarInfo("Partida " + data.nombrePartida + " creada correctamente!"));
            
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
            borrarmsg();
            $("#unirsePartida").after(pintarInfo("Te has unido a la partida con id " + data.idPartida));

            $("#idUnirsePartida").prop("value", "");
            $("#misPartidas").after(nombrePartidaToDOMElement(data));

        },
        error: (jqXHR, textStatus, errorThrown) =>{
            if(jqXHR.status === 400){
                borrarmsg();
                $("#unirsePartida").after(pintarError("Ya perteneces a esta partida"));
            }
            if(jqXHR.status === 402){
                borrarmsg();
                $("#unirsePartida").after(pintarError("La partida está llena"));
            }
            if(jqXHR.status === 403){
                borrarmsg();
                $("#unirsePartida").after(pintarError("La partida no existe"));
            }
        }
    });
}

//Carga el menu
function cargaMenu(){

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

//Convierte partidas en pestañas
function nombrePartidaToDOMElement(partida) {
    let result = $("<li>").prop("id", partida.idPartida);
    result.append($("<a data-toggle='tab'>").addClass("nav-link").prop("role", "tab").prop("href", "#"+partida.idPartida).text(partida.nombrePartida));
    return result;
}

//Funcion que maneja las pestañas de partidas
function muestraPartida(event){

    let nombrePartida = $(event.target);
    let idPartida = event.currentTarget.id;

    vaciarInfoPartida();
    vaciarCartasPartida()

    if(idPartida === "misPartidas"){
        borrarmsg();
        muestraMisPartidas(idPartida);
    }else{
        borrarmsg();
        cargarPartida(idPartida, nombrePartida.text());
    }
}

//Funcion que actualiza la partida
function actualizaPartida(event){

    let nombrePartida = $("#nombrePartidaInfo").text();
    let idPartida = $("a.active").parent().prop("id");

    vaciarInfoPartida();
    vaciarCartasPartida()

    cargarPartida(idPartida, nombrePartida);
}

//Muestra la pestaña mis partidas
function muestraMisPartidas(idPartida){

    ocultar();

    $("#sesion").show();
    $("a.active").removeClass("active");

    let pestaña = document.getElementById(idPartida);
    $(pestaña).children().addClass("active");
    $("#menu").show();
    $("#crearPartida").show();
    $("#unirsePartida").show();
}

//Carga la vista de una partida
function cargarPartida(idPartida, nombrePartida){

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
            nombrePartida: nombrePartida,
            nombreJugador: login,
        },
           
        success: (data, textStatus, jqXHR) => {
    
            ocultar();
           
            //Pinta nombre partida
            $("#nombrePartidaInfo").text(data.nombrePartida);

            //Pinta info partida
            if(data.nParticipantes < 4){
                
                $("#noJugadoresInfo").text("Aun no hay suficientes participantes");
                $("#idPartidaInfo").text("El identificador de la partida es el: " + data.idPartida);
            }

            let i = 1;

            //Pinta info jugadores
            data.arrayParticipantes.forEach(elem => {

                $("#nombreJugadorInfo" + i).text(elem.nombre);
                $("#nCartasJugadorInfo" + i).text(elem.nCartas);
                i++;
            });

            //Pinta las cartas del jugador
            data.arrayMisCartas.forEach(elem => {

                $("#cartas-mano").append(pintarCarta(elem));

            });

            //Pinta las cartas de la mesa
            data.mesa.forEach(elem => {

                $("#cartas-mano").append(pintarMesa(elem));

            });


            $("#sesion").show();      
            $("a.active").removeClass("active");
        
            let pestaña = document.getElementById(data.idPartida);
            $(pestaña).children().addClass("active");
        
            $("#menu").show();    
            $("#partida").show();

        },
        error: (jqXHR, textStatus, errorThrown) =>{
    
            alert("Se ha producido un error: " + errorThrown);
        }
    });        
}

//Funcion que pinta una carta
function pintarCarta(carta){

    let result = $("<img src='img/" + carta + ".png'>").addClass("m-2");
    return result;

}

function pintarMesa(){

    let result = $("<span src='img/" + carta + ".png'>").addClass("m-2");
    return result;
}

card-block
//Vacia cartas de la partida
function vaciarCartasPartida(){

    //Datos partida
    $("#card-block").empty();
}



//Vacia la informacion de la partida
function vaciarInfoPartida(){

    //Datos partida
    $("#nombrePartidaInfo").empty();
    $("#noJugadoresInfo").empty();
    $("#idPartidaInfo").empty();

    //Datos jugadores
    $("#nombreJugadorInfo1").empty();
    $("#nCartasJugadorInfo1").empty();

    $("#nombreJugadorInfo2").empty();
    $("#nCartasJugadorInfo2").empty();

    $("#nombreJugadorInfo3").empty();
    $("#nCartasJugadorInfo3").empty();

    $("#nombreJugadorInfo4").empty();
    $("#nCartasJugadorInfo4").empty();
}

//Funcion que muestra un error
function pintarError(mensaje) {

    let result = $("<div>").addClass("container d-flex justify-content-center mt-1 pl-4").prop("id", "msgLogin");
    result.append($("<h5>").addClass("text-danger").text(mensaje));
    return result;

}

//Funcion que borra los mensajes
function borrarmsg() {

    $("#msgLogin").remove();    

}

//Funcion que muestra mensajes
function pintarInfo(mensaje) {

    let result = $("<div>").addClass("container d-flex justify-content-center mt-1 pl-4").prop("id", "msgLogin");
    result.append($("<h5>").addClass("text-success").text(mensaje));
    return result;

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