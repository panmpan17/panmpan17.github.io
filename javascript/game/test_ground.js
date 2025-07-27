class TestingGround extends GameCanvas {
    setup() {
        this.camera = new Camera({
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        });

        // let shipFire = new ShipFire();

        this.children.push(
            // shipFire
        );
    }
}