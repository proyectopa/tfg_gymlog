

// BOTON NAVEGACION

// obtengo el botón y el ul de navegacion
let boton = document.querySelector(".boton-nav")
let navegacion = document.querySelector(".links")

// si pulso el botón se oculta/muestra el ul
boton.addEventListener("click", function() {
    navegacion.classList.toggle("visible")
})

// como en el index los links (botonesNavegacion) solo hacen scroll en la página
// y no cargan otra pagina no se cierra el menú solo. Uso js para que si al pulsar un botón
// si el menú sigue visible se oculte 
let botonesNavegacion = document.querySelectorAll("a")

botonesNavegacion.forEach(boton => {
    boton.addEventListener("click", function() {
        if(navegacion.classList.contains("visible")) {
            navegacion.classList.toggle("visible")
        }
    })
});