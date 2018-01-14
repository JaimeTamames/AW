"use strict";

$(document).ready(() => {

    $("#aceptarLogin").on("click", () => {

        let usuario = $("#nombreUsuario").val();
        let contraseña = $("#contraseñaUsuario").val();

        $.ajax({
            type: 'POST',
            url: '/login',
            contentType: 'application/json',
            data: JSON.stringify({
                usuario: usuario,
                contraseña: contraseña,
            }),
            success: (data) => {

                $("#p").text(data.user);
                $("#p").before($("<p>").text("hola"));

                $("#login").hide();
                $("#bienvenido").hide();
                $("#sesion").show();
            }
        });

    });

});