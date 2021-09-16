// Importar mòduls
import express from "express";
import expressWs from "express-ws";
import path from 'path';

// Importar configuració i proveïdors de dades (livedata i mockdata)
import config from "./config.mjs";
import liveDataProvider from "./data/livedata.mjs";
import mockDataProvider from "./data/mockdata.mjs";

// Crear la constant '__dirname'
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Configurar el servidor web amb la ruta per defecte '/' per a GET i WS.
const app = express();
app.get('/', (req, res) => {
    // La string original conté un doble 'C:\' al principi degut a canvis en la nova versió,
    // per això s'utilitza el mètode substring i així s'eliminen els primers tres caràcters (C:\)
    // res.sendFile(__dirname + "/web/index.html")
    res.sendFile((__dirname + "/web/index.html").substr(3))
});
app.get('/radar.js', (req, res) => {
    // Doble 'C:\' una altra vegada
    // res.sendFile(__dirname + "/web/radar.js", { headers: { "content-type": "text/javascript" }})
    res.sendFile((__dirname + "/web/radar.js").substr(3), { headers: { "content-type": "text/javascript" }})
});

// Configurar web sockets i registrar l'endpoint del websocket, 
// per establir una comunicació entre client-servidor.
const wsApp = expressWs(app);
app.ws('/', (ws, req) => {});
const wss = wsApp.getWss('/');

// Iniciar el proveïdor de dades sel·leccionat
const source = config.source || "mock";
if (source === "live") {
    liveDataProvider.start(wss, config);
} else {
    mockDataProvider.start(wss, config);
}

// Iniciar el servidor
const port = config.port || 3000;
app.listen(
    config.port, 
    () => console.log(`The radar is available at http://localhost:${port}/ using ${source} data`)
);