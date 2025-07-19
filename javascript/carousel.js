const ImageCarousel = {
    props: {
        images: {
            type: Array,
            required: true
        },
        interval: {
            type: Number,
            default: 3000
        }
    },
    template: `<div  class="image-carousel" @mouseenter="pause" @mouseleave="resume">
                <img :src="images[currentIndex]" class="carousel-image" alt="carousel image" />
            </div>`,
    data() {
        return {
            currentIndex: 0,
            timer: null
        };
    },
    methods: {
        start() {
            this.stop();
            this.timer = setInterval(() => {
                this.currentIndex = (this.currentIndex + 1) % this.images.length;
            }, this.interval);
        },
        stop() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },
        pause() {
            this.stop();
        },
        resume() {
            this.start();
        }
    },
    mounted() {
        this.start();
    },
    beforeUnmount() {
        this.stop();
    }
};