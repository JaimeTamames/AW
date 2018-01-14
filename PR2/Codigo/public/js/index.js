"use strict";

$(document).ready(() => {

    $("#aceptarLogin").on("click", () => {

        let usuario = $("#nombreUsuario").val();
        let contraseña = $("#contraseñaUsuario").val();

        $.ajax({
            type: 'GET',
            url: '/login',
            data: {
                usuario: usuario,
                contraseña: contraseña,
            },
            success: (data) => {

                $("#login").hide();
                $("#bienvenido").hide();
                $("#sesion").show();
                
            },
            error: (jqXHR, textStatus, errorThrown) =>{

            }
        });

    });

    $("#nuevoUsuario").on("click", () => {

        let usuario = $("#nombreUsuario").val();
        let contraseña = $("#contraseñaUsuario").val();

        $.ajax({
            type: 'GET',
            url: '/nuevoUsuario',  
            data: {
                usuario: usuario,
                contraseña: contraseña,
            },
            success: (data) => {

                document.getElementById("mensaje").innerHTML = "El usuario ha sido creado correctamente, puede loguearse!";
                
            },
            error: (data) =>{

            }
        });

    });
});