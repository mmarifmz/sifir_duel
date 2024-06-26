// fireworks.js

class Fireworks {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.running = false;
        this.maxParticles = 100;
        this.colorPalette = ['#FFD700', '#FF6347', '#00FFFF', '#7FFF00', '#FF00FF']; // Example colors
    }

    start() {
        this.running = true;
        this.animate();
    }

    stop() {
        this.running = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        if (!this.running) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.particles.length < this.maxParticles && Math.random() < 0.1) {
            this.createParticle();
        }

        this.particles.forEach((particle, index) => {
            particle.update();
            particle.draw();

            if (particle.alpha <= 0) {
                this.particles.splice(index, 1);
            }
        });

        requestAnimationFrame(() => this.animate());
    }

    createParticle() {
        const x = this.canvas.width / 2;
        const y = this.canvas.height;

        const particle = new Particle(x, y, this.ctx, this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)]);
        this.particles.push(particle);
    }
}

class Particle {
    constructor(x, y, ctx, color) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.color = color;
        this.radius = Math.random() * 3 + 1;
        this.speed = { x: Math.random() * 6 - 3, y: Math.random() * -6 - 3 };
        this.alpha = 1;
    }

    update() {
        this.x += this.speed.x;
        this.y += this.speed.y;
        this.alpha -= 0.01;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.globalAlpha = this.alpha;
        this.ctx.fill();
    }
}
