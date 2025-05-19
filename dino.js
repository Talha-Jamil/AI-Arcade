document.addEventListener("DOMContentLoaded", function () {
    let canvas = document.getElementById("gameCanvas");
    let ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 200;

    function draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(50, 150, 30, 30); // Simple dino square
    }

    draw();
});