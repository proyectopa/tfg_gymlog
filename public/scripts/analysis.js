let fecha1 = null
let fecha2 = null

const btnBuscarGrafico = document.querySelector('#btn-buscar-graficos')
btnBuscarGrafico.addEventListener('click', function() {
    fecha1 = document.querySelector('#fecha-ini-analisis').value
    fecha2 = document.querySelector('#fecha-fin-analisis').value
    
    if(fecha1 == "" || fecha2 == "") {
        showToast('Error al buscar el gráfico', 'Debes seleccionar ambas fechas')
        return
    }
    
    if(fecha1 > fecha2) {
        showToast('Error al buscar el gráfico', 'La fecha de inicio debe ser anterior a la fecha de fin')
        return
    }
    
    buscarGrafico()
    buscarRegistros()
})


function buscarRegistros() {
    // Verificar si ya se ha creado el div buscando por el data-id-ejercicio
    const contenedorEjercicioSeleccionado = document.getElementById('contenedor-ejercicio-seleccionado');
    const divEjercicio = contenedorEjercicioSeleccionado.querySelector(`.exercise[data-id-ejercicio]`);
    
    if (divEjercicio) {
        // Si el div ya existe, obtener el nombre del ejercicio
        let nombreEjercicio = divEjercicio.querySelector('span').textContent;
        
        // Obtener la opción seleccionada en el select
        let select = divEjercicio.querySelector('select');
        let opcionSeleccionada = select.options[select.selectedIndex].value;
        
        let idEjercicio = divEjercicio.dataset.idEjercicio;
        
        obtenerDatosRegistrosServidor(idEjercicio, opcionSeleccionada, fecha1, fecha2, nombreEjercicio);    
    } 
}




async function buscarGrafico() {
    
    // Verificar si ya se ha creado el div buscando por el data-id-ejercicio
    const contenedorEjercicioSeleccionado = document.getElementById('contenedor-ejercicio-seleccionado');
    const divEjercicio = contenedorEjercicioSeleccionado.querySelector(`.exercise[data-id-ejercicio]`);
    
    if (divEjercicio) {
        // Si el div ya existe, obtener el nombre del ejercicio
        let nombreEjercicio = divEjercicio.querySelector('span').textContent;
        
        // Obtener la opción seleccionada en el select
        let select = divEjercicio.querySelector('select');
        let opcionSeleccionada = select.options[select.selectedIndex].value;
        
        let idEjercicio = divEjercicio.dataset.idEjercicio;
        
        obtenerDatosGraficoServidor(idEjercicio, opcionSeleccionada, fecha1, fecha2, nombreEjercicio);    
    } 
    
}

let modalEjer = document.querySelector('#modal-ejercicios')
const mostrarResultados = (resultados) => {
    const resultadosContainer = document.querySelector('.resultados');
    resultadosContainer.innerHTML = '';
    
    if (resultados.length === 0) {
        resultadosContainer.innerHTML = '<p>No hay resultados</p>';
    } else {
        let html = '';
        resultados.forEach(ejercicio => {
            html += `
            <div class="serie contenedor-gris" data-id-ejercicio="${ejercicio.id}" data-nombre-ejercicio="${ejercicio.nombre}" data-ud1="${ejercicio.unidad1}" data-ud2="${ejercicio.unidad2}" >
            ${ejercicio.nombre}
            </div>
            `;
        });
        resultadosContainer.innerHTML = html;
        
        document.querySelector('.resultados').addEventListener('click', function(event) {
            const ejercicioInput = document.getElementById('ejercicioInput');
            ejercicioInput.value = ''
            
            const ejercicioDiv = event.target.closest('.serie');
            if (!ejercicioDiv) return;
            
            btnBuscarGrafico.disabled = false
            
            // Obtener el id del ejercicio desde el dataset
            const ejercicioId = ejercicioDiv.dataset.idEjercicio;
            const ud1 = ejercicioDiv.dataset.ud1
            const ud2 = ejercicioDiv.dataset.ud2
            const nombre = ejercicioDiv.dataset.nombreEjercicio
            
            // Seleccionar el contenedor donde se añadirá el nuevo div
            const contenedorEjercicioSeleccionado = document.getElementById('contenedor-ejercicio-seleccionado');
            
            let html = `
            <div class="exercise contenedor-gris" data-id-ejercicio="${ejercicioId}">
            <span>${nombre}</span>
            <div>
            Unidad: 
            <select id="selectUnidad">
            <option value="valor1">${ud1}</option>
            <option value="valor2">${ud2}</option>
            </select>
            </div>
            </div>
            `;
            
            // Insertar el HTML como texto dentro del contenedor
            contenedorEjercicioSeleccionado.innerHTML = html;
            
            // Agregar event listener al select
            const selectUnidad = document.getElementById('selectUnidad');
            selectUnidad.addEventListener('change', function() {
                // Llamar a la función que maneja el cambio de opción seleccionada
                buscarGrafico()
            });

            const modal = bootstrap.Modal.getInstance(modalEjer); // Obtiene la instancia del modal
            modal.hide();

            
            
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const ejercicioInput = document.getElementById('ejercicioInput');
    const delay = 0; // Milisegundos de retraso para el debounce
    const debouncedSearch = debounce(async (query) => {
        const resultados = await buscarEjercicios(query);
        mostrarResultados(resultados);
    }, delay);
    
    ejercicioInput.addEventListener('input', (event) => {
        const query = event.target.value;
        debouncedSearch(query);
    });
});


let btnSeleccionarEjercicio = document.querySelector('#btn-nuevo-ejercicio')
btnSeleccionarEjercicio.addEventListener('click', function() {
    const ejercicioInput = document.getElementById('ejercicioInput');
    ejercicioInput.value = ''
    let query = ''
    let delay = 0
    const debouncedSearch = debounce(async (query) => {
        const resultados = await buscarEjercicios(query);
        mostrarResultados(resultados);
    }, delay);
    debouncedSearch(query);
})


const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

const buscarEjercicios = async (query) => {
    try {
        const response = await fetch('/buscar-ejercicios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al buscar ejercicios:', error);
        return [];
    }
};








// obtener registros ejercicio
async function obtenerDatosRegistrosServidor(idEjercicio, valor, fecha1, fecha2, nombreEjercicio) {
    try {
        const response = await fetch(`/graphLogs/${idEjercicio}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ valor, fecha1, fecha2 })
        });
        
        console.log(3)
        if (!response.ok) {
            throw new Error('Error al obtener los datos del servidor');
        }
        
        const datos = await response.json();
        
        if (datos.length === 0) {
            showToast('Error al dibujar el gráfico', 'No se han encontrado resultados para el ejercicio y el rango de fechas seleccionados.');
            return;
        }
        console.log(datos)
        // renderizarGrafico(datos);
        pintarRegistrosEjercicio(datos)
        
    } catch (error) {
        console.error('Error en obtenerDatosRegistrosServidor:', error);
        // Manejar el error según sea necesario
    }
}

function formatearFecha(fecha) {
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
}


function pintarRegistrosEjercicio(datos) {
    const contenedor = document.querySelector('.registros-analisis');
    contenedor.innerHTML = '';
    
    // Recorrer cada objeto de fecha y sus series correspondientes
    datos.forEach(item => {
        const fechaFormateada = formatearFecha(item.fecha);
        const series = item.series;
        
        let seriesHTML = ''
        series.forEach(serie => {
            const { valor1, ud1, valor2, ud2 } = serie;
            
            seriesHTML += `
                <div class="serie">
                    ${valor1} ${ud1} - ${valor2} ${ud2}
                </div>
            `            
        });
        
        
        // Crear un div para la fecha
        let divFechaHTML = `
            <div class="fecha">
                <span>${fechaFormateada}</span>
                ${seriesHTML}
            </div>
            `
        
        contenedor.innerHTML += divFechaHTML
        
        
        // Recorrer cada serie dentro de la fecha y crear divs para cada una
        
        
        
        
    });
    
    
}




// Función para obtener y procesar los datos del servidor
async function obtenerDatosGraficoServidor(idEjercicio, valor, fecha1, fecha2, nombreEjercicio) {
    try {
        let datos = null
        const response = await fetch(`/graphData/${idEjercicio}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ valor, fecha1, fecha2 })
        });
        
        
        if (!response.ok) {
            throw new Error('Error al obtener los datos del servidor');
        }
        
        datos = await response.json();
        
        if(datos.length == 0) {
            showToast('Error al dibujar el gráfico', 'No se han encontrado resultados para el ejercicio y el rango de fechas seleccionados.')
            return
        }
        
        // Aquí puedes renderizar el gráfico con los datos obtenidos
        const contenedorEjercicioSeleccionado = document.getElementById('contenedor-ejercicio-seleccionado');
        const divEjercicio = contenedorEjercicioSeleccionado.querySelector(`.exercise[data-id-ejercicio]`);
        let select = divEjercicio.querySelector('select');
        let opcionSeleccionada = select.options[select.selectedIndex].innerHTML;
        
        let colores = ['#ff1900']
        let nombres = [opcionSeleccionada]
        renderizarGrafico(datos, colores, nombres);
        
    } catch (error) {
        console.error('Error en obtenerDatosGraficoServidor:', error);
        // Manejar el error según sea necesario
    }
}







function renderizarGrafico(datos, colores, nombres) {
    // Limpiar gráfico existente
    d3.select("svg").selectAll("*").remove();

    // Convertir fechas a objetos de tipo Date
    datos.forEach(d => {
        d.fecha = new Date(d.fecha);
    });

    // Configuración del gráfico
    const margin = { top: 50, right: 150, bottom: 60, left: 50 },
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("svg")
                  .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
                .domain(d3.extent(datos, d => d.fecha))
                .range([0, width]);

    const y = d3.scaleLinear()
                .domain([0, d3.max(datos, d => d.valor)])
                .range([height, 0]);

    // Añadir línea de la gráfica
    const line = d3.line()
                   .x(d => x(d.fecha))
                   .y(d => y(d.valor))
                   .curve(d3.curveLinear);

    const path = svg.append("path")
                    .datum(datos)
                    .attr("fill", "none")
                    .attr("stroke", colores)
                    .attr("stroke-width", 2)
                    .attr("d", line);

    // Añadir puntos de datos como círculos
    svg.selectAll(".dot")
       .data(datos)
       .enter().append("circle")
       .attr("class", "dot")
       .attr("cx", d => x(d.fecha))
       .attr("cy", d => y(d.valor))
       .attr("r", 7)
       .attr("fill", colores)
       .style("cursor", "pointer")
       .on("click", (event, d) => {
           const formattedDate = `${d.fecha.getFullYear()}-${(d.fecha.getMonth() + 1).toString().padStart(2, '0')}-${d.fecha.getDate().toString().padStart(2, '0')}`;
           // Acción al hacer clic en un punto de datos
       });

    // Añadir animación a la línea para que se pinte poco a poco
    const totalLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .ease(d3.easeLinear)
        .duration(1000)
        .attr("stroke-dashoffset", 0);

    // Añadir eje x con menos ticks y formateo de fecha
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d/%m/%Y")))
       .selectAll("text")
       .style("text-anchor", "end")
       .style("font-size", "16px")  // Cambia el tamaño de las letras del eje x aquí
       .attr("dx", "-0.5em")
       .attr("dy", "0.5em")
       .attr("transform", "rotate(-30)");

    // Añadir eje y con ajuste de ticks
    svg.append("g")
       .call(d3.axisLeft(y).ticks(5))  // Ajusta el número de ticks en el eje y aquí
       .selectAll("text")
       .style("font-size", "16px");  // Cambia el tamaño de las letras del eje y aquí

    // Añadir etiquetas para los ejes
    svg.append("text")
       .attr("transform", `translate(${width / 2},${height + margin.bottom - 10})`)
       .style("text-anchor", "middle")
       .style("font-size", "16px")
       .text("")

    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin.left)
       .attr("x", 0 - (height / 2))
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .style("font-size", "16px")  // Cambia el tamaño de la letra de la etiqueta del eje y aquí
       .text("");

    // Añadir leyenda
    svg.append("rect")
       .attr("x", width - 30)
       .attr("y", -40)
       .attr("width", 10)
       .attr("height", 10)
       .attr("fill", colores);

    svg.append("text")
       .attr("x", width - 10)
       .attr("y", -30)
       .text(nombres)
       .style('fill', 'white')
       .style('font-size', '16px'); // Cambiar tamaño de la letra de la leyenda
}
