document.addEventListener('DOMContentLoaded', function() {
    observadoresInserseccion()
    copiarEmail()
});

function copiarEmail() {
    const linkCopiarEmail = document.querySelector('#linkCopiarEmail');
    linkCopiarEmail.addEventListener('click', async function() {
        // Texto que deseas copiar al portapapeles
        const textoCopiar = linkCopiarEmail.querySelector('span').innerText
        
        try {
            // Usar el API navigator.clipboard para copiar el texto
            await navigator.clipboard.writeText(textoCopiar);
        } catch (err) {
            
        }
    });
    
}

function observadoresInserseccion() {
    document.querySelector('.titulo-borde-1').style.width = '100%';
    document.querySelector('.titulo-borde-2').style.width = '100%';
    document.querySelector('.titulo').style.transform = 'scale(1)';
    // document.querySelector('.principal-centrar').style.marginTop = '10vh'
    document.querySelector('.principal-centrar').style.opacity = '1'
    document.querySelector('.principal-centrar').style.transform = 'scale(1)'
    
    const target = document.querySelector('.caracteristicas');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // target.style.transform = 'rotate(0deg)';
                target.classList.add('caracteristicas-observando');
            } else {
                // target.style.transform = 'rotate(30deg)';
                target.classList.remove('caracteristicas-observando');
            }
        });
    }, {
        threshold: .3,
        // rootMargin: '00px'
    });
    
    observer.observe(target);
    
}