// Create simple placeholder logos for the games
const canvas = document.createElement('canvas');
canvas.width = 100;
canvas.height = 100;
const ctx = canvas.getContext('2d');

// Create Dino logo
ctx.fillStyle = '#535353';
ctx.fillRect(0, 0, 100, 100);
ctx.fillStyle = 'white';
ctx.fillRect(20, 30, 60, 40);
ctx.fillStyle = '#535353';
ctx.fillRect(30, 40, 10, 10); // Eye
ctx.fillRect(20, 70, 15, 20); // Leg
ctx.fillRect(60, 70, 15, 20); // Leg
const dinoLogo = canvas.toDataURL();

// Create Flappy Bird logo
ctx.clearRect(0, 0, 100, 100);
ctx.fillStyle = '#70c5ce'; // Sky blue
ctx.fillRect(0, 0, 100, 100);
ctx.fillStyle = '#f8e71c'; // Yellow
ctx.beginPath();
ctx.arc(50, 50, 30, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(60, 40, 10, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = 'black';
ctx.beginPath();
ctx.arc(63, 40, 5, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = '#ff6b6b'; // Red
ctx.beginPath();
ctx.moveTo(70, 50);
ctx.lineTo(90, 45);
ctx.lineTo(70, 55);
ctx.closePath();
ctx.fill();
const flappyLogo = canvas.toDataURL();

// Create Chess logo
ctx.clearRect(0, 0, 100, 100);
ctx.fillStyle = '#f0d9b5'; // Light square
ctx.fillRect(0, 0, 100, 100);
for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
        if ((i + j) % 2 === 1) {
            ctx.fillStyle = '#b58863'; // Dark square
            ctx.fillRect(i * 25, j * 25, 25, 25);
        }
    }
}
ctx.fillStyle = 'black';
ctx.beginPath();
ctx.arc(50, 30, 10, 0, Math.PI * 2); // Knight head
ctx.fill();
ctx.fillRect(45, 40, 10, 30); // Knight body
const chessLogo = canvas.toDataURL();

// Create Tic-Tac-Toe logo
ctx.clearRect(0, 0, 100, 100);
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, 100, 100);
ctx.strokeStyle = 'black';
ctx.lineWidth = 3;
// Draw grid
ctx.beginPath();
ctx.moveTo(33, 10);
ctx.lineTo(33, 90);
ctx.moveTo(66, 10);
ctx.lineTo(66, 90);
ctx.moveTo(10, 33);
ctx.lineTo(90, 33);
ctx.moveTo(10, 66);
ctx.lineTo(90, 66);
ctx.stroke();
// Draw X
ctx.beginPath();
ctx.moveTo(15, 15);
ctx.lineTo(28, 28);
ctx.moveTo(28, 15);
ctx.lineTo(15, 28);
// Draw O
ctx.arc(50, 50, 10, 0, Math.PI * 2);
// Draw X
ctx.moveTo(72, 72);
ctx.lineTo(85, 85);
ctx.moveTo(85, 72);
ctx.lineTo(72, 85);
ctx.stroke();
const tictactoeLogo = canvas.toDataURL();

// Save the logos
document.getElementById('dino-logo').src = dinoLogo;
document.getElementById('flappy-logo').src = flappyLogo;
document.getElementById('chess-logo').src = chessLogo;
document.getElementById('tictactoe-logo').src = tictactoeLogo;
