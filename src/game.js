import entities from './entities'

export const playerTypes = {
    Detective: 'Detective',
    Outlaw: 'Outlaw',
}

/*
    Some basic mechanics are in place, but still quite a bit to do if I ever get the drive to do it. 
        - TODO: highlight quadrant each player is in, then hide the enemy from the player's screen
        - TODO: enemy outlaw should be smarter and enemy detective shouldn't know player's location. Should move instead based on the quadrant the outlaw is in
        - TODO: add an APB feature where the detective gets 3 or so APBs that tell them the exact location of the outlaw. Optionally we could inform the outlaw when an APB is used
        - TODO: eventually I could move the logic to a server and have this be a 2 person game hosted somewhere. That would require a lobby and stuff though, so idk if that's worth it unless I want to do it as a learning exercise :D
        - TODO: could make the grid size and difficulty selectable by the player before the game starts
        - TODO: before the game starts the player(s) could spend some points each round to upgrade their character (faster move speed, more APBs, etc)
*/

const game = {
    init: (playerType, gameEndCallback) => {
        const gridSize = 20;
        const gridMarginSize = 6;
        const canvas = new entities.Canvas('canvas');
        const board = new entities.Board(canvas.width, canvas.height, gridSize, gridMarginSize);
        
        // place player and enemy entities on board
        const detective = new entities.Detective(playerType === playerTypes.Detective, 2);
        const outlaw = new entities.Outlaw(playerType === playerTypes.Outlaw, 2);
        let randomEnemyRow = Math.floor(Math.random() * gridSize / 2);
        const randomEnemyCell = Math.floor(Math.random() * gridSize);
        if (playerType === playerTypes.Detective) {
            board.setPlayer(detective);
            board.setPlayerLocation(
                Math.floor(gridSize / 5), 
                Math.floor(gridSize / 2)
            );
            board.setEnemy(outlaw);
            randomEnemyRow += gridSize / 2;
            board.setEnemyLocation(randomEnemyRow, randomEnemyCell);
            board.detective = board.player;
            board.outlaw = board.enemy;
        } else {
            board.setPlayer(outlaw);
            board.setPlayerLocation(
                Math.floor(gridSize * 0.75), 
                Math.floor(gridSize * 0.85)
            );
            board.setEnemy(detective);
            board.setEnemyLocation(randomEnemyRow, randomEnemyCell);
            board.detective = board.enemy;
            board.outlaw = board.player;
        }

        const data = { 
            canvas, 
            board,
            playerType,
            animationFrame: 0, 
            gameOver: false, 
            gameRunning: true, 
            round: 1, 
            gameEndCallback,
        };

        // Add mouse event listeners
        data.mousemoveListener = e => game.handleMousemove(e, data);
        data.mousedownListener = e => game.handleMousedown(e, data);
        window.addEventListener('mousemove', data.mousemoveListener)
        window.addEventListener('mousedown', data.mousedownListener)

        game.render(data);
    },

    endOfRound: (data) => {
        data.round++;
        if (data.round > 10){
            if (data.playerType === playerTypes.Detective) 
                return game.gameOver(data, 'Player detective loses :(')
            else return game.gameOver(data, 'Player Outlaw wins!')
        }

        // check if detective is within one square of outlaw
        const playerRowProximity = Math.abs(data.board.player.location.row - data.board.enemy.location.row);
        const playerCellProximity = Math.abs(data.board.player.location.cell - data.board.enemy.location.cell);
        if (playerRowProximity <= 1 && playerCellProximity <= 1) {
            if (data.playerType === playerTypes.Detective) 
                return game.gameOver(data, 'Player Detective wins!')
            else return game.gameOver(data, 'Player Outlaw loses :(')
        }

        // check if detective is on outlaw's last vacated square
        if (data.board.detective.location.row === data.board.outlaw.lastLocation.row
            && data.board.detective.location.cell === data.board.outlaw.lastLocation.cell    
        ){
            if (data.playerType === playerTypes.Detective) 
                return game.gameOver(data, "Player Detective wins!")
            else return game.gameOver(data, 'Player Outlaw loses :(')
        }
    },

    // logic for enemy Outlaw movement
    moveEnemyOutlaw: (data) => {
        const board = data.board;
        const enemy = board.enemy;

        // move randomly but stay within the board boundaries
        const rowMovement = Math.floor(Math.random() * enemy.moveSpeed * 2) - enemy.moveSpeed
        const cellMovement = Math.floor(Math.random() * enemy.moveSpeed * 2) - enemy.moveSpeed
        let newRow = enemy.location.row + rowMovement;
        let newCell = enemy.location.cell + cellMovement;
        if (newRow < 0) newRow = 0
        if (newRow > board.length - 1) newRow = board.length - 1;
        if (newCell < 0) newCell = 0;
        if (newCell > board[0].length - 1) newCell = board[0].length - 1;
        board.setEnemyLocation(newRow, newCell)
    },

    // logic for enemy Detective movement
    moveEnemyDetective: (data) => {
        const board = data.board;
        const { enemy, player } = board;
        let newRow = enemy.location.row;
        let newCell = enemy.location.cell;

        // move towards outlaws last location 
        if (player.lastLocation.row < enemy.location.row) {
            newRow -= enemy.moveSpeed;
            if (newRow < player.lastLocation.row) newRow = player.lastLocation.row;
        }
        if (player.lastLocation.row > enemy.location.row) {
            newRow += enemy.moveSpeed;
            if (newRow > player.lastLocation.row) newRow = player.lastLocation.row;
        }
        if (player.lastLocation.cell < enemy.location.cell) {
            newCell -= enemy.moveSpeed;
            if (newCell < player.lastLocation.cell) newCell = player.lastLocation.cell;
        }
        if (player.lastLocation.cell > enemy.location.cell) {
            newCell += enemy.moveSpeed;
            if (newCell > player.lastLocation.cell) newCell = player.lastLocation.cell;
        }

        board.setEnemyLocation(newRow, newCell)
    },

    handleMousedown: (e, data) => {
        const mouseCoordinates = data.board.getMouseCoordinates(e);

        if (window.debug){
            console.log(mouseCoordinates)
            console.log(data);
        }

        // if square can be moved to by player, move there
        const rowProximity = Math.abs(data.board.player.location.row - mouseCoordinates.row);
        const cellProximity = Math.abs(data.board.player.location.cell - mouseCoordinates.cell);
        if (data.board.player && 
            rowProximity <= data.board.player.moveSpeed && 
            cellProximity <= data.board.player.moveSpeed 
        ) {        
            if (data.playerType === playerTypes.Detective) {
                game.moveEnemyOutlaw(data);
                data.board.setPlayerLocation(mouseCoordinates.row, mouseCoordinates.cell)
            } else {
                data.board.setPlayerLocation(mouseCoordinates.row, mouseCoordinates.cell)
                game.moveEnemyDetective(data);
            }
            
            // handle game business logic to see if the game is over
            game.endOfRound(data);
        }
        
        game.render(data);
    },
    
    handleMousemove: (e, data) => {
        const mouseCoordinates = data.board.getMouseCoordinates(e);

        // set previous hovered cell back to gray then calculate current hovered cell
        if (data.hoveredCell) data.hoveredCell.setColor(data.hoveredCell.defaultColor)
        data.hoveredCell = null;
        if (
            data.board[mouseCoordinates.row] && 
            data.board[mouseCoordinates.row][mouseCoordinates.cell]
        ){
            data.hoveredCell = data.board[mouseCoordinates.row][mouseCoordinates.cell]
        }
        
        // if mouse is over a cell the player can move to, highlight it
        const rowProximity = Math.abs(data.board.player.location.row - mouseCoordinates.row);
        const cellProximity = Math.abs(data.board.player.location.cell - mouseCoordinates.cell);
        if (data.hoveredCell && 
            data.board.player && 
            rowProximity <= data.board.player.moveSpeed && 
            cellProximity <= data.board.player.moveSpeed 
        ) {
            data.hoveredCell.setColor('#778888')
        }

        game.render(data);
    },

    render: data => {
        let { canvas, board } = data;

        canvas.clear();

        // draw cells
        board.forEach(row => {
            row.forEach(cell => {
                canvas.drawCell(cell)
            })
        })

        // draw outline for quadrants
        canvas.drawRect(
            (board.width / 2) - (board.gridMarginSize / 2), 
            0, 
            board.gridMarginSize, 
            board.height, 
            '#200'
        )
        canvas.drawRect(
            0, 
            (board.height / 2) - (board.gridMarginSize / 2), 
            board.width, 
            board.gridMarginSize, 
            '#200'
        )

        // draw any game message text
        if (data.message) canvas.drawText(200, 300, data.message, 42)
    },
    
    gameOver: (data, gameOverMessage = 'Game Over') => {
        data.message = gameOverMessage;

        // remove game event listeners
        window.removeEventListener('mousemove', data.mousemoveListener);
        window.removeEventListener('mousedown', data.mousedownListener)

        // call game over callback
        data.gameEndCallback();
    },
}

export default game;