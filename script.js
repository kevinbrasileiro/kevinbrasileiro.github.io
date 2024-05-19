(function ()  {

const gameStorage = window.localStorage

const canvas = document.getElementById("tetris")
const context = canvas.getContext('2d')

const scoreElement = document.getElementById("score")
const levelElement = document.getElementById("level")
const nextPieceElement = document.getElementById("next-piece")
const holdingPieceElement = document.getElementById("holding-piece")

const SQ = 40
const ROWS = 20
const COLUMNS = 10;
const EMPTY = '#111'

let GAME_SPEED = 0
let GAME_LEVEL = 0
let linesClearedInLevel = 0
let GAME_SCORE = 0
let highscore = Number(gameStorage.getItem("highscore"))

let GAME_OVER = false

const I = [
	[
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0],
	],
	[
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
	],
];

const J = [
	[
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0]
	],
	[
		[0, 1, 1],
		[0, 1, 0],
		[0, 1, 0]
	],
	[
		[0, 0, 0],
		[1, 1, 1],
		[0, 0, 1]
	],
	[
		[0, 1, 0],
		[0, 1, 0],
		[1, 1, 0]
	]
];

const L = [
	[
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0]
	],
	[
		[0, 1, 0],
		[0, 1, 0],
		[0, 1, 1]
	],
	[
		[0, 0, 0],
		[1, 1, 1],
		[1, 0, 0]
	],
	[
		[1, 1, 0],
		[0, 1, 0],
		[0, 1, 0]
	]
];

const O = [
	[
		[0, 0, 0, 0],
		[0, 1, 1, 0],
		[0, 1, 1, 0],
		[0, 0, 0, 0],
	]
];

const S = [
	[
		[0, 0, 0],
		[0, 1, 1],
		[1, 1, 0]
	],
	[
		[1, 0, 0],
		[1, 1, 0],
		[0, 1, 0]
	]
];

const T = [
	[
		[0, 1, 0],
		[1, 1, 1],
		[0, 0, 0]
	],
	[
		[0, 1, 0],
		[0, 1, 1],
		[0, 1, 0]
	],
	[
		[0, 0, 0],
		[1, 1, 1],
		[0, 1, 0]
	],
	[
		[0, 1, 0],
		[1, 1, 0],
		[0, 1, 0]
	]
];

const Z = [
	[
		[0, 0, 0],
		[1, 1, 0],
		[0, 1, 1]
	],
	[
		[0, 1, 0],
		[1, 1, 0],
		[1, 0, 0]
	]
];

function drawSquare(x, y, color) {
    context.fillStyle = color
    context.fillRect(x*SQ, y*SQ, SQ, SQ)
    context.strokeStyle = '#000'
    context.strokeRect(x*SQ, y*SQ, SQ, SQ)
}

let board = []

for(let r = 0; r < ROWS; r++) {
    board[r] = []
    for(let c = 0; c < COLUMNS; c++) {
        board[r][c] = EMPTY
    }
}

function drawBoard() {
    for(let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLUMNS; c++) {
            drawSquare(c, r, board[r][c])
        }
    }
}

drawBoard()

const PIECES = [
    [Z, "#ff0000", "Z"],
    [S, "#00ff00", "S"],
    [T, "#ff00ee", "T"],
    [O, "#ffff00", "O"],
    [I, "#00ffff", "I"],
    [L, "#ff7f00", "L"],
    [J, "#0000ff", "J"],
]

function randomizePiecesColors() {
    const letters = "23456789ABCDEF"

    for (let i = 0; i < PIECES.length; i++) {
        let newColor = ['#']
        for (let j = 0; j < 6; j++) {
            newColor.push(letters[Math.floor(Math.random() * letters.length)])
        }
        const colorInHex = newColor.join('')

        PIECES[i][1] = colorInHex
    }
}

class Piece {
    constructor(tetromino, color) {
        this.tetromino = tetromino
        this.color = color
        this.tetrominoRotation = 0
        this.activeTetromino = this.tetromino[this.tetrominoRotation]

        this.x = 3
        this.y = -2
    }

    fill(color) {
        for(let r = 0; r < this.activeTetromino.length; r++) {
            for(let c = 0; c < this.activeTetromino.length; c++) {
                if(this.activeTetromino[r][c]) {
                    drawSquare(this.x + c, this.y + r, color)
                }
            }
        }
    }

    draw() {
        this.fill(this.color)
    }

    unDraw() {
        this.fill(EMPTY)
    }

    checkCollision(futureX, futureY, piece) {
        for(let r = 0; r < piece.length; r++) {
            for(let c = 0; c < piece.length; c++) {

                if (!piece[r][c]) {
                    continue;
                }

                let newX = this.x + c + futureX
                let newY = this.y + r + futureY


                if (newX < 0 || newX >= COLUMNS || newY >= ROWS) {
                    return true
                }


                if (newY < 0) {
                    continue
                }

                if (board[newY][newX] !== EMPTY) {
                    return true
                }

            }
        }
        return false
    }

    lock() {
        for(let r = 0; r < this.activeTetromino.length; r++) {
            for(let c = 0; c < this.activeTetromino.length; c++) {

                if (!this.activeTetromino[r][c] ) {
                    continue
                }

                if (this.y + r < 0) {
                    if (GAME_SCORE > highscore) {
                        gameStorage.setItem("highscore", GAME_SCORE.toString())
                        highscore = Number(gameStorage.getItem("highscore"))
                    }
                    if (!GAME_OVER) {alert(`You got ${GAME_SCORE} points \nYour highscore is ${highscore} points`)}
                    GAME_OVER = true
                }

                board[this.y+r][this.x+c] = this.color
            }
        }

        // Clear Rows
        let consectutiveRows = 0;
        for(let r = 0; r < ROWS; r++) {
            let isRowFull = true
            for(let c = 0; c < COLUMNS; c++) {
                  isRowFull = isRowFull && board[r][c] !== EMPTY
            }

            if (isRowFull) {
                for(let y = r; y > 1; y--) {
                    for(let c = 0; c < COLUMNS; c++) {
                        board[y][c] = board[y-1][c]
                    }
                }

                for(let c = 0; c < COLUMNS; c++) {
                    board[0][c] = EMPTY
                }

                consectutiveRows++
                linesClearedInLevel++
            }
        }
        if (consectutiveRows === 1) {GAME_SCORE += 40 * (GAME_LEVEL + 1)}
        if (consectutiveRows === 2) {GAME_SCORE += 100 * (GAME_LEVEL + 1)}
        if (consectutiveRows === 3) {GAME_SCORE += 300 * (GAME_LEVEL + 1)}
        if (consectutiveRows === 4) {GAME_SCORE += 1200 * (GAME_LEVEL + 1)}

        if (linesClearedInLevel >= 10) {
            GAME_LEVEL++
            GAME_SPEED += 30
            linesClearedInLevel -= 10
            
            if (GAME_LEVEL >= 20) {
                randomizePiecesColors()
            }
        }

        scoreElement.textContent = GAME_SCORE
        levelElement.textContent = GAME_LEVEL
        drawBoard()

        hasHolded = false
    }

    moveDown() {
        if (!this.checkCollision(0, 1, this.activeTetromino)) {
            this.unDraw()
            this.y++
            this.draw()
        } else {
            this.lock()
            updatePieceSequence()
        }
    }

    drop() {
        while (!this.checkCollision(0, 1, this.activeTetromino)) {
            this.unDraw()
            this.y++
            this.draw()
            GAME_SCORE += 2
        }
        this.lock()
        updatePieceSequence()
    }

    rotate() {
        let nextPattern = this.tetromino[(this.tetrominoRotation + 1) % this.tetromino.length]
        let kick = 0

        if (this.checkCollision(0,0, nextPattern)) {
            if (this.x > COLUMNS/2) {
                kick = -1
            } else {
                kick = 1
            }
        }

        if (!this.checkCollision(kick, 0, nextPattern)) {
            this.unDraw()
            this.x += kick
            this.tetrominoRotation = (this.tetrominoRotation + 1) % this.tetromino.length
            this.activeTetromino = this.tetromino[this.tetrominoRotation]
            this.draw()
        }
    }

    moveLeft() {
        if (!this.checkCollision(-1, 0, this.activeTetromino)) {
            this.unDraw()
            this.x--
            this.draw()
        }
    }

    moveRight() {
        if (!this.checkCollision(1, 0, this.activeTetromino)) {
            this.unDraw()
            this.x++
            this.draw()
        }
    }

    hold() {
        if (!holdingPiece && !hasHolded) {
            hasHolded = true
            holdingPiece = pieceSequence[0]
            this.unDraw()
            updatePieceSequence()
        } else if (!hasHolded) {
            let betweenPiece = holdingPiece

            holdingPiece = pieceSequence[0]
            
            pieceSequence.shift()

            pieceSequence.unshift(betweenPiece)
            pieceSequence.unshift(betweenPiece)

            hasHolded = true
            this.unDraw()

            updatePieceSequence()
        }
    }
}


let activePiece
let holdingPiece
let hasHolded = false

let pieceSequence = []
updatePieceSequence()


function updatePieceSequence() {
    pieceSequence.shift()
    
    if (pieceSequence.length <= 1) {
        pieceSequence.push(...generateRandomPieceSequence())
    } 
    activePiece = new Piece(pieceSequence[0][0], pieceSequence[0][1])
    
    nextPieceElement.innerText = pieceSequence[1][2]
    nextPieceElement.style.color = pieceSequence[1][1]
    
    if (holdingPiece) {
        holdingPieceElement.innerText = holdingPiece[2]
        holdingPieceElement.style.color = holdingPiece[1]
    }
}

function generateRandomPieceSequence() {
    return PIECES.sort(() => Math.random() - 0.5)
}

const fallingPieces = () => {
    let delay = GAME_SPEED < 900 ? 920 - GAME_SPEED : 20
    activePiece.moveDown()
    setTimeout(fallingPieces, delay)
}

setTimeout(fallingPieces, 920)

document.addEventListener("keydown", control)

function control(event) {
        if (GAME_OVER) {
            return
        }

        if (event.keyCode === 37) {
            activePiece.moveLeft()
        } 

        if (event.keyCode === 65) {
            activePiece.moveLeft()
        } 

        if (event.keyCode === 39) {
            activePiece.moveRight()
        }  
        
        if (event.keyCode === 68) {
            activePiece.moveRight()
        }     

        if (event.keyCode === 87 || event.keyCode === 38) {
            activePiece.rotate()
        } 
        
        if (event.keyCode === 83 || event.keyCode === 40 ) {
            activePiece.moveDown()
            GAME_SCORE += 1
        }

        if (event.keyCode === 32) {
            activePiece.drop()
        }

        if (event.keyCode === 16 || event.keyCode === 67) {
            activePiece.hold()
        }

        if (event.keyCode === 75) {
                skipLevel()
            }
        }
    
function skipLevel() {
    GAME_SPEED += 30
    GAME_SCORE += (40 * 10 * (GAME_LEVEL + 1))
    GAME_LEVEL++

    if (GAME_LEVEL >= 20) {
        randomizePiecesColors()
    }

    levelElement.textContent = GAME_LEVEL
    scoreElement.textContent = GAME_SCORE
}

})()