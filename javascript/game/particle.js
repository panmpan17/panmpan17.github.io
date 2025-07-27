const eParticleShape = {
    Dot: 0,
    Circle: 1,
    Square: 2,
};

const eParticleImage = {
    Circle: 0,
    Images: 1,
    Rect: 2,
};


class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.rotation = 0;
        this.lifetime = 0; // in seconds
        this.lifetimeLeft = 0; // in seconds
        this.scale = 1;
        this.opacity = 1; // 0 to 1
        // this.enabled = false;
        this.imageIndex = 0;
    }
}

class ParticleSystem {
    constructor(particleCount = 100) {
        this.pos = new Vector(0, 0);

        this.spawnShape = eParticleShape.Dot;
        this.spawnShapeSize = 1;
        this.spawnShapeSizeB = 1;

        this.particleImage = eParticleImage.Circle;
        this.particleImageSize = new Range(5, 5);
        this.images = [];
        this.color = "white"; // Default color for particles

        this.velocityRange = new Range(40, 80); // Velocity range for particles
        this.lifetimeRange = new Range(1, 4); // Lifetime between 1 and 4 seconds
        this.opacityRange = new Range(0.5, 1); // Opacity range for particles

        this.spawnPerSeconds = 10; // Number of particles to spawn per second
        this.timeSinceLastSpawn = 0;
        this.spawningEnabled = false;

        this.lifeTime = 0;
        this.lifeTimer = 0;
        this.lifeTimeFinishFunc = null;

        this.direction = null;

        this.particles = [];

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle());
        }
    }

    burst(count = undefined) {
        if (count === undefined) {
            count = this.particles.length;
        }
        this.lifeTimer = 0;
        for (let i = 0; i < count; i++) {
            this.spawnParticle();
        }
    }

    spawnParticle() {
        let x = this.pos.x;
        let y = this.pos.y;

        switch (this.spawnShape) {
            case eParticleShape.Dot:
                // No additional logic needed for dot shape
                break;
            case eParticleShape.Circle:
                // For circle, we can add some random offset
                x += (Math.random() - 0.5) * this.spawnShapeSize;
                y += (Math.random() - 0.5) * this.spawnShapeSize;

                let length = Math.sqrt(x * x + y * y);
                if (length > 0) {
                    x = (x / length) * this.spawnShapeSize;
                    y = (y / length) * this.spawnShapeSize;
                }
                break;
            case eParticleShape.Square:
                // For square, we can add some random offset
                x += (Math.random() - 0.5) * this.spawnShapeSize;
                y += (Math.random() - 0.5) * this.spawnShapeSizeB;
                break;
        }

        // TODO: use argument to control particle velocity
        let randomValue = this.velocityRange.random();

        
        let velocityX;
        let velocityY;
        if (this.direction) {
            // If direction is set, use it to calculate velocity
            // let angle = this.direction.getAngleInRadians();
            velocityX = Math.cos(this.direction) * randomValue;
            velocityY = Math.sin(this.direction) * randomValue;
        }
        else
        {
            velocityX = (Math.random() - 0.5) * randomValue;
            velocityY = (Math.random() - 0.5) * randomValue;
        }

        let lifetime = this.lifetimeRange.random();
        // let opacity = Math.random(); // Random opacity between 0 and 1

        for (let particle of this.particles) {
            if (particle.lifetimeLeft <= 0) {
                particle.x = x;
                particle.y = y;
                particle.velocityX = velocityX;
                particle.velocityY = velocityY;
                particle.rotation = Math.random() * 2 * Math.PI; // Random rotation
                particle.lifetime = lifetime;
                particle.lifetimeLeft = lifetime; // Reset lifetime
                particle.opacity = this.opacityRange.random(); // Reset scale
                particle.scale = this.particleImageSize.random();

                if (this.particleImage === eParticleImage.Images && this.images.length > 0) {
                    // Randomly select an image index
                    particle.imageIndex = randomInt(0, this.images.length - 1);
                }
                return;
            }
        }
    }

    update(gameCanvas, deltaTime) {
        if (this.lifeTime > 0) {
            this.lifeTimer += deltaTime;
            if (this.lifeTimer >= this.lifeTime) {
                if (this.lifeTimeFinishFunc) {
                    this.lifeTimeFinishFunc(this);
                    this.lifeTimeFinishFunc = null;
                }
                return;
            }
        }

        if (this.spawningEnabled && this.spawnPerSeconds > 0) {
            this.timeSinceLastSpawn += deltaTime;
            if (this.timeSinceLastSpawn >= (1 / this.spawnPerSeconds)) {
                this.spawnParticle();
                this.timeSinceLastSpawn = 0;
            }
        }

        for (let particle of this.particles) {
            if (particle.lifetimeLeft <= 0) {
                continue;
            }

            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            particle.lifetimeLeft -= deltaTime;
        }
    }

    draw(gameCanvas) {
        if (this.lifeTime > 0 && this.lifeTimer >= this.lifeTime) {
            return;
        }

        let globalAlpha = gameCanvas.context.globalAlpha;
        for (let particle of this.particles) {
            if (particle.lifetimeLeft > 0) {
                let pos = gameCanvas.camera.worldToScreen(particle.x, particle.y);
                gameCanvas.context.globalAlpha = lerp(particle.opacity, 0, 1 - particle.lifetimeLeft / particle.lifetime);

                switch (this.particleImage) {
                    case eParticleImage.Circle:
                        drawCircle(gameCanvas.context, pos.x, pos.y, this.scale, this.color);
                        break;
                    case eParticleImage.Rect:
                        drawRect(gameCanvas.context, pos.x, pos.y, particle.scale, particle.scale, this.color, particle.rotation);
                        break;
                    case eParticleImage.Images:
                        // If you want to use images, you can add logic here
                        // For now, we will just draw a circle
                        let image = this.images[particle.imageIndex];
                        let width = image.width * particle.scale;
                        let height = image.height * particle.scale;
                        gameCanvas.context.save();
                        gameCanvas.context.translate(pos.x, pos.y);
                        gameCanvas.context.rotate(particle.rotation);
                        gameCanvas.context.drawImage(image, -width / 2, -height / 2, width, height);
                        gameCanvas.context.restore();
                        break;
                }
            }
        }
        gameCanvas.context.globalAlpha = globalAlpha;
    }

    reset() {
        this.timeSinceLastSpawn = 0;
        this.lifeTimer = 0;
        this.spawningEnabled = false;

        for (let particle of this.particles) {
            particle.lifetimeLeft = 0; // Reset all particles
        }
    }
}