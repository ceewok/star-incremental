const canvas = document.getElementById("canvas");
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
const shopTooltip = document.getElementById("cursor-tooltip");

const buttons = document.querySelectorAll(".shopButton");
const shopCanvas = document.getElementById("shopCanvas");
shopCanvas.width  = window.innerWidth;
shopCanvas.height = window.innerHeight;
const shopCTX = shopCanvas.getContext("2d");

let mouse = {x : 0, y:0};

let gameState = {
    stars : [],
    score : 0,
    lastSpawnTime : 0,
    secondsPassed : 0,
    shopOpen : false,
    prevMouse : {x:0, y:0}
}

let stats = {
    spawnInterval : .01,
    maxStars : 1000,
    cursorRadius : 30,
    starValue : 1
}

let cutscenes = {
    shopScene : false
}

function clearCanvas() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    shopCTX.clearRect(0,0, shopCanvas.width, shopCanvas.height);
}

class Star {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
    }
}

function spawnStar(){
    let newStarX = Math.random() * canvas.width;
    let newStarY = Math.random() * canvas.height;
    let newStar = new Star(newStarX, newStarY);
    gameState.stars.push(newStar);
}

function render(){
    clearCanvas();

    gameState.stars.forEach(star => {
    star.draw();
    });

    if(!gameState.shopOpen){
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, stats.cursorRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = "white";
        ctx.stroke();
    }else{
        buttons.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            let width = rect.right - rect.left;
            let height = rect.bottom - rect.top;
            let x = rect.left + (width/2);
            let y = rect.top + (height/2);
            shopCTX.beginPath();
            shopCTX.arc(x, y, 2, 0, 2 * Math.PI);
            shopCTX.fillStyle = "white";
            shopCTX.fill();
        });
    }
    

}

function collectStars(){
    // Endpoints of the mouse movement line segment
    const ax = gameState.prevMouse.x;
    const ay = gameState.prevMouse.y;
    const bx = mouse.x;
    const by = mouse.y;

    // Segment vector AB components
    const abx = bx - ax;
    const aby = by - ay;
    const abLengthSq = abx * abx + aby * aby;

    const minDist = 1 + stats.cursorRadius;

    for(let i = gameState.stars.length - 1; i >= 0; i--){
        let star = gameState.stars[i];
        let dist;

        // If the mouse didn't move, just check distance to the current position
        if (abLengthSq === 0) {
            dist = Math.hypot(star.x - bx, star.y - by);
        } else {
            // Vector from start (A) to the star (P)
            const apx = star.x - ax;
            const apy = star.y - ay;

            // Calculate projection factor 't' and clamp it between 0 and 1
            let t = (apx * abx + apy * aby) / abLengthSq;
            t = Math.max(0, Math.min(1, t));

            // Find the closest point on the segment to the star
            const closestX = ax + t * abx;
            const closestY = ay + t * aby;

            // Shortest distance from the star to the mouse movement path
            dist = Math.hypot(star.x - closestX, star.y - closestY);
        }

        // Collision check
        if(dist < minDist){
            gameState.score += stats.starValue;
            gameState.stars.splice(i, 1);
        }
    }
}

function gameLoop(timestamp){

    gameState.secondsPassed = timestamp / 1000;

    if(!gameState.shopOpen){

        let spawnTimeReady = gameState.secondsPassed - gameState.lastSpawnTime >= stats.spawnInterval;

        let maxStarsNotReached = gameState.stars.length < stats.maxStars;

        if(spawnTimeReady && maxStarsNotReached){
            gameState.lastSpawnTime = gameState.secondsPassed;
            spawnStar();
        }

        collectStars();

        if(gameState.score > 10 && !cutscenes.shopScene){
            cutscenes.shopScene = true;
        }

    }

    render();
    requestAnimationFrame(gameLoop);
}

function openShop(){
    const shop = document.getElementById("shopContainer");
    const pointsDisplay = shop.querySelector("#pointsDisplay");
    shop.classList.remove("hidden");

    pointsDisplay.innerText = "Stars: " + gameState.score;
}

function closeShop(){
    const shop = document.getElementById("shopContainer");
    shop.classList.add("hidden");
}

function shopHandler(input){
    if(input == '2x multiplier'){
        stats.starValue *= 2;
        console.log(`New multiplier of ${stats.starValue}`);
    }
}

window.addEventListener("mousemove", (event) => {
    gameState.prevMouse.x = mouse.x;
    gameState.prevMouse.y = mouse.y;
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

window.addEventListener("keypress", event => {
    let keyPressed = event.key.toUpperCase();
    if (keyPressed == "S") {

        gameState.shopOpen = !gameState.shopOpen;

        if(gameState.shopOpen){
            openShop();
        }else{
            closeShop();
        }
    }
});

requestAnimationFrame(gameLoop);