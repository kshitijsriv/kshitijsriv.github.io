document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('transit-map');
    if (!canvas) {
        console.error('Canvas element #transit-map not found.');
        return;
    }
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        init();
    });

    const isDarkMode = document.documentElement.classList.contains('dark');

    const STATIONS_COUNT = 20;
    const VEHICLE_COUNT = 25;
    const STATION_RADIUS = 3;
    const CONNECTION_MAX_DISTANCE = 250;

    let stations = [];
    let vehicles = [];

    const colors = {
        station: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
        route: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(203, 213, 225, 0.4)',
        vehicle: isDarkMode ? '#60a5fa' : '#3b82f6'
    };

    class Station {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.connections = [];
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, STATION_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = colors.station;
            ctx.fill();
        }
    }

    class Vehicle {
        constructor() {
            this.reset();
        }

        reset() {
            const startStation = stations[Math.floor(Math.random() * stations.length)];
            if (!startStation || startStation.connections.length === 0) {
                // Can't start, try again later
                setTimeout(() => this.reset(), 1000);
                return;
            }
            const endStation = startStation.connections[Math.floor(Math.random() * startStation.connections.length)];

            this.startX = startStation.x;
            this.startY = startStation.y;
            this.endX = endStation.x;
            this.endY = endStation.y;
            this.progress = 0;
            this.speed = Math.random() * 0.003 + 0.002;
        }

        update() {
            this.progress += this.speed;
            if (this.progress >= 1) {
                this.reset();
            }
        }

        draw() {
            const x = this.startX + (this.endX - this.startX) * this.progress;
            const y = this.startY + (this.endY - this.startY) * this.progress;

            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = colors.vehicle;
            ctx.shadowColor = colors.vehicle;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow
        }
    }

    function init() {
        stations = [];
        vehicles = [];

        // Create stations
        for (let i = 0; i < STATIONS_COUNT; i++) {
            stations.push(new Station(Math.random() * width, Math.random() * height));
        }

        // Create connections
        for (let i = 0; i < stations.length; i++) {
            for (let j = i + 1; j < stations.length; j++) {
                const dist = Math.hypot(stations[i].x - stations[j].x, stations[i].y - stations[j].y);
                if (dist < CONNECTION_MAX_DISTANCE) {
                    stations[i].connections.push(stations[j]);
                    stations[j].connections.push(stations[i]);
                }
            }
        }

        // Create vehicles
        for (let i = 0; i < VEHICLE_COUNT; i++) {
            vehicles.push(new Vehicle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw routes
        ctx.strokeStyle = colors.route;
        ctx.lineWidth = 0.5;
        stations.forEach(station => {
            station.connections.forEach(neighbor => {
                ctx.beginPath();
                ctx.moveTo(station.x, station.y);
                ctx.lineTo(neighbor.x, neighbor.y);
                ctx.stroke();
            });
        });

        // Draw stations
        stations.forEach(s => s.draw());

        // Update and draw vehicles
        vehicles.forEach(v => {
            v.update();
            v.draw();
        });

        requestAnimationFrame(animate);
    }

    init();
    animate();
});
