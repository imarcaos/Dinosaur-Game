/*
    App Dinosaur Game
    By iMarcaos 
    Project Started: 05/03/2021
    Version: 0.3-03.21
*/

// 3ª Construção

// Canvas
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.style.height = "";
canvas.style.width = "";
canvas.setAttribute('width', 600);
canvas.setAttribute('height', 350);  
/**/

// Variables
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};
let type;

let img;
let dImg; // dinossauro
let cImg; // cactus
let bImg; // background

// Preload  Images
function myPreload() {
    dImg =  myLoadImage('img/dino.png');
    fImg =  myLoadImage('img/dino-fly.png');
    cImg =  myLoadImage('img/cactus.png');
    bImg =  myLoadImage('img/background.png');
}

function myLoadImage(url) {
    var img = new Image();
    img.src = url;
    return img;
}
/**/

// Event Listeners
document.addEventListener('keydown', function (evt) {
    keys[evt.code] = true;
});
document.addEventListener('keyup', function (evt) {
    keys[evt.code] = false;
});

class Player {
    constructor (x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = "#FF5858";

        this.dy = 0;
        this.jumpForce = 15;
        this.originalHeight = h;
        this.grounded = false;
        this.jumpTimer = 0;
    }

    animate(img) {
        // Jump
        if (keys['Space'] || keys['KeyW']) {
            this.jump();
            console.log('jump');
        } else {
            this.jumpTimer = 0;
        }
    
        if (keys['ShiftLeft'] || keys['KeyS']) {
            this.h = this.originalHeight / 2;
        } else {
            this.h = this.originalHeight;
        }
    
        this.y += this.dy;
    
        // Gravity
        if (this.y + this.h < canvas.height) {
            this.dy += gravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - this.h;
        }
            
        // this.draw(); // geometric form
        this.image(img);
    }

    jump(){
        if (this.grounded && this.jumpTimer == 0) {
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
          } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
          }
    }

    draw () {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath();
    }

    image(img) {
        ctx.beginPath();
        ctx.drawImage(img, this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}

class Obstacle {
    constructor (x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = "#2484E4";
    
        this.dx = -gameSpeed;
    }

    update (img) {
        this.x += this.dx;
        //this.draw();
        this.image(img); // test with image 15/03/2021
        this.dx = -gameSpeed;
    }
    
    draw () {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath();
    }

    image(img) {
        ctx.beginPath();
        ctx.drawImage(img, this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}

class Text {
    constructor (t, x, y, a, c, s) {
        this.t = t; // text
        this.x = x; // position x
        this.y = y; // position y
        this.a = a; // alignment
        this.c = c; // color
        this.s = s; // size
    }
  
    draw () {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font = this.s + "px sans-serif";
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y);
        ctx.closePath();
    }
}

// Game Functions
function spawnObstacle () {
    let size = randomIntInRange(20, 70); // size of obstacle
    type = randomIntInRange(0, 1); // 0- large obstacle and 1- fly obstacle
    let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size);
    //console.log(size);
  
    if (type == 1) {
      obstacle.y -= player.originalHeight - 10; // fly obstacle height      
    }
    obstacles.push(obstacle); // push the obtacles to the array    
}
//spawnObstacle();


function randomIntInRange (min, max) {
    return Math.round(Math.random() * (max - min) + min);
}


function start () {

    ctx.font = "20px sans-serif";

    gameSpeed = 3;
    gravity = 1;

    score = 0;
    highscore = 0;
    if (localStorage.getItem('highscore')) {
        highscore = localStorage.getItem('highscore');
    }

    player = new Player(25, canvas.height - 50, 50, 50);

    scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
    highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");
    
    requestAnimationFrame(update);

    // carrego as imagens do jogo
    myPreload();
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

function update() {
    requestAnimationFrame(update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer--;
    if (spawnTimer <= 0) {
        spawnObstacle();
        //console.log(obstacles);
        spawnTimer = initialSpawnTimer - gameSpeed * 8;
        
        if (spawnTimer < 60) {
          spawnTimer = 60;
        }
    }

    // Spawn Enemies
    for (let i = 0; i < obstacles.length; i++) {
        let o = obstacles[i];
        
        if (o.x + o.w < 0) {
            obstacles.splice(i, 1);
        }

        // if the player touch the obstacles, they will be restarted
        if (
            player.x < o.x + o.w &&
            player.x + player.w > o.x &&
            player.y < o.y + o.h &&
            player.y + player.h > o.y
        ) {
            obstacles = [];
            score = 0;
            spawnTimer = initialSpawnTimer;
            gameSpeed = 3;
            window.localStorage.setItem('highscore', highscore);
        }
        if (type == 1) {
            o.update(fImg); // callback function update on the class Obstacle
        } else {
            o.update(cImg);
        }
  }

    player.animate(dImg);

    score++;
    scoreText.t = "Score: " + score;
    scoreText.draw();

    if (score > highscore) {
        highscore = score;
        highscoreText.t = "Highscore: " + highscore;
      }
      
      highscoreText.draw();

      gameSpeed += 0.003;
}

start();


