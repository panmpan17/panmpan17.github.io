const TWO_PI = Math.PI * 2;

function round(number, precision = 2) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

function moveForward(current, target, amount) {
    let delta = target - current;
    if (Math.abs(delta) < amount) {
        return target; // Move directly to target if within range
    }
    return current + Math.sign(delta) * amount;
}

function rotateRadianTowards(current, target, amount) {
    let delta = Math.abs(target - current);
    let delta2 = Math.abs(target - (current + TWO_PI));
    let delta3 = Math.abs(target - (current - TWO_PI));

    let result;
    if (delta < delta2 && delta < delta3) {
        result = moveForward(current, target, amount);
    } else if (delta2 < delta3) {
        result = moveForward(current + TWO_PI, target, amount) - TWO_PI;
    } else {
        result = moveForward(current - TWO_PI, target, amount) + TWO_PI;
    }

    if (result < 0) {
        result += TWO_PI; // Ensure result is within [0, 2π]
    } else if (result >= TWO_PI) {
        result -= TWO_PI; // Ensure result is within [0, 2π]
    }
    return result;
}


class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    sqrMagnitude() {
        return this.x * this.x + this.y * this.y;
    }

    magnitude() {
        return Math.sqrt(this.sqrMagnitude());
    }

    clampMagnitude(maxLength) {
        let length = this.magnitude();
        if (length > maxLength) {
            return this.multiply(maxLength / length);
        }
        return this;
    }

    normalize() {
        let length = this.magnitude();
        if (length === 0) return new Vector(0, 0);
        return new Vector(this.x / length, this.y / length);
    }

    getAngleInRadians() {
        return Math.atan2(this.y, this.x);
    }

    getAngleInDegrees() {
        return this.getAngleInRadians() * (180 / Math.PI);
    }

    moveTowards(target, amount) {
        let delta = target.subtract(this);
        if (delta.sqrMagnitude() < amount * amount) {
            return target; // Move directly to target if within range
        }
        return this.add(delta.normalize().multiply(amount));
    }
}

const VectorZero = new Vector(0, 0);

