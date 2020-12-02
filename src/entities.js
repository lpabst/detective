const entities = {
    Canvas: function(htmlId) {
        this.htmlCanvas = document.getElementById(htmlId);
        this.context = this.htmlCanvas.getContext('2d');
        this.width = this.htmlCanvas.width;
        this.height = this.htmlCanvas.height;
    
        this.clear = () => {
            this.drawRect(0, 0, this.width, this.height, 'black')
        }
    
        this.drawRect = (x, y, w, h, color) => {
            this.context.fillStyle = color;
            this.context.fillRect(x, y, w, h);
        }
    
        this.drawCell = (cell) => {
            this.context.fillStyle = cell.color;
            if (cell.occupant && cell.occupant.isPlayer) {
                this.context.fillStyle = cell.occupant.color;
            }

            this.context.fillRect(cell.x, cell.y, cell.w, cell.h);
        }
    
        this.drawText = (x,  y, text, fontSize = 14, color = 'white') => {
            this.context.fillStyle = color;
            this.context.font = `${fontSize}px Arial`;
            this.context.fillText(text, x, y);
        }
    },
    Outlaw: function(isPlayer, moveSpeed) {
        this.type = 'Outlaw';
        this.color = 'black';
        this.isPlayer = isPlayer;
        this.moveSpeed = moveSpeed;
    },
    Detective: function(isPlayer, moveSpeed) {
        this.type = 'Detective';
        this.color = 'blue';
        this.isPlayer = isPlayer;
        this.moveSpeed = moveSpeed;
    },
    Cell: function(x, y, w, h, occupant = null) {
        this.type = 'Cell';
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = '#777777';
        this.occupant = occupant;

        this.setOccupant = (occupant) => this.occupant = occupant;
        this.setColor = color => this.color = color;
    },
    Board: function(width, height, gridSize, gridMarginSize) {
        const board = [];
        board.type = 'Board';
        board.width = width;
        board.height = height;
        board.gridSize = gridSize;
        board.gridMarginSize = gridMarginSize;
        board.player = null;
        board.playerLocation = null;
        
        const cellWidthWithMargin = width / gridSize;
        const cellHeightWithMargin = height / gridSize;

        for (let i = 0; i < gridSize; i++){
            board[i] = [];
            for (let j = 0; j < gridSize; j++){
                board[i][j] = new entities.Cell(
                    cellWidthWithMargin * j + 1,
                    cellWidthWithMargin * i + 1,
                    cellWidthWithMargin - gridMarginSize,
                    cellHeightWithMargin - gridMarginSize
                )
            }
        }

        board.setPlayer = playerEntity => board.player = playerEntity;

        board.setPlayerLocation = (row, cell) => {
            // remove player from current location
            if (board.playerLocation) {
                board[board.playerLocation.row][board.playerLocation.cell].setOccupant(null)
            }

            board[row][cell].setOccupant(board.player);
            board.playerLocation = { row, cell }
        }

        board.getMouseCoordinates = (mouseEvent) => {
            const x = mouseEvent.offsetX;
            const y = mouseEvent.offsetY;
            const row = Math.floor(y / cellHeightWithMargin);
            const cell = Math.floor(x / cellWidthWithMargin);
            return { x, y, row, cell };
        }

        return board;
    }
}

export default entities;