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
            }
        });

    });

});