/** @typedef {import('leaflet')} */

const map = L.map('map').setView([-38.4161, -63.6167], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let seguimientoId = null;
let marcador = null;
let posiciones = [];

const historial = document.getElementById('historial');
const btnIniciar = document.getElementById('btnIniciar');
const btnDetener = document.getElementById('btnDetener');
const btnLimpiar = document.getElementById('btnLimpiar');

const recorrido = L.polyline([], {
    color: 'red',
    weight: 4
}).addTo(map);

function mostrarPosicion(posicion) {
    const latitud = posicion.coords.latitude;
    const longitud = posicion.coords.longitude;

    const nuevaPosicion = [latitud, longitud];

    posiciones.push(nuevaPosicion);

    guardarHistorial();

    if (marcador === null) {
        marcador = L.marker(nuevaPosicion).addTo(map);
    } else {
        marcador.setLatLng(nuevaPosicion);
    }

    marcador.bindPopup(
        `Latitud: ${latitud.toFixed(6)}<br>Longitud: ${longitud.toFixed(6)}`
    );

    recorrido.addLatLng(nuevaPosicion);

    map.setView(nuevaPosicion, 16);

    mostrarHistorial();
}

function mostrarError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert('Debes permitir el acceso a tu ubicación.');
            break;

        case error.POSITION_UNAVAILABLE:
            alert('No se pudo obtener tu ubicación.');
            break;

        case error.TIMEOUT:
            alert('Se agotó el tiempo para obtener la ubicación.');
            break;

        default:
            alert('Ocurrió un error al obtener la ubicación.');
    }
}

function iniciarSeguimiento() {
    if (!navigator.geolocation) {
        alert('Tu navegador no permite utilizar geolocalización.');
        return;
    }

    if (seguimientoId !== null) {
        alert('El seguimiento ya está iniciado.');
        return;
    }

    seguimientoId = navigator.geolocation.watchPosition(
        mostrarPosicion,
        mostrarError,
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function detenerSeguimiento() {
    if (seguimientoId !== null) {
        navigator.geolocation.clearWatch(seguimientoId);

        seguimientoId = null;

        alert('Seguimiento detenido.');
    }
}

function limpiarHistorial() {
    if (seguimientoId !== null) {
        navigator.geolocation.clearWatch(seguimientoId);

        seguimientoId = null;
    }

    posiciones = [];

    recorrido.setLatLngs([]);

    if (marcador !== null) {
        map.removeLayer(marcador);

        marcador = null;
    }

    historial.innerHTML = '';

    localStorage.removeItem('historialPosiciones');

    map.setView([-38.4161, -63.6167], 4);
}

function mostrarHistorial() {
    historial.innerHTML = '';

    posiciones.forEach(function(posicion, indice) {
        const li = document.createElement('li');

        li.textContent =
            `${indice + 1} - Lat: ${posicion[0].toFixed(6)}, Long: ${posicion[1].toFixed(6)}`;

        historial.appendChild(li);
    });
}

function guardarHistorial() {
    localStorage.setItem(
        'historialPosiciones',
        JSON.stringify(posiciones)
    );
}

function cargarHistorial() {
    const datosGuardados = localStorage.getItem('historialPosiciones');

    if (datosGuardados !== null) {
        posiciones = JSON.parse(datosGuardados);

        recorrido.setLatLngs(posiciones);

        mostrarHistorial();

        if (posiciones.length > 0) {
            const ultimaPosicion = posiciones[posiciones.length - 1];

            marcador = L.marker(ultimaPosicion).addTo(map);

            marcador.bindPopup(
                `Latitud: ${ultimaPosicion[0].toFixed(6)}<br>Longitud: ${ultimaPosicion[1].toFixed(6)}`
            );

            map.setView(ultimaPosicion, 16);
        }
    }
}

btnIniciar.addEventListener('click', iniciarSeguimiento);
btnDetener.addEventListener('click', detenerSeguimiento);
btnLimpiar.addEventListener('click', limpiarHistorial);

cargarHistorial();