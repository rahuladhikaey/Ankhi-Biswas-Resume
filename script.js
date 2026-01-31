// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Default to 'classic' (Old Dark Mode) per user request
const savedTheme = localStorage.getItem('theme') || 'classic';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    // Toggle between 'classic' and 'cyber' (which is default/red-blue)
    const newTheme = currentTheme === 'classic' ? 'cyber' : 'classic';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Dispatch event for Three.js
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
});

// Remove Loader
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    gsap.to(loader, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => loader.style.display = 'none'
    });

    // Animate Hero Elements
    const tl = gsap.timeline();
    tl.from('.badge', { y: 20, opacity: 0, duration: 0.6, delay: 0.5 })
        .from('h1', { y: 30, opacity: 0, duration: 0.8 }, "-=0.4")
        .from('p', { y: 20, opacity: 0, duration: 0.6 }, "-=0.6")
        .from('.hero-btns', { y: 20, opacity: 0, duration: 0.6 }, "-=0.4");
});

// Scroll Animations
gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray('.glass').forEach(card => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
    });
});

// THREE.JS DNA HELIX
const initThreeJS = () => {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Particles (DNA Structure)
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    const color1 = new THREE.Color(0x0ea5e9); // Blue
    const color2 = new THREE.Color(0xec4899); // Pink

    for (let i = 0; i < particleCount; i++) {
        // Double Helix Maths
        const t = (i / particleCount) * Math.PI * 8; // 4 turns
        const radius = 3;

        // Strand 1
        let x = Math.cos(t) * radius;
        let y = (i / particleCount) * 20 - 10;
        let z = Math.sin(t) * radius;

        positions.push(x, y, z);
        colors.push(color1.r, color1.g, color1.b);

        // Strand 2 (Offset by PI)
        x = Math.cos(t + Math.PI) * radius;
        z = Math.sin(t + Math.PI) * radius;

        positions.push(x, y, z);
        colors.push(color2.r, color2.g, color2.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));


    const material = new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Connecting lines (bases)
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.2
    });

    // Create random rungs
    const rungsGeometry = new THREE.BufferGeometry();
    const rungsPos = [];

    for (let i = 0; i < particleCount; i += 5) {
        const t = (i / particleCount) * Math.PI * 8;
        const radius = 3;
        const y = (i / particleCount) * 20 - 10;

        // Strand 1 pos
        rungsPos.push(Math.cos(t) * radius, y, Math.sin(t) * radius);
        // Strand 2 pos
        rungsPos.push(Math.cos(t + Math.PI) * radius, y, Math.sin(t + Math.PI) * radius);
    }

    rungsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rungsPos, 3));
    const lines = new THREE.LineSegments(rungsGeometry, lineMaterial);
    scene.add(lines);

    // Animation Loop
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const animate = () => {
        requestAnimationFrame(animate);

        // Rotate entire helix
        particles.rotation.y += 0.002;
        lines.rotation.y += 0.002;

        // Gentle float
        particles.position.y = Math.sin(Date.now() * 0.001) * 0.5;
        lines.position.y = Math.sin(Date.now() * 0.001) * 0.5;

        // Mouse parallax
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 2 + 2 - camera.position.y) * 0.05; // Base Y is 2
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

};

initThreeJS();
