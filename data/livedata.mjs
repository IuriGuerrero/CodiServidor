import SerialPort from "serialport";

/**
 * Proveïdor de dades en temps real (Live)
 * 
 * Això connecta el serial port de l'Arduino i retransmet 
 * qualsevol dada que rep als clients websocket. 
 * 
 * @param {WebSocket.Server} client 
 * @param {Object} config
 */
const dataProvider = {
    start: (wss, config) => {
        const port = new SerialPort(config.serial.device);
        const parser = port.pipe(
            new SerialPort.parsers.Readline({ 
                delimiter: '\n' 
            })
        );
        parser.on('data', (data) => {
            wss.clients.forEach((client) => {
                client.send(data);
            });
        });
    }
}

export default dataProvider;