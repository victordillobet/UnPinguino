/**
 * UnPinguino Calendar Engine
 * Handles fetching ICS data, parsing with ICAL.js, and rendering with FullCalendar.
 */

// Use relative path for better compatibility with subdirectories
const ICS_URL = 'cache_calendar.php';

window.calendarEvents = null;
window.calendarsToLoad = [];
window._calendarLoadPromise = null;

/**
 * Fetches and parses the ICS file from the server.
 */
function loadIcsFromServer() {
    if (window._calendarLoadPromise) return window._calendarLoadPromise;

    // Detect environment
    if (window.location.protocol === 'file:') {
        const errorMsg = "ERROR: El calendario requiere un servidor (como XAMPP o hosting) para ejecutar PHP. No funcionará abriendo el archivo .html directamente.";
        console.error(errorMsg);
        showDetailedError(errorMsg);
        return Promise.reject(new Error(errorMsg));
    }

    console.log("Iniciando descarga de calendario desde:", ICS_URL);

    window._calendarLoadPromise = fetch(ICS_URL)
        .then(res => {
            console.log("Respuesta del servidor:", res.status, res.statusText);
            if (!res.ok) throw new Error("Error " + res.status + ": " + res.statusText);
            return res.text();
        })
        .then(data => {
            // Detect if PHP source is returned (server not executing PHP)
            if (data.trim().startsWith('<?php')) {
                throw new Error("El servidor no está ejecutando PHP. El archivo cache_calendar.php se devolvió como texto plano.");
            }

            console.log("Datos recibidos (longitud: " + data.length + "), iniciando parseo...");

            try {
                const jcalData = ICAL.parse(data);
                const comp = new ICAL.Component(jcalData);
                const events = [];

                comp.getAllSubcomponents('vevent').forEach(function (v) {
                    const ev = new ICAL.Event(v);
                    const fcEvent = {
                        title: ev.summary || "Sin título",
                        start: ev.startDate.toJSDate(),
                        color: "#fc8930"
                    };
                    if (ev.endDate) fcEvent.end = ev.endDate.toJSDate();
                    if (ev.startDate.isDate) fcEvent.allDay = true;
                    events.push(fcEvent);
                });

                console.log("Parseo completado. Eventos encontrados:", events.length);
                window.calendarEvents = events;
                return events;
            } catch (parseError) {
                console.error("Error al parsear los datos del calendario:", parseError);
                throw new Error("Los datos del calendario no tienen un formato válido o están vacíos.");
            }
        })
        .catch(err => {
            console.error("Error en la cadena de carga del calendario:", err);
            showDetailedError(err.message);
            throw err;
        });

    return window._calendarLoadPromise;
}

function showDetailedError(message) {
    const loadingElements = document.querySelectorAll('.calendar-loading');
    loadingElements.forEach(el => {
        el.innerHTML = `
            <div style='background: rgba(255,0,0,0.1); padding: 15px; border-radius: 8px; border: 1px solid #ff4444; color: #ff4444; font-size: 13px;'>
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 20px; margin-bottom: 10px;"></i>
                <p><strong>Error de carga:</strong><br>${message}</p>
            </div>
        `;
    });
}

/**
 * Renders a single FullCalendar instance.
 */
window.createSingleCalendar = function (elementId, date) {
    console.log("Renderizando calendario en:", elementId, "para la fecha:", date);
    const el = document.getElementById(elementId);
    if (!el) {
        console.warn("No se encontró el elemento con ID:", elementId);
        return;
    }

    const events = window.calendarEvents || [];

    const calendar = new FullCalendar.Calendar(el, {
        initialView: "dayGridMonth",
        initialDate: date,
        locale: "es",
        firstDay: 1,
        height: "auto",
        headerToolbar: { left: "", center: "title", right: "" },
        events: events,
        eventDidMount(info) {
            const titleEl = info.el.querySelector('.fc-event-title');
            if (!titleEl) return;
            if (titleEl.textContent.charAt(0) === '0') {
                titleEl.textContent = titleEl.textContent.substring(1);
            }
        }
    });

    calendar.render();
};

/**
 * Registers a calendar to be loaded once the data is ready.
 */
window.registerCalendar = function (elementId, date) {
    window.calendarsToLoad.push({ id: elementId, date: date });

    loadIcsFromServer()
        .then(() => {
            // Processing all pending calendars
            while (window.calendarsToLoad.length > 0) {
                const c = window.calendarsToLoad.shift();
                setTimeout(() => {
                    window.createSingleCalendar(c.id, c.date);
                    const container = document.getElementById(c.id)?.parentElement;
                    const loading = container?.querySelector('.calendar-loading');
                    if (loading) loading.style.display = 'none';
                }, 50);
            }
        });
};
