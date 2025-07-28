
class TestingGround extends GameCanvas {
    setup() {
        this.camera = new Camera({
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        });

        this.canvas.style.border = '1px solid black';

        this.canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
        this.canvas.addEventListener('mouseup', (event) => this.onMouseUp(event));
        this.canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
        
        this.mousePosition = new Vector(0, 0);
        this.mousePositionWorld = new Vector(0, 0);
        this.mouseDown = false;

        // let shipFire = new ShipFire();
        let joystick = new VirtualJoystick();

        this.children.push(
            // shipFire
            joystick
        );
    }

    onMouseDown(event) {
        this.mouseDown = true;

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].onMouseDown && this.children[i].onMouseDown(this);
        }
    }
    onMouseUp(event) {
        this.mouseDown = false;

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].onMouseUp && this.children[i].onMouseUp(this);
        }
    }
    onMouseMove(event) {
        this.mousePosition.x = event.offsetX;
        this.mousePosition.y = event.offsetY;
        this.mousePositionWorld = this.camera.screenToWorld(this.mousePosition.x, this.mousePosition.y);
    }
}