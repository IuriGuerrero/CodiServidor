const config = {
    serial: {
        //device: "/dev/cu.usbmodem1411",
        device: "COM3",
        baud: 9600,
    },
    
    // El port del servidor web
    port: 3000,

    // La font de les dades: "mock" o "live" (mock -> dades aleatòries, live -> de l'Arduino)
    source: "live", 
};

export default config;