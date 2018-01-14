"use strict";

$(document).ready(() => {

    $("#aceptarLogin").on("click", () => {

        let usuario = $("#nombreUsuario").val();
        let contraseña = $("#contraseñaUsuario").val();

        $.ajax({
            type: 'GET',
            url: '/login',
<<<<<<< HEAD
=======
            beforeSend: (req) => {
                req.setRequestHeader("Authorization", "Basic " + btoa(usuario + ":" + contraseña));
            },
>>>>>>> c6f6c9ce206b3609f4272674b1cdfa7d9192449a
            data: {
                usuario: usuario,
                contraseña: contraseña,
            },
<<<<<<< HEAD
            success: (data) => {

=======
            success: (data, state, jqXRH) => {
                
>>>>>>> c6f6c9ce206b3609f4272674b1cdfa7d9192449a
                $("#login").hide();
                $("#bienvenido").hide();
                $("#sesion").show();
                
            },
            error: (jqXHR, textStatus, errorThrown) =>{

<<<<<<< HEAD
=======
                alert("Datos introducidos incorrectos");
                alert(errorThrown);
>>>>>>> c6f6c9ce206b3609f4272674b1cdfa7d9192449a
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