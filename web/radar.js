/**
 * Radar
 * 
 * Pantalla animada utilitzant Canvas i HTML5
 * 
 * Per començat l'animació, cridar animate(). Per proveïr dades, cridar update() amb les dades
 * que es van rebent. Quan s'enviïn dades, seran traçades a la pantalla.
 */
class Radar {
    /**
     * Definir l'objecte 
     */
    constructor() {
        // Definir la onfiguració
        this.config = {
            CANVAS_WIDTH: 800,
            CANVAS_HEIGHT: 500,
            DEFAULT_ANGLE: 90,
            DEFAULT_DISTANCE: 150,
            MAX_DISTANCE: 150,
            MIN_DISTANCE: 5,
            RADAR_SWEEP_LENGTH: 400,
            RADAR_MAX_POINTS: 20,
        };
        
        // Definir les dades del radar
        this.data = [];
        this.sweepLine = {};

        // Definir el contexte del canvas 
        this.ctx = document.getElementById('radar').getContext('2d');
        this.clear();
    }

    /**
     * Inicialitzar el canvas radar
     */
    clear() {
        this.ctx.clearRect(0, 0, this.config.CANVAS_WIDTH, this.config.CANVAS_HEIGHT);
    }

    /**
     * Actualitzar el conjunt de dades del radar
     * 
     * @param {Object} data Les dades JSON, que contenen les claus 'angle' i 'distance'.
     * @returns {void}
     */
    update(data) {
        let angle = data.angle || this.config.DEFAULT_ANGLE;
        let distance = data.distance || null;

        // Invertit l'angle, perquè el servo de l'arduino està
        // montat a l'inrevés.
        angle = Math.abs(180 - angle); 

        // Normalitzar la distància
        if (distance > this.config.MAX_DISTANCE) {
            distance = this.config.MAX_DISTANCE;
        } else if (distance < this.config.MIN_DISTANCE) {
            distance = this.config.MIN_DISTANCE;
        }

        if (distance) {
            distance = (distance / this.config.MAX_DISTANCE) * this.config.RADAR_SWEEP_LENGTH; 
        }

        // Actualitzar les dades del radar
        this.data.push({ angle, distance });
        this.sweepLine = { angle, distance };

        // Eliminar les dades anteriors
        if (this.data.length > this.config.RADAR_MAX_POINTS) {
            this.data.shift();
        }
    }

    /**
     * El loop d'animació
     * 
     * @returns {void}
     */
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    /**
     * Redibuixar el canvas
     * 
     * @returns {void}
     */
    draw() {
        this.clear();
        
        // Dibuixar tots els punts 
        let alpha = 0;
        this.data.forEach((pointData) => {
            alpha = alpha + (1 / this.config.RADAR_MAX_POINTS);
            const point = new Point(pointData.angle, pointData.distance, this.config);
            point.draw("green", alpha);
        });

        // Dibuixar la línia "que va escombrant"
        const sweepLine = new SweepLine(this.sweepLine.angle, this.config.RADAR_SWEEP_LENGTH, this.config);
        sweepLine.draw("white");
    }
}

/**
 * Una classe de forma de base abstracta amb codi compartit per representar qualsevol forma
 */
class BaseShape {
    /**
     * Establir l'objecte
     */
     constructor(angle, distance, config) {
        this.angle = angle;
        this.distance = distance;
        this.config = config;
        this.ctx = document.getElementById('radar').getContext('2d');
    }

    /**
     * Calcular les coordenades de la forma
     * 
     * Això retorna un null si no s'hauria de dibuixar ningun punt.
     * 
     * @return { startX, startY, endX, endY }|null
     */
    getXY() {
        let angle = this.angle;
        let distance = this.distance;

        if (distance === null) {
            return null;
        }

        const pivotX = this.config.CANVAS_WIDTH / 2; 
        const pivotY = this.config.CANVAS_HEIGHT;

        // Començar dibuixant al mig de baix de tot del canvas
        let endX, endY, diffX, diffY;
        let side = "left";
    
        // Fer tota la trigonometria al costat esquerre per comoditat
        if (angle > 90) {
            angle = 90 - (angle - 90);
            side = "right";
        } else {
            side = "left";
        }

        // Resoldre l'endPosXY.
        // 0,0 és la part esquerra superior del canvas
        let radians = angle * (Math.PI/180);
        if (angle == 0) {
            diffX = distance;
            diffY = 0;
        } else if (angle == 90) {
            diffX = 0;
            diffY = distance;
        } else {
            diffX = Math.floor(Math.cos(radians) * distance);
            diffY = Math.floor(Math.sin(radians) * distance);
        }
        endY = pivotY - diffY;
        if (side === "left") {
            endX = pivotX - Math.abs(diffX);
        } else {
            endX = pivotX + Math.abs(diffX);
        }

        return {
            pivotX,
            pivotY,
            endX,
            endY
        };
    }
}

/**
 * Un punt al radar
 */
class Point extends BaseShape {
    draw(color, alpha = 1) {
        const { endX, endY } = this.getXY();
        if (endX && endY) {
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = alpha;
            this.ctx.moveTo(endX, endY);
            this.ctx.fillRect(endX - 5, endY - 5, 10, 10);
        }
    }
}

/**
 * Una línia "d'escombrada" al radar
 */
class SweepLine extends BaseShape {
     draw(color, alpha= 1) {
        const { pivotX, pivotY, endX, endY } = this.getXY();
        if (endX && endY) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = color;
            this.ctx.globalAlpha = alpha;
            this.ctx.moveTo(pivotX, pivotY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    };
}
