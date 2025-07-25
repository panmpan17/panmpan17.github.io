let images = {};
let FPS = 60;

function loadImage(name, src) {
    return new Promise((resolve, reject) => {
        images[name] = new Image();
        images[name].src = src;
        images[name].onload = () => {
            resolve(images[name]);
        };
        images[name].onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });
}

class Camera {
    constructor({ x, y, width, height }) {
        this.pos = new Vector(x, y);
        this.width = width;
        this.height = height;
    }

    screenToWorld(screenX, screenY) {
        return new Vector(
            this.pos.x + screenX - this.width / 2,
            this.pos.y + screenY - this.height / 2
        );
    }

    worldToScreen(worldX, worldY) {
        // Assuming the camera is at the origin (0, 0)
        return new Vector(
            worldX - this.pos.x + this.width / 2,
            worldY - this.pos.y + this.height / 2
        );
    }
}

class SimpleImageNode {
    constructor({image, x, y, scale}) {
        this.image = image;
        this.pos = new Vector(x, y);
        this.scale = scale || 1;
        this.rotation = 0; // In radians
    }

    update(gameCanvas, deltaTime) {}

    draw(gameCanvas) {
        let width = this.image.width * this.scale;
        let height = this.image.height * this.scale;
        gameCanvas.context.save();
        let screenPos = gameCanvas.camera.worldToScreen(this.pos.x, this.pos.y);
        gameCanvas.context.translate(screenPos.x, screenPos.y);
        gameCanvas.context.rotate(this.rotation);
        gameCanvas.context.drawImage(this.image, -width / 2, -height / 2, width, height);
        gameCanvas.context.restore();
    }
}

class ObjectPool {
    constructor(createFunc, initCount = 10) {
        this.createFunc = createFunc;
        this.pool = [];
        for (let i = 0; i < initCount; i++) {
            this.pool.push(this.createFunc());
        }
    }

    get() {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                return this.pool[i];
            }
        }
        return this.createFunc();
    }

    release(item) {
        this.pool.push(item);
    }
}

class EffectsPool extends ObjectPool {
    constructor(createFunc, initCount = 10) {
        super(createFunc, initCount);
    }

    get () {
        for (let i = 0; i < this.pool.length; i++) {
            if (this.pool[i].lifeTimer >= this.pool[i].lifeTime) {
                return this.pool[i];
            }
        }
        let particle = this.createFunc();
        this.pool.push(particle);
        return particle;
    }

    update (gameCanvas, deltaTime) {
        for (let item of this.pool) {
            item.update(gameCanvas, deltaTime);
        }
    }

    draw(gameCanvas) {
        for (let item of this.pool) {
            item.draw(gameCanvas);
        }
    }
}

class GameCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId || 'gameCanvas');
        this.context = this.canvas.getContext('2d');

        this.children = [];
    }

    start() {
        this.lastTime = Date.now();
        setInterval(() => {
            this.update();
            this.draw();
        }, 1000 / FPS);
    }

    update() {
        // Update game state
        let now = Date.now();
        let deltaTime = (now - this.lastTime) / 1000; // Convert
        
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].update(this, deltaTime);
        }

        this.lastTime = now;
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].draw(this);
        }

        this.drawUI();
    }

    drawUI() {}
}
