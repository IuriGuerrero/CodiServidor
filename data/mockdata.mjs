/**
 * Proveïdor de dades simulades (Mock)
 * 
 * Això genera dades aleatòries i la retransmet als clients websocket. 
 * 
 * @param {WebSocket.Server} client 
 * @param {Object} config
 */
const dataProvider = {
    start: (wss, config) => {

        // S'envia una update cada segon
        let angle = 90;
        let angleDirection = -5;
        let distance = 100;

        // Enviar algunes dades cada 100ms 
        setInterval(() => {
            // Obtenir el següent angle i inventar una distància
            angle += angleDirection;
            if (angle == 0 || angle == 180) {
                angleDirection *= -1;
            }
            distance = Math.ceil(Math.random() * 100);

            const data = {
                angle,
                distance,
            };

            // Enviar les dades als clients websocket
            wss.clients.forEach((client) => {
                client.send(JSON.stringify(data));
            });
        }, 100);

    }
}

export default dataProvider;