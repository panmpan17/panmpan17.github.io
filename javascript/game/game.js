let game = null;

class FollowCamera {
    constructor({ camera, target }) {
        this.camera = camera;
        this.target = target; // The node to follow
    }

    update(gameCanvas, deltaTime) {
        if (this.target) {
            this.camera.pos.x = this.target.pos.x;
            this.camera.pos.y = this.target.pos.y;
            gameCanvas.onCameraMove();
        }
    }

    draw(gameCanvas) {}
}

class Bullet {
    constructor(x, y) {
        this.pos = VectorZero;
        this.rotation = 0; // In radians
        this.velocity = VectorZero;
        this.active = false;
        this.life = 0;
    }

    shoot(pos, rotation, velocity) {
        this.pos = pos;
        this.rotation = rotation;
        this.velocity = velocity;
        this.active = true;
        this.life = 0;
    }

    update(gameCanvas, deltaTime) {
        if (!this.active) {
            return;
        }

        this.pos = this.pos.add(this.velocity.multiply(deltaTime));

        this.life += deltaTime;
        if (this.life > 3) { // Bullet life time
            this.active = false;
        }
    }

    draw(gameCanvas) {
        if (!this.active) {
            return;
        }

        let width = 3;
        let height = 10;
        let fillStyle = gameCanvas.context.fillStyle;
        gameCanvas.context.save();
        let screenPos = gameCanvas.camera.worldToScreen(this.pos.x, this.pos.y);
        gameCanvas.context.fillStyle = "yellow";
        gameCanvas.context.translate(screenPos.x, screenPos.y);
        gameCanvas.context.rotate(this.rotation);
        gameCanvas.context.beginPath();
        gameCanvas.context.rect(-width / 2, -height / 2, width, height);
        gameCanvas.context.fill();  
        gameCanvas.context.restore();
        gameCanvas.context.fillStyle = fillStyle; // Restore original fill style
    }
}

class Ship extends SimpleImageNode {
    constructor(x, y) {
        super({ image: images.ship, x, y, scale: 0.8 });

        this.velocity = new Vector(0, 0);
        this.mouseDown = false;

        this.cursorCirclePosition = new Vector(0, 0);

        this.clampDistance = 100;
        this.flySpeed = 3;
        this.accelerationSpeed = 150;
        this.drag = 100;
        this.rotateSpeed = 4;

        this.smokeParticle = new ParticleSystem(200);
        this.smokeParticle.childPos = new Vector(0, 10);
        // particle.spawnShape = eParticleShape.Square;
        // particle.spawnShapeSize = 100;
        // particle.spawnShapeSizeB = 50;
        this.smokeParticle.particleImage = eParticleImage.Images;
        this.smokeParticle.particleImageSize = new Range(0.5, 0.8);
        this.smokeParticle.images = [images.dust1, images.dust2, images.dust3, images.dust4];
        this.smokeSpawnRange = new Range(0, 30);

        this.bullets = [];
        for (let i = 0; i < 15; i++) {
            this.bullets.push(new Bullet(0, i * -30));
        }
        this.fps = 0;

        this.shootBullet = true;
        this.shootInterval = 0.2; // Time between shots in seconds
        this.timeSinceLastShot = 0;

        this.bulletSpeed = 500;
    }

    update(gameCanvas, deltaTime) {
        this.fps = 1 / deltaTime;
        let isMoving = false;
        if (gameCanvas.mouseDown && gameCanvas.mouseInFrame) {
            isMoving = this.updateVelocity(gameCanvas, deltaTime);
        }

        if (!isMoving) {
            // Apply drag effect when not moving
            this.velocity = this.velocity.moveTowards(VectorZero, this.drag * deltaTime);
        }

        this.pos = this.pos.add(this.velocity.multiply(deltaTime));

        if (this.smokeParticle) {
            this.smokeParticle.direction = this.rotation + (3.14 / 2); // Rotate to face the direction of movement
            this.smokeParticle.pos = this.pos.add(this.smokeParticle.childPos.rotate(this.rotation));
            this.smokeParticle.update(gameCanvas, deltaTime);
        }

        this.updateBullet(gameCanvas, deltaTime);
    }

    updateVelocity(gameCanvas, deltaTime) {
        let delta = gameCanvas.mousePositionWorld.subtract(this.pos);
        let targetRotation = delta.getAngleInRadians() + (3.14 / 2);

        this.rotation = rotateRadianTowards(this.rotation, targetRotation, this.rotateSpeed * deltaTime);

        if (delta.sqrMagnitude() > 0.01) {
            let clamedDelta = delta.clampMagnitude(this.clampDistance);
            this.cursorCirclePosition = this.pos.add(clamedDelta);
            let targetVelocity = clamedDelta.multiply(this.flySpeed); // Speed factor
            this.velocity = this.velocity.moveTowards(targetVelocity, this.accelerationSpeed * deltaTime);

            let speedPercentage = clamedDelta.sqrMagnitude() / (this.clampDistance * this.clampDistance);
            this.smokeParticle.spawnPerSeconds = this.smokeSpawnRange.lerp(speedPercentage);

            // TODO: Add effect for drag point
            return true;
        }

        return false;
    }

    updateBullet(gameCanvas, deltaTime) {
        let shootNewBullet = false;
        if (this.shootBullet) {
            this.timeSinceLastShot += deltaTime;
            if (this.timeSinceLastShot >= this.shootInterval) {
                shootNewBullet = true;
                this.timeSinceLastShot = 0;
            }
        }

        for (let bullet of this.bullets) {
            if (!bullet.active && shootNewBullet) {
                let bulletVelocity = VectorUp.rotate(this.rotation).multiply(this.bulletSpeed); // Bullet speed
                bullet.shoot(this.pos, this.rotation, bulletVelocity);
                shootNewBullet = false; // Only shoot one bullet at a time
            }
            bullet.update(gameCanvas, deltaTime);
        }
    }

    draw(gameCanvas) {
        if (this.smokeParticle) {
            this.smokeParticle.draw(gameCanvas);
        }

        super.draw(gameCanvas);

        // drawText(gameCanvas.context, `Pos: ${round(this.pos.x)}, ${round(this.pos.y)}`, 10, 20);
        // drawText(gameCanvas.context, `Vel: ${round(this.velocity.x)}, ${round(this.velocity.y)}`, 10, 40);
        // drawText(gameCanvas.context, `Rot: ${round(this.rotation)}`, 10, 60);
        // drawText(gameCanvas.context, `FPS: ${Math.round(this.fps)}`, 10, 80);

        // let delta = gameCanvas.mousePositionWorld.subtract(this.pos);

        if (gameCanvas.mouseInFrame && gameCanvas.mouseDown) {
            let screenPos = gameCanvas.camera.worldToScreen(this.cursorCirclePosition.x, this.cursorCirclePosition.y);
            drawCircle(gameCanvas.context, screenPos.x, screenPos.y, 5, 'red');
        }

        for (let bullet of this.bullets) {
            bullet.draw(gameCanvas);
        }
    }

    onMouseDown(event) {
        this.mouseDown = true;
        if (this.smokeParticle) {
            this.smokeParticle.spawningEnabled = true;
        }
    }

    onMouseUp(event) {
        this.mouseDown = false;
        if (this.smokeParticle) {
            this.smokeParticle.spawningEnabled = false;
        }
    }
}

class Asteroid extends SimpleImageNode {
    constructor(scale) {
        super({ image: images.asteroid, x: 0, y: 0, scale });
        this.velocity = VectorZero;
        this.active = false;
    }

    setPositionAndVelocity(pos, velocity) {
        this.pos = pos;
        this.velocity = velocity;
        this.rotation = Math.random() * 2 * Math.PI;
    }

    update(gameCanvas, deltaTime) {
        if (!this.active) {
            return;
        }
        this.pos = this.pos.add(this.velocity.multiply(deltaTime));
    }

    getCollisionRadius() {
        return this.image.width * this.scale / 2 * 0.7;
    }

    draw(gameCanvas) {
        if (!this.active) {
            return;
        }
        super.draw(gameCanvas);

        // let pos = gameCanvas.camera.worldToScreen(this.pos.x, this.pos.y);
        // drawWiredCircle(gameCanvas.context, 
        //     pos.x, 
        //     pos.y, 
        //     this.getCollisionRadius(), 'white');
    }
}

class Boundary {
    constructor(target, spawnObjectBorder, despawnObjectBorder) {
        this.target = target;
        this.spawnObjectBorder = spawnObjectBorder;
        this.despawnObjectBorder = despawnObjectBorder;

        this.largeAsteroids = [];
        this.smallAsteroids = [];
        this.asteroids = [];

        const ASTEROID_COUNT = 6;
        for (let i = 0; i < ASTEROID_COUNT; i++) {
            this.largeAsteroids.push(new Asteroid(1));
            this.asteroids.push(this.largeAsteroids[i]);
        }
        for (let i = 0; i < ASTEROID_COUNT * 2; i++) {
            this.smallAsteroids.push(new Asteroid(0.5));
            this.asteroids.push(this.smallAsteroids[i]);
        }

        this.asteroidRandomSpeed = new Range(50, 100);
        this.asteroidRandomScale = new Range(0.5, 1.5);
        this.targetAsteroidCount = 5;

        this.currentAsteroidCount = 0;
    }

    shouldDespawn(point) {
        let deltaX = point.x - this.target.pos.x;
        let deltaY = point.y - this.target.pos.y;
        return !(Math.abs(deltaX) <= this.despawnObjectBorder.x / 2 && Math.abs(deltaY) <= this.despawnObjectBorder.y / 2);
    }

    update(gameCanvas, deltaTime) {
        // console.log(`Current Asteroid Count: ${this.currentAsteroidCount}, Target: ${this.targetAsteroidCount}`);
        if (this.currentAsteroidCount < this.targetAsteroidCount) {
            this.spawnLargeAsteroid(gameCanvas);
        }

        for (let i = 0; i < this.asteroids.length; i++) {
            if (this.asteroids[i].active) {
                this.asteroids[i].update(gameCanvas, deltaTime);

                // Check if the asteroid is outside the despawn border
                if (this.shouldDespawn(this.asteroids[i].pos)) {
                    this.asteroids[i].active = false;
                    this.currentAsteroidCount--;
                }
                else if (this.checkAsteroidAgainstBullets(this.asteroids[i])) {
                    this.asteroids[i].active = false;
                    this.currentAsteroidCount--;

                    gameCanvas.onAsteroidHit(this.asteroids[i].pos, this.asteroids[i].scale);

                    if (this.asteroids[i].scale >= 1) {
                        this.spawnSmallAsteroid(this.asteroids[i].pos, 0.5);
                        this.spawnSmallAsteroid(this.asteroids[i].pos, 0.5);
                    }
                }
            }
        }
    }

    checkAsteroidAgainstBullets(asteroid) {
        let asteroidRadius = asteroid.getCollisionRadius();
        for (let bullet of this.target.bullets) {
            if (bullet.active) {
                let delta = asteroid.pos.subtract(bullet.pos);
                if (delta.sqrMagnitude() < (asteroidRadius * asteroidRadius)) {
                    // Bullet hit the asteroid
                    bullet.active = false; // Deactivate the bullet
                    return true; // Asteroid was hit
                }

            }
        }
        return false;
    }

    spawnLargeAsteroid() {
        this.spawnAsteroid(this.largeAsteroids);
        this.currentAsteroidCount++;
    }

    spawnSmallAsteroid(pos, speedFactor = 1) {
        this.spawnAsteroid(this.smallAsteroids, pos, speedFactor);
    }

    spawnAsteroid(asteroidList, pos, speedFactor = 1) {
        for (let i = 0; i < asteroidList.length; i++) {
            if (!asteroidList[i].active) {
                if (!pos) {
                    let x, y;
                    if (Math.random() < 0.5) {
                        x = Math.random() * this.spawnObjectBorder.x + this.target.pos.x - this.spawnObjectBorder.x / 2;
                        y = Math.random() < 0.5 ? this.target.pos.y - this.spawnObjectBorder.y / 2 : this.target.pos.y + this.spawnObjectBorder.y / 2;
                    } else {
                        x = Math.random() < 0.5 ? this.target.pos.x - this.spawnObjectBorder.x / 2 : this.target.pos.x + this.spawnObjectBorder.x / 2;
                        y = Math.random() * this.spawnObjectBorder.y + this.target.pos.y - this.spawnObjectBorder.y / 2;
                    }
                    pos = new Vector(x, y);
                }

                let scale = this.asteroidRandomScale.random();
                let velocity = getRandomVector().multiply(this.asteroidRandomSpeed.random() * speedFactor);

                asteroidList[i].setPositionAndVelocity(pos, velocity);
                asteroidList[i].active = true;
                return;
            }
        }
    }

    draw(gameCanvas) {
        for (let i = 0; i < this.asteroids.length; i++) {
            if (this.asteroids[i].active) {
                this.asteroids[i].draw(gameCanvas);
            }
        }
    }
}

class Game extends GameCanvas {
    constructor() {
        super('gameCanvas');

        const width = window.innerWidth;
        const height = window.innerHeight;
        this.canvas.width = width - 20;
        this.canvas.height = height - 20;

        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));

        this.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
        this.canvas.addEventListener("touchmove", this.onTouchMove.bind(this));
        this.canvas.addEventListener("touchend", this.onTouchEnd.bind(this));
        this.canvas.addEventListener("touchcancel", this.onTouchCancel.bind(this));
    }

    setup() {
        this.camera = new Camera({
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        });

        this.mouseInFrame = false;
        this.mousePosition = new Vector(0, 0);
        this.mousePositionWorld = new Vector(0, 0);
        this.mouseDown = false;

        this.lastTime = null;

        this.ship = new Ship(0, 0);
        this.followCamera = new FollowCamera({
            camera: this.camera,
            target: this.ship
        });

        this.score = 0;

        this.boundary = new Boundary(
            this.ship,
            new Vector(this.canvas.width * 1.3, this.canvas.height * 1.3), // Spawn border
            new Vector(this.canvas.width * 1.5, this.canvas.height * 1.5) // Despawn border
        );

        this.explosionEffectParticle = new EffectsPool(() => {
            let burstParticle = new ParticleSystem(15);
            burstParticle.spawningEnabled = true;
            burstParticle.pos = VectorZero;
            burstParticle.particleImage = eParticleImage.Rect;
            burstParticle.particleImageSize = new Range(15, 25);
            burstParticle.spawnPerSeconds = 0;
            burstParticle.velocityRange = new Range(300, 350); // Velocity range for particles
            burstParticle.lifetimeRange = new Range(1, 2); // Lifetime between 1 and 2 seconds
            burstParticle.opacityRange = new Range(0.8, 1); // Opacity range for particles
            burstParticle.lifeTime = 2;
            burstParticle.color = "#9BADB7";
            return burstParticle;
        }, 20);

        this.children.push(
            this.ship,
            this.followCamera,
            this.boundary,
            this.explosionEffectParticle
        );
    }

    drawUI() {
        drawText(this.context, `Score ${this.score}`, 10, 20);
    }

    onMouseEnter(event) {
        this.mouseInFrame = true;
    }
    onMouseLeave(event) {
        this.mouseInFrame = false;
    }
    onMouseDown(event) {
        this.mouseDown = true;

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].onMouseDown && this.children[i].onMouseDown(event);
        }
    }
    onMouseUp(event) {
        this.mouseDown = false;

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].onMouseUp && this.children[i].onMouseUp(event);
        }
    }
    onMouseMove(event) {
        this.mousePosition.x = event.offsetX;
        this.mousePosition.y = event.offsetY;
        this.mousePositionWorld = this.camera.screenToWorld(this.mousePosition.x, this.mousePosition.y);
    }
    onCameraMove(event) {
        this.mousePositionWorld = this.camera.screenToWorld(this.mousePosition.x, this.mousePosition.y);
    }

    onTouchStart(event) {
        event.preventDefault();
        this.mouseDown = true;
        this.mouseInFrame = true;

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].onMouseDown && this.children[i].onMouseDown(event);
        }
    }
    onTouchMove(event) {
        event.preventDefault();
        if (event.touches.length > 0) {
            let touch = event.touches[0];
            this.mousePosition.x = touch.clientX - this.canvas.getBoundingClientRect().left;
            this.mousePosition.y = touch.clientY - this.canvas.getBoundingClientRect().top;
            this.mousePositionWorld = this.camera.screenToWorld(this.mousePosition.x, this.mousePosition.y);
        }
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].onMouseMove && this.children[i].onMouseMove(event);
        }
    }
    onTouchEnd(event) {
        event.preventDefault();
        this.mouseDown = false;

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].onMouseUp && this.children[i].onMouseUp(event);
        }
    }
    onTouchCancel(event) {
        event.preventDefault();
        this.mouseDown = false;
        this.mouseInFrame = false;
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].onMouseLeave && this.children[i].onMouseLeave(event);
        }
    }

    onAsteroidHit(pos, scale) {
        // alert(`Asteroid hit at ${pos.x}, ${pos.y} with scale ${scale}`);
        this.score += Math.round(scale * 10); // Increase score based on asteroid size

        let explosion = this.explosionEffectParticle.get();
        explosion.pos = pos;

        let length = explosion.particles.length;
        explosion.burst(randomInt(length / 2, length));
    }
}

(function() {

    // Load images
    Promise.all([
        loadImage('ship', '/images/game/ship.png'),
        loadImage('asteroid', '/images/game/stone.png'),
        loadImage('dust1', '/images/game/dust_1.png'),
        loadImage('dust2', '/images/game/dust_2.png'),
        loadImage('dust3', '/images/game/dust_3.png'),
        loadImage('dust4', '/images/game/dust_4.png'),
        // Add more images as needed
    ]).then(() => {
        console.log('All images loaded successfully');
        game = new Game();
        game.setup();
        game.start();
    }).catch(error => {
        console.error(error);
    });
})();