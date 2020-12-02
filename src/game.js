import entities from './entities'

export const playerTypes = {
    Detective: 'Detective',
    Outlaw: 'Outlaw',
}

const game = {
    init: (playerType, gameEndCallback) => {
        const gridSize = 40;
        const gridMarginSize = 2;
        const canvas = new entities.Canvas('canvas');
        const board = new entities.Board(canvas.width, canvas.height, gridSize, gridMarginSize);
        
        // place player and enemy entities on board
        const detective = new entities.Detective(playerType === playerTypes.Detective, 3);
        const outlaw = new entities.Outlaw(playerType === playerTypes.Outlaw, 2);
        let randomEnemyRow = Math.floor(Math.random() * gridSize / 2);
        const randomEnemyCell = Math.floor(Math.random() * gridSize);
        if (playerType === playerTypes.Detective) {
            randomEnemyRow += gridSize / 2;
            board[randomEnemyRow][randomEnemyCell].setOccupant(outlaw);
            board.setPlayer(detective);
            board.setPlayerLocation(5, 10);
        } else {
            board[randomEnemyRow][randomEnemyCell].setOccupant(detective);
            board.setPlayer(outlaw);
            board.setPlayerLocation(25, 30);
        }

        const data = { 
            canvas, 
            board,
            playerType,
            animationFrame: 0, 
            gameOver: false, 
            gameRunning: true, 
            score: 0, 
            gameEndCallback,
        };

        // Add mouse event listeners
        data.mousemoveListener = e => game.handleMousemove(e, data);
        data.mousedownListener = e => game.handleMousedown(e, data);
        window.addEventListener('mousemove', data.mousemoveListener)
        window.addEventListener('mousedown', data.mousedownListener)

        game.render(data);
    },

    handleMousedown: (e, data) => {
        // console.log(e, data);
        const mouseCoordinates = data.board.getMouseCoordinates(e);

        console.log(mouseCoordinates)
        console.log(data);
        // console.log(e)

        // if square is movable by player, move there
        const rowProximity = Math.abs(data.board.playerLocation.row - mouseCoordinates.row);
        const cellProximity = Math.abs(data.board.playerLocation.cell - mouseCoordinates.cell);
        if (data.board.player && 
            rowProximity <= data.board.player.moveSpeed && 
            cellProximity <= data.board.player.moveSpeed 
        ) {
            data.board.setPlayerLocation(mouseCoordinates.row, mouseCoordinates.cell)
        }
        
        game.render(data);
    },
    
    handleMousemove: (e, data) => {
        const mouseCoordinates = data.board.getMouseCoordinates(e);

        // set previous hovered cell back to gray then calculate current hovered cell
        if (data.hoveredCell) data.hoveredCell.setColor('#777777')
        data.hoveredCell = null;
        if (
            data.board[mouseCoordinates.row] && 
            data.board[mouseCoordinates.row][mouseCoordinates.cell]
        ){
            data.hoveredCell = data.board[mouseCoordinates.row][mouseCoordinates.cell]
        }
        
        // if mouse is over a cell the player can move to, highlight it
        const rowProximity = Math.abs(data.board.playerLocation.row - mouseCoordinates.row);
        const cellProximity = Math.abs(data.board.playerLocation.cell - mouseCoordinates.cell);
        if (data.hoveredCell && 
            data.board.player && 
            rowProximity <= data.board.player.moveSpeed && 
            cellProximity <= data.board.player.moveSpeed 
        ) {
            data.hoveredCell.setColor('#778888')
        }

        game.render(data);
    },

    update: data => {
        // TODO: update outlaw & player positions based on user input
        // TODO: edges of canvas are boundaries       
    },

    render: data => {
        let { canvas, board } = data;

        canvas.clear();

        // draw board
        board.forEach(row => {
            row.forEach(cell => {
                canvas.drawCell(cell)
            })
        })
    },
    
    gameOver: data => {
        let { canvas } = data;

        game.render(data);

        canvas.drawText(200, 300, 'Game Over', 42)

        if (data.gameOverMessage) {
            document.getElementById('messageDiv').innerText = data.gameOverMessage;
        }
        
        document.querySelectorAll('.btn').forEach( btn => btn.style.visibility = 'visible');

        // remove game keydown event listener
        window.removeEventListener('keydown', data.keydownListener);
        window.removeEventListener('mousedown', data.mousedownListener)

        // call game over callback
        data.gameEndCallback();
    },
}

export default game;