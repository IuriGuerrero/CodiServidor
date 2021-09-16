/**
 * Una eina CLI per registrar totes les dades rebudes del dispositiu 
 * serial a la consola.
 * 
 * Per executar:
 * 
 * npm run rawdata
 */
import SerialPort from "serialport";
import config from "../config";

const port = new SerialPort(config.serial.device);
const parser = port.pipe(
    new SerialPort.parsers.Readline({ 
        delimiter: '\n' 
    })
);
parser.on('data', console.log);
