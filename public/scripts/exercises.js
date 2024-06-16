// buscar ejercicios
let filtrosBusquedaEjercicio = {
    etiquetas: [],
    query: ''
}

const ejercicioInput = document.querySelector('#exercise-search')
const divResultadoEjercicios = document.querySelector('#exercise-search-result')


// gestionar boton eliminar ejercicio
// divResultadoEjercicios.addEventListener('click', async (event) => {
    //     if (event.target.classList.contains('btn-danger')) {
//         const ejercicioId = event.target.closest('.resultado-ejercicio').dataset.idEjercicio;
//         const confirmar = confirm('¿Estás seguro de que quieres borrar este ejercicio y todos sus series asociadas?');
//         if (confirmar) {
//             try {
//                 const response = await fetch(`/exercise/${ejercicioId}`, {
//                     method: 'DELETE'
//                 });

//                 if (!response.ok) {
//                     throw new Error('Error al eliminar el ejercicio');
//                 }

//                 // Eliminar el ejercicio del DOM
//                 event.target.closest('.resultado-ejercicio').remove();
//             } catch (error) {
//                 console.error('Error al eliminar el ejercicio:', error);
//                 // Mostrar un mensaje de error al usuario
//             }
//         }
//     }
// });

let ejercicioIdToDelete = null;

const confirmDeleteButton = document.getElementById('confirmDelete');
const confirmModalElement = document.getElementById('confirmModal');
const confirmModal = new bootstrap.Modal(confirmModalElement);

confirmDeleteButton.addEventListener('click', async function () {
    if (ejercicioIdToDelete) {
        try {
            const response = await fetch(`/exercise/${ejercicioIdToDelete}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Error al eliminar el ejercicio');
            }
            
            // Eliminar el ejercicio del DOM
            document.querySelector(`.resultado-ejercicio[data-id-ejercicio="${ejercicioIdToDelete}"]`).remove();
            
            // Ocultar el modal
            confirmModal.hide();
        } catch (error) {
            console.error('Error al eliminar el ejercicio:', error);
            // Mostrar un mensaje de error al usuario
        }
    }
});

divResultadoEjercicios.addEventListener('click', function (event) {
    if (event.target.classList.contains('btn-danger')) {
        ejercicioIdToDelete = event.target.closest('.resultado-ejercicio').dataset.idEjercicio;
        confirmModal.show();
    }
});


// modal gestionar etiquetas ----------------------------------------------------------

document.getElementById('btn-crear-etiqueta').addEventListener('click', async () => {
    const nombre = document.getElementById('nombreEtiqueta').value;
    const color = document.getElementById('colorEtiqueta').value;
    
    if(nombre == '' || color == '') {
        showToast('Error', 'Error al crear la etiqueta, debe introducir un nombre y color válido')
        return
    }
    
    try {
        const response = await fetch('/tag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, color })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            if(errorData.error == 'Ya existe una etiqueta con este nombre') {
                showToast('Error', 'Error al crear la etiqueta, ' + errorData.error)
                return
            } else {
                showToast('Error', 'Error al crear la etiqueta, verifica los datos introducidos y vuelve a intentarlo')
                return
            }
            
        }
        
        const data = await response.json();
        
        
        document.getElementById('nombreEtiqueta').value = null
        document.getElementById('colorEtiqueta').value = '#26292f'
        pintarEtiquetas()
        
    } catch (error) {
        showToast('Error', 'Error al crear la etiqueta, debe introducir un nombre y color válido')
        return
    }
});

document.getElementById('modal-etiquetas').addEventListener('click', () => {
    document.getElementById('nombreEtiqueta').value = null
    document.getElementById('colorEtiqueta').value = '#26292f'
    
    pintarEtiquetas()
})

async function pintarEtiquetas() {
    const resultsDiv = document.querySelector('.etiquetas-resultados');
    resultsDiv.innerHTML = ''; // Limpiar el contenido previo
    
    try {
        const response = await fetch('/tag', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            showToast('Error', 'Error al obtener las etiquetas del servidor')
            return
        }
        
        const etiquetas = await response.json();
        
        let html = ''; // Cadena para almacenar el HTML
        
        etiquetas.forEach(etiqueta => {
            html += `
            <div class="serie" data-id-etiqueta="${etiqueta.id}">
            <span>${etiqueta.nombre}</span>
            <button class="btn btn-danger">x</button>
            </div>
            `;
        });
        
        if(etiquetas.length == 0) {
            html += 'Aún no tienes etiquetas creadas'
            showToast('Aviso', 'Aún no tienes etiquetas, introduce un nombre y un color y después pulsa sobre crear etiqueta para crearla')
            resultsDiv.innerHTML = html; // Agregar los elementos al DOM
            return
        }
        
        resultsDiv.innerHTML = html; // Agregar los elementos al DOM
        
        
        // Agregar event listeners después de agregar los elementos al DOM
        resultsDiv.querySelectorAll('.serie').forEach(etiquetaDiv => {
            const idEtiqueta = etiquetaDiv.getAttribute('data-id-etiqueta');
            const button = etiquetaDiv.querySelector('button');
            button.addEventListener('click', async () => {
                if(await eliminarEtiqueta(idEtiqueta) == 1) {
                    etiquetaDiv.remove();
                }
            });
        });
    } catch (error) {
        console.error('Error al obtener etiquetas:', error);
        resultsDiv.innerHTML = '<div>Error al cargar etiquetas</div>';
    }
}


async function eliminarEtiqueta(idEtiqueta) {
    try {
        const response = await fetch(`/tag/${idEtiqueta}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            let response1 = await response.json()
            if(response1.error == "Error, no puedes eliminar etiquetas asociadas a ejercicios") {
                showToast('Error', 'Error, no puedes eliminar etiquetas asociadas a ejercicios')
                return 0
            }
            return 0
        }
        
        const data = await response.json();
        
        // Eliminar la etiqueta del array en el cliente
        const index = filtrosBusquedaEjercicio.etiquetas.indexOf(idEtiqueta);
        if (index !== -1) {
            filtrosBusquedaEjercicio.etiquetas.splice(index, 1);
        }
        
        return 1
    } catch (error) {
        
    }
}



// modal gestionar unidades ----------------------------------------------------------

// abrir modal - vaciar campos y obtener etiquetas actualizadas
document.getElementById('modal-unidades').addEventListener('click', () => {
    
    pintarUnidades()
    document.getElementById('ud1').value = null
    document.getElementById('ud2').value = null
    
})

async function pintarUnidades() {
    const resultsDiv = document.getElementById('unidades-resultados');
    resultsDiv.innerHTML = ''; // Limpiar el contenido previo
    
    try {
        const response = await fetch('/unit', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            showToast('Error','Error al obtener las unidades disponibles del servidor')
            return
        }
        
        const unidades = await response.json();
        let html = ''; // Inicializar una cadena HTML vacía
        
        if(unidades.length == 0) {
            showToast('Aviso', 'Aún no tienes unidades creadas, introduce los valores que guardara (por ejemplo kg y repeticiones) y pulsa sobre "crear unidad" para crear una nueva.')
            resultsDiv.innerHTML = 'Aún no tienes unidades creadas'
            return
        }
        
        unidades.forEach(unidad => {
            html += `
            <div class="ejercicio serie apartado-flex contenedor-gris" data-id-unidad="${unidad.id}">
            <span>${unidad.unidad1} - ${unidad.unidad2}</span>
            <button class="btn btn-danger">x</button>
            </div>
            `;
        });
        
        resultsDiv.innerHTML = html; // Asignar la cadena HTML al div de resultados
        
        
        
        // Agregar event listeners a los botones de eliminar
        const buttons = resultsDiv.querySelectorAll('.btn-danger');
        buttons.forEach(button => {
            button.addEventListener('click', async () => {
                const serie = button.closest('.serie');
                const unidadId = serie.getAttribute('data-id-unidad');
                
                if(await eliminarUnidad(unidadId) == 1) {
                    serie.parentElement.removeChild(serie); // Eliminar el elemento serie del DOM
                }
            });
        });
        
        
    } catch (error) {
        console.error('Error al obtener unidades:', error);
        resultsDiv.innerHTML = '<div>Error al cargar unidades</div>';
    }
}

// eliminar unidad
async function eliminarUnidad(idUnidad) {
    try {
        const response = await fetch(`/unit/${idUnidad}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            let response1 = await response.json()
            if(response1.error == 'Error, no se puede eliminar una unidad asociada a algun ejercicio') {
                showToast('Error', 'Error, no se puede eliminar una unidad asociada a algun ejercicio')
                return 0
                
            }
            throw new Error('Error al eliminar la unidad');
        }
        
        const data = await response.json();
        return 1
    } catch (error) {
        showToast('Error', 'Error al eliminar la unidad')
        return 0
        
    }
}



// crear unidad
document.getElementById('btn-crear-unidad').addEventListener('click', async () => {
    const unidad1 = document.getElementById('ud1').value;
    const unidad2 = document.getElementById('ud2').value;
    const id = null; // O establece el ID si estás actualizando una unidad existente
    
    if(unidad1 == '' || unidad2 == '') {
        showToast('Error', 'Error, debe introducir un nombre válido para cada unidad')
        return
    }
    
    try {
        const response = await fetch('/unit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, unidad1, unidad2 })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error:', errorData.error);
            if(errorData.error == 'Error al crear o actualizar la unidadError: Ya existe') {
                showToast('Error', errorData.error)
                return;
            } else {
                showToast('Error', 'Error al crear la unidad')
                return
            }
        }
        
        const data = await response.json();
        
        
        document.getElementById('ud1').value = null
        document.getElementById('ud2').value = null    
        pintarUnidades()
    } catch (error) {
        showToast('Error', 'Error al crear la unidad')
        return
    }
    
});


// async function obtenerEjercicios() {
//         resultsDiv.innerHTML = ''; // Limpia el contenido previo

//         try {
//             const response = await fetch('/exercise', {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (!response.ok) {
//                 throw new Error('Error al obtener los ejercicios');
//             }

//             const ejercicios = await response.json();
//             ejercicios.forEach(ejercicio => {
    //                 const ejercicioDiv = document.createElement('div');
//                 ejercicioDiv.classList.add('serie');
//                 ejercicioDiv.setAttribute('data-id-ejercicio', ejercicio.id);

//                 const span = document.createElement('span');
//                 span.textContent = `${ejercicio.unidad1} - ${ejercicio.unidad2}`;
//                 ejercicioDiv.appendChild(span);

//                 const button = document.createElement('button');
//                 button.classList.add('btn', 'btn-danger');
//                 button.textContent = 'x';
//                 button.addEventListener('click', async function() {
//                     await eliminarEjercicio(ejercicio.id);
//                     resultsDiv.removeChild(ejercicioDiv);
//                 });
//                 ejercicioDiv.appendChild(button);

//                 resultsDiv.appendChild(ejercicioDiv);
//             });
//         } catch (error) {
//             console.error('Error al obtener ejercicios:', error);
//             resultsDiv.innerHTML = '<div>Error al cargar ejercicios</div>';
//         }
//     }








// modal crear ejercicio ----------------------------------------------------------

// abrir modal para diseñar y crear ejercicio
// obtiene unidades y etiquetas disponibles, tienes que seleccionar 1 unidad y 0 o más etiquetas
// también hay que especificar un nombre
let modalCrearEjercicio = document.querySelector('#modal-ejercicios')
modalCrearEjercicio.addEventListener('click', function() {
    obtenerEtiquetas()
    obtenerUnidades()
})

// boton dentro del modal para guardar/crear ejercicio
let btnCrearEjercicio = document.querySelector('#btn-crear-ejercicio')
btnCrearEjercicio.addEventListener('click', async function() {
    // obtener unidad seleccionada, nombre, etiquetas seleccionadas
    // enviar post al servidor (fetch) para guardar el ejercicio nuevo
    
    // Obtener unidad seleccionada
    const idUnidad = document.querySelector('#unit-options-create-exercise').value;
    // Obtener nombre del ejercicio
    const nombre = document.querySelector('#exercise-name-input').value;
    // Obtener etiquetas seleccionadas
    const etiquetasSeleccionadas = Array.from(document.querySelectorAll('.etiquetas-seleccionadas-ejercicio .ejercicio'))
    .map(tag => parseInt(tag.getAttribute('data-id-tag')))
    .filter(tagId => !isNaN(tagId));
    
    if (!idUnidad || !nombre || nombre == '') {
        showToast('Error', 'Debe seleccionar una unidad y especificar un nombre para el ejercicio.')
        return;
    }
    
    try {
        const response = await fetch('/exercise', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre,
                idUnidad: idUnidad,
                tags: etiquetasSeleccionadas
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al crear el ejercicio');
        }
        
        const data = await response.json();
        // Aquí puedes cerrar el modal, limpiar los campos, etc.
        
        // Obtener nombre del ejercicio
        document.querySelector('#exercise-name-input').value = ''
        debouncedSearch()

        let modalEjer = document.querySelector('#modal-create-exercise')
        console.log(modalEjer)
        const modal = bootstrap.Modal.getInstance(modalEjer); // Obtiene la instancia del modal
        modal.hide();
    } catch (error) {
        console.error('Error al crear el ejercicio:', error);
    }
})

async function obtenerUnidades() {
    let divSelectUnidad = document.querySelector('#unit-options-create-exercise');
    
    try {
        const response = await fetch('/unit', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener las unidades');
        }
        
        const unidades = await response.json();
        let htmlSelect = '';
        
        unidades.forEach(unidad => {
            htmlSelect += `
            <option value="${unidad.id}">${unidad.unidad1} - ${unidad.unidad2}</option>
            `;
        });
        
        if(unidades.length == 0) {
            showToast('Aviso', 'Aun no tienes unidades creadas que puedas añadir al ejercicio. Pulsa el botón unidades para ver y eliminar las unidades que tengas creadas o para crear unidades nuevas')
            htmlTags = '<div>Aun no tienes etiquetas creadas</div>'
        }
        
        divSelectUnidad.innerHTML = htmlSelect;
    } catch (error) {
        console.error('Error al obtener unidades:', error);
        divSelectUnidad.innerHTML = '<option>Error al cargar unidades</option>';
    }
    
}

// obtener etiquetas (todas) y seleccionar algunas al crear ejercicio
async function obtenerEtiquetas() {
    let divAgregarEtiqueta = document.querySelector('.agregar-etiqueta-ejercicio');
    let divEtiquetasSeleccionadas = document.querySelector('.etiquetas-seleccionadas-ejercicio');
    
    divAgregarEtiqueta.innerHTML = ''
    divEtiquetasSeleccionadas.innerHTML = ''
    
    try {
        const response = await fetch('/tag', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener las etiquetas');
        }
        
        const etiquetas = await response.json();
        let htmlTags = '';
        
        etiquetas.forEach(etiqueta => {
            htmlTags += `
            <div class="ejercicio contenedor-gris apartado-flex " data-id-tag="${etiqueta.id}">${etiqueta.nombre}</div>
            `;
        });
        
        if(etiquetas.length == 0) {
            showToast('Aviso', 'Aun no tienes etiquetas creadas que puedas añadir al ejercicio. Pulsa el botón etiquetas para ver y eliminar las etiquetas que tengas creadas o para crear etiquetas nuevas')
            htmlTags = '<div>Aun no tienes etiquetas creadas</div>'
        }
        
        divAgregarEtiqueta.innerHTML = htmlTags;
        
        // Añadir event listeners a las etiquetas recién creadas
        document.querySelectorAll('.agregar-etiqueta-ejercicio .ejercicio').forEach(tagElement => {
            tagElement.addEventListener('click', function() {
                const tagId = this.getAttribute('data-id-tag');
                const tagName = this.textContent.trim();
                
                // Verificar si la etiqueta ya está seleccionada
                const alreadySelected = [...divEtiquetasSeleccionadas.children].some(child => 
                    child.getAttribute('data-id-tag') === tagId
                );


                if (!alreadySelected) {

                    // Crear nuevo elemento de etiqueta seleccionada
                    const newTagElement = document.createElement('div');
                    newTagElement.classList.add('ejercicio');
                    newTagElement.classList.add('contenedor-gris');
                    newTagElement.setAttribute('data-id-tag', tagId);
                    newTagElement.innerHTML = `<span>${tagName}</span> <button class="btn-danger btn">x</button>`;
                    
                    // Añadir event listener al botón 'x' para eliminar la etiqueta
                    newTagElement.querySelector('button').addEventListener('click', function() {
                        divEtiquetasSeleccionadas.removeChild(newTagElement);
                    });
                    
                    // Añadir la nueva etiqueta al contenedor de etiquetas seleccionadas
                    divEtiquetasSeleccionadas.appendChild(newTagElement);
                    

                }
            });
        });
        
    } catch (error) {
        console.error('Error al obtener etiquetas:', error);
        divAgregarEtiqueta.innerHTML = '<div>Error al cargar etiquetas</div>';
    }
}


// fin



// BUSCAR EJERCICIOS - buscar ejercicios y filtrar por etiquetas




const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};



    
function debouncedSearch() {
    debounce(async () => {
        console.log(4);
        filtrosBusquedaEjercicio.query = ejercicioInput.value;
        const resultados = await buscarEjercicios(ejercicioInput.value);
        mostrarResultados(resultados);
        console.log(7777777777)
        console.log(resultados)
    }, 0)();
}

ejercicioInput.addEventListener('input', (event) => {
    debouncedSearch();
});

// Llamar a debouncedSearch directamente una vez al inicio si es necesario
debouncedSearch();



// obtener ejercicios
const buscarEjercicios = async () => {
    try {
        let query = filtrosBusquedaEjercicio.query;
        let arrayEtiquetas = filtrosBusquedaEjercicio.etiquetas;
        
        
        const response = await fetch('/buscar-ejercicios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, etiquetas: arrayEtiquetas })
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al buscar ejercicios:', error);
        return [];
    }
};
// ejercicios filtrados
const mostrarResultados = (resultados) => {
    divResultadoEjercicios.innerHTML = '';
    
    if (resultados.length === 0 && filtrosBusquedaEjercicio.query != '') {
        divResultadoEjercicios.innerHTML = '<p>No hay resultados para el nombre y las etiquetas introducidas</p>';
        return
    } 
    
    let html = '';
    resultados.forEach(ejercicio => {
        html += `
        <div class="resultado-ejercicio" data-id-ejercicio="${ejercicio.id}" data-ud2="${ejercicio.unidad2}" >
        <span>${ejercicio.nombre}</span>
        <div class="actions">
        <button class="btn btn-danger">x</button>
        <!-- <button class="btn btn-secondary">Historial</button> -->
        </div>
        </div>
        `;
    });
    divResultadoEjercicios.innerHTML = html;
    
    
    
};








// Obtener referencia al input de búsqueda y al div de resultados
const inputBusqueda = document.getElementById('input-busqueda-etiqueta-filtro');
const resultsDiv = document.getElementById('resultado-busqueda-etiquetas-filtro');
const etiquetasSeleccionadasDiv = document.getElementById('etiquetas-seleccionadas-filtro-ejercicio');

// Event listener para el input de búsqueda
inputBusqueda.addEventListener('input', filtrarEtiquetas);

// Función para obtener y mostrar las etiquetas desde el servidor con filtrado
async function obtenerYMostrarEtiquetas() {
  resultsDiv.innerHTML = ''; // Limpiar el contenido previo
  
  try {
    const response = await fetch('/tag', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      showToast('Error', 'Error al obtener las etiquetas disponibles desde el servidor');
      return;
    }
    
    etiquetas = await response.json();
    
    if (etiquetas.length === 0) {
      showToast('Aviso', 'Aún no tienes etiquetas creadas, pulsa sobre el botón "etiquetas" para crear una nueva');
      return;
    }
    
    // Mostrar todas las etiquetas al abrir el modal
    filtrarEtiquetas();
    
  } catch (error) {
    console.error('Error al obtener las etiquetas:', error);
    resultsDiv.innerHTML = '<div>Error al cargar etiquetas</div>';
  }
}

// Función para filtrar las etiquetas según el input de búsqueda
function filtrarEtiquetas() {
  const filtro = inputBusqueda.value.trim().toLowerCase(); // Obtener el texto de búsqueda y convertirlo a minúsculas
  resultsDiv.innerHTML = ''; // Limpiar el contenido previo
  
  etiquetas.forEach(etiqueta => {
    const nombreEtiqueta = etiqueta.nombre.toLowerCase(); // Convertir el nombre de la etiqueta a minúsculas
    
    // Verificar si el nombre de la etiqueta contiene el filtro de búsqueda
    if (nombreEtiqueta.includes(filtro)) {
      // Crear un nuevo elemento div para la etiqueta
      const etiquetaDiv = document.createElement('div');
      etiquetaDiv.classList.add('serie', 'tag', 'result', 'contenedor-gris');
      etiquetaDiv.textContent = etiqueta.nombre;
      
      // Agregar el evento al hacer clic en la etiqueta para alguna acción
      etiquetaDiv.addEventListener('click', () => {
        debouncedSearch()
        // Verificar si la etiqueta ya está seleccionada
        if (!document.querySelector(`.etiqueta-filtro[data-id-etiqueta="${etiqueta.id}"]`)) {
          // Crear un nuevo div para la etiqueta seleccionada
          const etiquetaSeleccionadaDiv = document.createElement('div');
          etiquetaSeleccionadaDiv.classList.add('serie', 'etiqueta-filtro');
          etiquetaSeleccionadaDiv.setAttribute('data-id-etiqueta', etiqueta.id);
          etiquetaSeleccionadaDiv.setAttribute('data-nombre-etiqueta', etiqueta.nombre);
          
          // Añadir contenido al div
          etiquetaSeleccionadaDiv.innerHTML = `
            <span>${etiqueta.nombre}</span>
            <button class="btn btn-danger btn-sm">x</button>
          `;
          
          // Añadir el evento para eliminar la etiqueta seleccionada
          etiquetaSeleccionadaDiv.querySelector('button').addEventListener('click', (e) => {
            e.stopPropagation();
            etiquetaSeleccionadaDiv.remove();
          });
          
          // Añadir el div de la etiqueta seleccionada al contenedor
          etiquetasSeleccionadasDiv.appendChild(etiquetaSeleccionadaDiv);
        }
      });
      
      // Agregar la etiqueta al resultado
      resultsDiv.appendChild(etiquetaDiv);
    }
  });
}

// Llamar a la función para obtener y mostrar las etiquetas desde el servidor







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
