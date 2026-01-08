/**
 * Background Animation - Tech/Programming Theme
 * Features: Floating particles (0s and 1s, nodes) connected by lines.
 * Handles resizing and reduced motion preference.
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationFrameId;
    let isPaused = false;
    
    // Configuration
    const config = {
        particleCount: 80, // Number of particles (adjusted by screen size later)
        connectionDistance: 150, // Max distance to draw lines
        mouseDistance: 200, // Mouse interaction radius
        baseSpeed: 0.5,
        colors: {
            bg: '#0B1120', // Dark deep blue/black
            particle: 'rgba(6, 182, 212, 0.7)', // Cyan
            line: 'rgba(6, 182, 212, 0.15)', // Faint cyan lines
            accent: '#10b981' // Green accent
        }
    };

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
        isPaused = true;
    }

    // Toggle Button Logic
    const toggleBtn = document.getElementById('animation-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isPaused = !isPaused;
            toggleBtn.setAttribute('aria-pressed', isPaused);
            toggleBtn.querySelector('span').textContent = isPaused ? '▶' : '⏸';
            if (!isPaused) loop();
        });
    }

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * config.baseSpeed;
            this.vy = (Math.random() - 0.5) * config.baseSpeed;
            this.size = Math.random() * 2 + 1;
            this.isText = Math.random() > 0.8; // 20% chance to be a binary digit
            this.text = Math.random() > 0.5 ? '1' : '0';
            this.color = Math.random() > 0.9 ? config.colors.accent : config.colors.particle;
        }

        update() {
            if (isPaused) return;
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.fillStyle = this.color;
            if (this.isText) {
                ctx.font = '12px monospace';
                ctx.fillText(this.text, this.x, this.y);
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Initialization
    function init() {
        resize();
        createParticles();
        loop();
        window.addEventListener('resize', resize);
    }

    // Resize handling
    function resize() {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
        
        // Adjust particle count for density
        const area = width * height;
        config.particleCount = Math.floor(area / 15000); // e.g., 1920x1080 -> ~138 particles
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Animation Loop
    function loop() {
        if (isPaused) return;
        
        ctx.clearRect(0, 0, width, height);
        
        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        connectParticles();

        animationFrameId = requestAnimationFrame(loop);
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.connectionDistance) {
                    ctx.beginPath();
                    // Opacity based on distance
                    const opacity = 1 - (distance / config.connectionDistance);
                    ctx.strokeStyle = `rgba(6, 182, 212, ${opacity * 0.2})`; // using fixed color for lines for perf
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    init();
});
