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
    constructor({image, x, y, scale, rotation, anchor}) {
        this.image = image;
        this.pos = new Vector(x, y);
        this.scale = scale || 1;
        this.separateScale = null;

        this.rotation = rotation || 0; // In radians
        this.anchor = anchor || new Vector(0.5, 0.5); // Anchor point for rotation
    }

    update(gameCanvas, deltaTime) {}

    draw(gameCanvas) {
        let width;
        let height;
        if (this.separateScale) {
            width = this.image.width * this.separateScale.x;
            height = this.image.height * this.separateScale.y;
        }
        else {
            width = this.image.width * this.scale;
            height = this.image.height * this.scale;
        }

        gameCanvas.context.save();
        let screenPos = gameCanvas.camera.worldToScreen(this.pos.x, this.pos.y);
        gameCanvas.context.translate(screenPos.x, screenPos.y);
        gameCanvas.context.rotate(this.rotation);

        let startX = -width * this.anchor.x;
        let startY = -height * this.anchor.y;
        gameCanvas.context.drawImage(this.image, startX, startY, width, height);
        gameCanvas.context.restore();

        // drawCircle(gameCanvas.context, screenPos.x, screenPos.y, 3, 'white'); // Debug circle
    }

    translate(childPos) {
        return this.pos.add(childPos.rotate(this.rotation));
    }

    clone() {
        let newNode = new SimpleImageNode({
            image: this.image,
            x: this.pos.x,
            y: this.pos.y,
            scale: this.scale,
            rotation: this.rotation,
            anchor: this.anchor
        });
        newNode.separateScale = this.separateScale;
        return newNode;
    }
}

class AnimationNode {
    constructor(node) {
        this.node = node;

        this.forward = true; // Animation direction

        this.time = 0.3;
        this.timer = 0;
        this.updateAnimation = null;
    }

    update(gameCanvas, deltaTime) {
        this.node.update(gameCanvas, deltaTime);

        if (this.forward) {
            this.timer += deltaTime;
            if (this.timer >= this.time) {
                // this.timer = 0;
                this.forward = false; // Reverse the animation direction
            }
        }
        else {
            this.timer -= deltaTime;
            if (this.timer <= 0) {
                this.timer = 0;
                this.forward = true; // Reverse the animation direction
            }
        }

        if (this.updateAnimation) {
            this.updateAnimation(this.node, clamp(this.timer / this.time, 0, 1));
        }
    }

    draw(gameCanvas) {
        this.node.draw(gameCanvas);
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

        this.fps = 0;
    }

    start() {
        this.lastTime = Date.now();
        setInterval(() => {
            this.fps = Math.round(1000 / (Date.now() - this.lastTime));
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
