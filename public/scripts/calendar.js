
// datos entrenamiento actual
let entrenamientoActual = {};
let copiaEjercicio = null;
const modalEditarSeries = new bootstrap.Modal(document.getElementById('modal-ejercicio-serie'));
const modalEjercicio = new bootstrap.Modal(document.getElementById('modal-ejercicio'));

let modalEditarSeriesHtml = document.querySelector('#modal-ejercicio-serie')

// obtener entrenamiento nuevo seleccionado
async function cambiarEntrenamiento(fecha) {
    
    try {
        let dia = fecha.getDate();
        let mes = fecha.getMonth() + 1;
        let año = fecha.getFullYear();
        
        const response = await fetch(`/trainning?fecha=${dia}-${mes}-${año}`);
        const data = await response.json();
        
        if (data.entrenamiento) {
            entrenamientoActual = data.entrenamiento;
            pintarEntrenamiento();
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}


// Función para guardar el entrenamiento actualizado (un ejercicio del modal) en el servidor
async function guardarEntrenamiento(ejercicio) {
    try {
        // Enviar los datos al servidor
        const response = await fetch('/saveTraining', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ejercicio: ejercicio,
                fechaEntrenamiento: entrenamientoActual.fecha // Suponiendo que la fecha está disponible en el objeto entrenamientoActual
            })
        });
        
        // Verificar si la respuesta fue exitosa
        if (response.ok) {
            // Recargar el entrenamiento después de guardar
            cambiarEntrenamiento(new Date(entrenamientoActual.fecha));
        } 
    } catch (error) {
        return
    }
}



// pintar entrenamiento con nuevos datos (al lado del calendario)
function pintarEntrenamiento() {
    
    let contenedorEntrenamiento = document.querySelector('.apartado-entrenamiento');
    
    if (Object.keys(entrenamientoActual).length === 0) return;
    
    let ejercicios = ``;
    
    entrenamientoActual['ejercicios'].forEach(ejercicio => {
        ejercicios += `
        <div class="ejercicio ej-calendario" data-ex-id="${ejercicio.idEjercicio}">
        <p class="nombre">${ejercicio.nombre}</p>
        `;
        ejercicio['series'].forEach((serie, index) => {
            ejercicios += `
            <div class="serie" data-index-serie="${index}">
            <span class="ud1">${serie.valor1} ${ejercicio.unidad1}</span>
            <span class="ud2">&nbsp;  - &nbsp; ${serie.valor2}  ${ejercicio.unidad2}</span>
            </div>
            `;
        });
        ejercicios += `</div>`;
    });
    
    if (entrenamientoActual.ejercicios.length === 0) {
        ejercicios = '<div class="mensaje-calendario">Añade ejercicios con el botón <span>+</span></div>';
    }
    
    
    // Obtener la fecha de hoy y establecer la hora a 0 para comparaciones
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Convertir entrenamientoActual.fecha a un objeto Date (formato dd-mm-yyyy)
    let [day, month, year] = entrenamientoActual.fecha.split('-');
    let entrenamientoFecha = new Date(year, month - 1, day);
    entrenamientoFecha.setHours(0, 0, 0, 0); // Asegurarse de que solo comparamos la fecha sin tiempo
    
    // Calcular las fechas de ayer y mañana
    let yesterday = new Date(today.getTime() - 86400000);
    let tomorrow = new Date(today.getTime() + 86400000);
    
    // Verificar si la fecha del entrenamiento es hoy, ayer o mañana
    let fechaMostrar = (entrenamientoFecha.getTime() === today.getTime()) ? "Hoy" :
    (entrenamientoFecha.getTime() === yesterday.getTime()) ? "Ayer" :
    (entrenamientoFecha.getTime() === tomorrow.getTime()) ? "Mañana" :
    entrenamientoActual.fecha;
    
    
    // contenedorEntrenamiento.innerHTML = `
    //     <h3>${entrenamientoActual.fecha}</h3>
    //     <button class="btn btn-primary">+</button>
    //     <div class="ejercicios">
    //         ${ejercicios}
    //     </div>
    // `;
    contenedorEntrenamiento.innerHTML = `
    <h3>${fechaMostrar}</h3>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-ejercicio" id="btn-buscar-ejercicio">+</button>
    <div class="ejercicios">
    ${ejercicios}
    </div>
    `;
    
    // Añadir event delegation al contenedor de ejercicios
    // event listener al pulsar ejercicios al lado del calendario (para editar series)
    let btnNuevoEjercicio = document.querySelector('#btn-buscar-ejercicio') 
    btnNuevoEjercicio.addEventListener('click', function() {
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
    contenedorEntrenamiento.addEventListener('click', function (event) {
        const ejercicioDiv = event.target.closest('.ejercicio.ej-calendario');
        if (!ejercicioDiv) return;
        
        const ejercicioId = ejercicioDiv.dataset.exId;
        let ejercicioEntrenamiento = entrenamientoActual.ejercicios.find(ejercicio => ejercicio.idEjercicio == ejercicioId);
        // let copiaEjercicio = JSON.parse(JSON.stringify(ejercicioEntrenamiento));
        copiaEjercicio = JSON.parse(JSON.stringify(ejercicioEntrenamiento));
        
        let series = '';
        copiaEjercicio.series.forEach((serie, index) => {
            series += `
            <div class="serie serie-seleccionable" data-index-serie="${index}">
                <div>
                    <span class="ud1">${serie.valor1} ${copiaEjercicio.unidad1}</span>
                    <span class="ud2">&nbsp;- &nbsp; ${serie.valor2} ${copiaEjercicio.unidad2}</span>
                </div>
            </div>
            `;
        });
        
        document.getElementsByClassName('modal-body')[0].innerHTML = `
        <div class="input modal-ej">
            <div class="input-editar-series">
                <label>
                    <input type="number"  min="0" required value="0" id="input1-nuevaSerie">
                </label>
                <label>
                    <input type="number" min="0" required value="0" id="input2-nuevaSerie">
                </label>
            </div>
            
            
            <div class="botones-editar-series">
                <button class="btn btn-success" id="boton-serie-guardar">Guardar</button>
                <button class="btn btn-primary" id="boton-serie-clear">Limpiar</button>
                
                <button class="btn btn-success" id="boton-serie-actualizar" style="display:none;">Actualizar</button>
                <button class="btn btn-danger" id="boton-serie-borrar" style="display:none;">Borrar</button>
            </div>
        </div>
        
        <div class="ejercicio">
            <div class="nombre">
            ${series}
            </div>
        </div>
        `;
        
        let serieSeleccionada = null;
        let input1 = document.querySelector('#input1-nuevaSerie');
        let input2 = document.querySelector('#input2-nuevaSerie');
        let botonBorrar = document.querySelector('#boton-serie-borrar');
        let botonActualizar = document.querySelector('#boton-serie-actualizar');
        let botonGuardar = document.querySelector('#boton-serie-guardar');
        let botonClear = document.querySelector('#boton-serie-clear');
        let indexSerieSeleccionada = null;
        
        // Añadir event delegation al contenedor de series
        // event listener al pulsar una serie para editarla/eliminarla/actualizarla...
        document.querySelector('.modal-body .nombre').addEventListener('click', function (event) {
            const div = event.target.closest('.serie-seleccionable');
            if (!div) return;
            const i = Array.from(this.children).indexOf(div);
            
            if (div === serieSeleccionada) {
                div.classList.remove('selected');
                botonActualizar.style.display = 'none';
                botonBorrar.style.display = 'none';
                botonGuardar.style.display = 'inline-block';
                botonClear.style.display = 'inline-block';
                serieSeleccionada = null;
                indexSerieSeleccionada = null;
            } else {
                if (serieSeleccionada) {
                    serieSeleccionada.classList.remove('selected');
                }
                div.classList.add('selected');
                serieSeleccionada = div;
                input1.value = copiaEjercicio.series[i].valor1;
                input2.value = copiaEjercicio.series[i].valor2;
                
                botonGuardar.style.display = 'none';
                botonClear.style.display = 'none';
                botonActualizar.style.display = 'inline-block';
                botonBorrar.style.display = 'inline-block';
                
                indexSerieSeleccionada = i;
            }
        });
        
        botonGuardar.addEventListener('click', () => {
            
              
            // let roundedValue = Math.round(value * 100) / 100;
          

            let nuevaSerie = {
                valor1: Math.round(parseFloat(input1.value) * 100) / 100,
                valor2: Math.round(parseFloat(input2.value) * 100) / 100,
                nota: ''
            };
            copiaEjercicio.series.push(nuevaSerie);
            actualizarDivSeries(copiaEjercicio);
        });
        
        botonActualizar.addEventListener('click', () => {
            let serieActualizar = copiaEjercicio.series[indexSerieSeleccionada];
            serieActualizar.valor1 = Number(input1.value);
            serieActualizar.valor2 = Number(input2.value);
            actualizarDivSerieSeleccionada(serieSeleccionada, serieActualizar, copiaEjercicio);
        });
        
        botonBorrar.addEventListener('click', () => {
            copiaEjercicio.series.splice(indexSerieSeleccionada, 1);
            serieSeleccionada.remove();
            serieSeleccionada = null;
            indexSerieSeleccionada = null;
            input1.value = 0;
            input2.value = 0;
            
            botonGuardar.style.display = 'inline-block';
            botonClear.style.display = 'inline-block';
            botonActualizar.style.display = 'none';
            botonBorrar.style.display = 'none';
        });
        
        botonClear.addEventListener('click', () => {
            input1.value = 0;
            input2.value = 0;
        });
        
        modalEditarSeries.show();
        
        // eliminar backdrops de todos los modales al pulsar botones cerrar
        document.getElementById('modal-ejercicio-serie').addEventListener('hide.bs.modal', function (e) {
            document.body.classList.remove('modal-open')
            const backdrop = document.querySelector('.modal-backdrop')
            if (backdrop) backdrop.remove()
            })
    });
}


// actualizar modal al añadir/borrar/editar serie
function actualizarDivSeries(copiaEjercicio) {
    let seriesHtml = '';
    copiaEjercicio.series.forEach((serie, index) => {
        seriesHtml += `
        <div class="serie serie-seleccionable" data-index-serie="${index}" style="justify-content: left">
        <span class="ud1">${serie.valor1} ${copiaEjercicio.unidad1}</span>
        <span class="ud2">&nbsp; - &nbsp; ${serie.valor2} ${copiaEjercicio.unidad2}</span>
        </div>
        `;
    });
    
    document.querySelector('.modal-body .nombre').innerHTML = seriesHtml;
}


function actualizarDivSerieSeleccionada(div, serie, ejercicio) {
    div.querySelector('.ud1').innerHTML = `${serie.valor1} ${ejercicio.unidad1}`;
    div.querySelector('.ud2').innerHTML = `&nbsp; - &nbsp; ${serie.valor2} ${ejercicio.unidad2}`;
}









// --------------------------------------------------------------------------------
// CALENDARIO



// OBTENER NUEVOS DATOS - AL CAMBIAR MES

async function cambiarMes(fecha) {
    try {
        let mes = fecha.getMonth() + 1;
        let año = fecha.getFullYear();
        const response = await fetch(`/events?month=${mes}&year=${año}`); 
        const data = await response.json();
        
        
        if (data.events && Array.isArray(data.events)) {
            const eventos = data.events.map(evento => ({
                title: evento.title,
                start: evento.start,
                backgroundColor: evento.backgroundColor,
                borderColor: evento.borderColor,
                editable: evento.editable
            }));
            
            // Actualizar los eventos en el calendario
            calendar.removeAllEvents(); // Eliminar todos los eventos existentes
            calendar.addEventSource(eventos); // Agregar los nuevos eventos
        } else {
        }
    } catch (error) {
        
    }
}

// PINTAR CALENDARIO
var calendarEl = document.getElementById('calendar');
let fechaActual = new Date();
let mesActual = null

// al guardar series: 
// actualizar entrenamiento al de hoy (trae datos actualizados)
cambiarEntrenamiento(fechaActual);
// actualizar calendario a mes actual (trae eventos actualizados)
// cambiarMes(mesActual)

function customEventContent(info) {
    // Crear un elemento div para representar el evento
    var eventDiv = document.createElement('div');
    // Establecer el color de fondo del evento
    eventDiv.style.backgroundColor = info.backgroundColor;
    // Establecer el borde del evento
    eventDiv.style.borderRadius = "0px"
    eventDiv.style.border = "none"
    // Establecer el texto del evento (nombre)
    eventDiv.innerText = info.event.title;
    // Retornar el elemento personalizado
    return { domNodes: [eventDiv] };
}

var calendar = new FullCalendar.Calendar(calendarEl, {
    eventContent: customEventContent,
    contentHeight: 'auto',
    themeSystem: 'bootstrap5',
    locale: 'es', 
    firstDay: 1,
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth',
    },
    buttonText: {
        today: "Hoy",
        month: "Mes",
        year: "Año"
    },
    initialDate: new Date(),
    selectable: true,
    longPressDelay: 1,
    unselectAuto: false,
    select: function(arg) {
        var start = arg.start;
        var end = arg.end;
        end.setDate(end.getDate() - 1);
        if (start.getTime() !== end.getTime()) {
            calendar.unselect();
            return
        }
        fechaActual = start;
        cambiarEntrenamiento(start)
        
        if (window.innerWidth > 1000) return
        
        const entrenamientoElement = document.getElementById('apartado-entrenamiento');
        if (entrenamientoElement) {
            entrenamientoElement.scrollIntoView({ behavior: 'smooth' });
        }
    },
    datesSet: function(info) {
        var currentMonth = info.view.currentStart.getMonth() + 1;
        var currentYear = info.view.currentStart.getFullYear();
        mesActual = info.view.calendar.getDate();
        cambiarMes(info.view.calendar.getDate());
    },
    events: [
        
    ]
});

calendar.render();


// ------------------------------------------------------
// buscar ejercicios


// Función para realizar la búsqueda de ejercicios
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

// Función para mostrar los resultados de la búsqueda
const mostrarResultados = (resultados) => {
    const resultadosContainer = document.querySelector('.resultados');
    resultadosContainer.innerHTML = '';
    
    if (resultados.length === 0) {
        resultadosContainer.innerHTML = '<p>No hay resultados</p>';
        showToast('Avisto', 'Aún no tienes ejercicios creados, ve al apartado ejercicios para crear uno')
    } else {
        let html = '';
        resultados.forEach(ejercicio => {
            html += `
            <div class="serie" data-id-ejercicio="${ejercicio.id}" data-ud1="${ejercicio.unidad1}" data-ud2="${ejercicio.unidad2}" >
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
            
            // Obtener el id del ejercicio desde el dataset
            const ejercicioId = ejercicioDiv.dataset.idEjercicio;
            const ud1 = ejercicioDiv.dataset.ud1
            const ud2 = ejercicioDiv.dataset.ud2
            
            // Crear una nueva copia del ejercicio seleccionado
            copiaEjercicio = {
                idEjercicio: ejercicioId,
                nombre: ejercicioDiv.textContent.trim(),
                series: [], // Aquí puedes inicializar las series si es necesario
                unidad1: ud1,
                unidad2: ud2
            };
            
            
            let series = '';
            // copiaEjercicio.series.forEach((serie, index) => {
                //     series += `
            //     <div class="serie serie-seleccionable" data-index-serie="${index}">
            //     <span class="ud1">${serie.valor1} ${copiaEjercicio.unidad1}</span>
            //     <span class="ud2">${serie.valor2} ${copiaEjercicio.unidad2}</span>
            //     </div>
            //     `;
            // });
            
            document.getElementsByClassName('modal-body')[0].innerHTML = `
            <div class="input modal-ej" id="modal-nuevo-ej-entrenamiento">
                    <label>
                        <input type="number" min="0" required value="0" id="input1-nuevaSerie">
                    </label>
                    <label>
                        <input type="number" min="0" required value="0" id="input2-nuevaSerie">
                    </label>
                    <button class="btn btn-success" id="boton-serie-guardar">Guardar</button>
                    <button class="btn btn-primary" id="boton-serie-clear">Limpiar</button>
        
                    <button class="btn btn-success" id="boton-serie-actualizar" style="display:none;">Actualizar</button>
                    <button class="btn btn-danger" id="boton-serie-borrar" style="display:none;">Borrar</button>
            </div>
            
            
            <div class="ejercicio">
                <div class="nombre">
                ${series}
                </div>
            </div>
            `;
            
            let serieSeleccionada = null;
            let input1 = document.querySelector('#input1-nuevaSerie');
            let input2 = document.querySelector('#input2-nuevaSerie');
            let botonBorrar = document.querySelector('#boton-serie-borrar');
            let botonActualizar = document.querySelector('#boton-serie-actualizar');
            let botonGuardar = document.querySelector('#boton-serie-guardar');
            let botonClear = document.querySelector('#boton-serie-clear');
            let indexSerieSeleccionada = null;
            
            // Añadir event delegation al contenedor de series
            // event listener al pulsar una serie para editarla/eliminarla/actualizarla...
            document.querySelector('.modal-body .nombre').addEventListener('click', function (event) {
                const div = event.target.closest('.serie-seleccionable');
                if (!div) return;
                const i = Array.from(this.children).indexOf(div);
                
                if (div === serieSeleccionada) {
                    div.classList.remove('selected');
                    botonActualizar.style.display = 'none';
                    botonBorrar.style.display = 'none';
                    botonGuardar.style.display = 'inline-block';
                    botonClear.style.display = 'inline-block';
                    serieSeleccionada = null;
                    indexSerieSeleccionada = null;
                } else {
                    if (serieSeleccionada) {
                        serieSeleccionada.classList.remove('selected');
                    }
                    div.classList.add('selected');
                    serieSeleccionada = div;
                    input1.value = copiaEjercicio.series[i].valor1;
                    input2.value = copiaEjercicio.series[i].valor2;
                    
                    botonGuardar.style.display = 'none';
                    botonClear.style.display = 'none';
                    botonActualizar.style.display = 'inline-block';
                    botonBorrar.style.display = 'inline-block';
                    
                    indexSerieSeleccionada = i;
                }
            });
            
            botonGuardar.addEventListener('click', () => {
                let nuevaSerie = {
                    valor1: Math.round(parseFloat(input1.value) * 100) / 100,
                    valor2: Math.round(parseFloat(input2.value) * 100) / 100,
                    nota: ''
                };
                copiaEjercicio.series.push(nuevaSerie);
                actualizarDivSeries(copiaEjercicio);
            });
            
            botonActualizar.addEventListener('click', () => {
                let serieActualizar = copiaEjercicio.series[indexSerieSeleccionada];
                serieActualizar.valor1 = Number(input1.value);
                serieActualizar.valor2 = Number(input2.value);
                actualizarDivSerieSeleccionada(serieSeleccionada, serieActualizar, copiaEjercicio);
            });
            
            botonBorrar.addEventListener('click', () => {
                copiaEjercicio.series.splice(indexSerieSeleccionada, 1);
                serieSeleccionada.remove();
                serieSeleccionada = null;
                indexSerieSeleccionada = null;
                input1.value = 0;
                input2.value = 0;
                
                botonGuardar.style.display = 'inline-block';
                botonClear.style.display = 'inline-block';
                botonActualizar.style.display = 'none';
                botonBorrar.style.display = 'none';
            });
            
            botonClear.addEventListener('click', () => {
                input1.value = 0;
                input2.value = 0;
            });
            
            modalEditarSeries.show();
            
            // eliminar backdrops de todos los modales al pulsar botones cerrar
            document.getElementById('modal-ejercicio-serie').addEventListener('hide.bs.modal', function (e) {
                document.body.classList.remove('modal-open')
                const backdrop = document.querySelector('.modal-backdrop')
                if (backdrop) backdrop.remove()
                })
            
            
            
            modalEditarSeries.show()
            modalEjercicio.hide()
            
            
        });
    }
};

// Debounce para retrasar la llamada a la función de búsqueda
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
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



modalEditarSeriesHtml.querySelector('.enviar-ejercicio').addEventListener('click', function() {
    postSeriesEjercicios()
})

async function postSeriesEjercicios() {
    let ejercicio = copiaEjercicio
    
    // entrenamientoActual.fecha = "31-12-2022"
    const fechaActualString = "31-12-2022";
    const [dia, mes, año] = entrenamientoActual.fecha.split('-').map(Number);
    
    // Formatear la fecha en formato 'YYYY-MM-DD'
    const fechaFormateadaMySQL = `${año}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    

    try {
        const response = await fetch('/saveTraining', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ejercicio: ejercicio,
                fechaEntrenamiento: fechaFormateadaMySQL // Enviar la fecha actual
            })
        });
        
        // Verificar si la respuesta fue exitosa
        if (response.ok) {
            
            // Actualizar etiquetas del calendario y entrenamiento al lado del calendario
            cambiarMes(mesActual);
            cambiarEntrenamiento(new Date(fechaActual));
        } else {
            throw Error('');
        }
    } catch (error) {
        console.error('Error al guardar el entrenamiento:', error);
    } finally {
        // Cerrar el modal
        modalEditarSeries.hide();
    }
    
}




let myToast;


document.addEventListener('DOMContentLoaded', () => {
    const myToastEl = document.getElementById('myToast');
    myToast = new bootstrap.Toast(myToastEl, {
        autohide: true,
        delay: 5000
    });
    
    
    myToastEl.querySelector('.btn-close').addEventListener('click', () => {
        myToast.hide();
    });
});

function showToast(title, message) {
    document.getElementById('toastTitle').innerText = title;
    document.getElementById('toastBody').innerText = message;
    myToast.show();
}
