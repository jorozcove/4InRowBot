class Agent{
    constructor(){}
    
    init(color, board, time=20000){
        this.color = color
        this.time = time
        this.size = board.length
    }

    // Must return an integer representing the column to put a piece
    //                           column
    //                             | 
    compute( board, time ){ return 0 }
}

/*
 * A class for board operations (it is not the board but a set of operations over it)
 */
class Board{
    constructor(){}

    // Initializes a board of the given size. A board is a matrix of size*size of characters ' ', 'B', or 'W'
    init(size){
        var board = []
        for(var i=0; i<size; i++){
            board[i] = []
            for(var j=0; j<size; j++)
                board[i][j] = ' '
        }
        return board
    }

    // Deep clone of a board the reduce risk of damaging the real board
    clone(board){
        var size = board.length
        var b = []
        for(var i=0; i<size; i++){
            b[i] = []
            for(var j=0; j<size; j++)
                b[i][j] = board[i][j]
        }
        return b
    }

    // Determines if a piece can be set at column j 
    check(board, j){
        return (board[0][j]==' ')
    }

    // Computes all the valid moves for the given 'color'
    valid_moves(board){
        var moves = []
        var size = board.length
        for( var j=0; j<size; j++)
            if(this.check(board, j)) moves.push(j)
        return moves
    }

    // Computes the new board when a piece of 'color' is set at column 'j'
    // If it is an invalid movement stops the game and declares the other 'color' as winner
    move(board, j, color){
        var size = board.length
        var i=size-1;
        while(i>=0 && board[i][j]!=' ') i--;
        if(i<0) return false;
        board[i][j] = color
        return true
    }

    // Determines the winner of the game if available 'W': white, 'B': black, ' ': none
    winner(board, k){
        // console.log(k)
        var size = board.length
        for( var i=0; i<size; i++){
            for(var j=0; j<size; j++){
                var p = board[i][j]
                if(p!=' '){
                    if(j+k<=size && i+k<=size){                        
                        var c = 1
                        for(var h=1;h<k; h++)
                            if(board[i+h][j+h]==p) c++
                        if(c==k) return p
                    }
                    if(j+1>=k && i+k<=size){                        
                        var c = 1
                        for(var h=1;h<k; h++)
                            if(board[i+h][j-h]==p) c++
                        if(c==k) return p

                    }
                    if(j+k<=size){                        
                        var c = 1
                        for(var h=1;h<k; h++)
                            if(board[i][j+h]==p) c++
                        if(c==k) return p

                    }
                    if(i+k<=size){
                        var c = 1
                        for(var h=1;h<k; h++)
                            if(board[i+h][j]==p) c++
                            else break;
                        if(c==k) return p
                    }
                }
            }
        }      
        return ' '
    }

    // Draw the board on the canvas
    print(board){
        var size = board.length
        // Commands to be run (left as string to show them into the editor)
        var grid = []
        for(var i=0; i<size; i++){
            for(var j=0; j<size; j++)
                grid.push({"command":"translate", "y":i, "x":j, "commands":[{"command":"-"}, {"command":board[i][j]}]})
        }

	    var commands = {"r":true,"x":1.0/size,"y":1.0/size,"command":"fit", "commands":grid}
        Konekti.client['canvas'].setText(commands)
    }
}

function slow_down(times){
    for(var i=0; i<50000000*times; i++){}
}

/*
 * Player's Code (Must inherit from Agent) 
 * This is an example of a random player agent
 */

PREMOVES = []

class RandomPlayer extends Agent{
    constructor(){ 
        super() 
        this.board = new Board()
    }

    compute(board, time){
        // console.log(board)

        if(PREMOVES.length <= 0){

            var moves = this.board.valid_moves(board)
            var index = Math.floor(moves.length * Math.random())
            // slow_down(40)
        

            // console.log(this.color + ',' + moves[index])
            return moves[index]
        }

        let move = PREMOVES.pop()
        // slow_down(40)

        return move

    }
}


class SoriakPlayer extends Agent {
    constructor() {
        super();
        this.board = new Board();
        this.maxDepth = 6;
        this.transposition_table = {};
    }

    save_transposition(board, maximizingPlayer, score, col) {
        this.transposition_table[[board, col, maximizingPlayer]] = score;
    }

    check_transposition(board, col, maximizingPlayer) {
        return this.transposition_table[[board, col, maximizingPlayer]];
    }

    first_move(board) {
        //check last row
        for (let col of board[board.length - 1]) {
            if (col !== ' ') {
                return false;
            }
        }
        return true;
    }

    compute(board, time) {

        this.board_k = Konekti.vc('k').value

        if(this.board.length >= 11){
            this.maxDepth = 2
        }

        else if(this.board.length >= 9){
            this.maxDepth = 4
        }

        else if(this.board.length > 7){
            this.maxDepth = 5
        }

        else{
            this.maxDepth = 6
        }

        // make first move in the center
        if (this.first_move(board)) {
            return Math.floor(board[0].length / 2);
        }
        
        let value = this.minimax(board, 0, -Infinity, Infinity, true)[0];

        return value;
    }

    isTerminalMode(board) {
        return this.board.winner(board, this.board_k) !== ' ' || this.board.valid_moves(board).length <= 0;
    }

    minimax(board, depth, alpha, beta, maximizingPlayer) {
        const valid_moves = this.board.valid_moves(board)
        const is_terminal = this.isTerminalMode(board)

        let best_move = Math.floor(valid_moves.length * Math.random());
        let score;

        if (depth >= this.maxDepth || is_terminal) {
            if (is_terminal) {
                if (this.board.winner(board, this.board_k) === this.color) {
                    // console.log('winner move', this.color)
                    return [null, 1000000];
                } else if (this.board.winner(board, this.board_k) === this.opponent_color()) {
                    // console.log('losing move', this.color)
                    return [null, -1000000];
                } else {
                    // console.log('tie move', this.color)
                    return [null, 0];
                }
            }
            return [null, this.score_position(board, this.color)];
        }

        let scores = []

        if (maximizingPlayer) {
            let best_score = -Infinity;
            for(let col of valid_moves){

                let temp_board = this.board.clone(board)
                this.board.move(temp_board, col, this.color)

                score = this.check_transposition(temp_board,col,  maximizingPlayer)

                if(!score){
                    score = this.minimax(temp_board, depth + 1, alpha, beta, false)[1]
                    this.save_transposition(temp_board, maximizingPlayer, score, col)
                }

                if (score > best_score) {
                    best_score = score;
                    best_move = col;
                }

                alpha = Math.max(alpha, best_score);
                if (alpha >= beta) {
                    break;
                }
            }
            return [best_move, best_score];

        }

        let best_score = Infinity;
        for(let col of valid_moves){

            let temp_board = this.board.clone(board)
            this.board.move(temp_board, col, this.opponent_color())

            score = this.check_transposition(temp_board, col, maximizingPlayer)

            if(!score){
                score = this.minimax(temp_board, depth + 1, alpha, beta, true)[1]
                this.save_transposition(temp_board, maximizingPlayer, score, col)
            }

            if (score < best_score) {
                best_score = score;
                best_move = col;
            }
            beta = Math.min(beta, best_score);
            if (alpha >= beta) {
                break;
            }
        }

        return [best_move, best_score];

    }

    score_window(window, color) {
        let score = 0;

        let holes = window.split(' ').length - 1
        let consecutive = window.split(this.color).length - 1
        let consecutive_opponent = window.split(this.opponent_color()).length - 1

        // k in a row
        if (consecutive === this.board_k) {
            score += Infinity;
        }

        // k-1 in a row
        else if (consecutive === this.board_k - 1 && holes == 1) {
            score += 30;
        }

        // k-2 in a row
        else if (consecutive === this.board_k - 2 && (holes == 1 || holes == 2)) {
            score += 10;
        }

        // opponent k in a row
        if (consecutive_opponent === this.board_k) {
            score -= Infinity;
        }

        // opponent k-1 in a row
        else if (consecutive_opponent === this.board_k - 1 && holes == 1) {
            score -= 100;
        }

        // opponent k-2 in a row
        else if (consecutive_opponent === this.board_k - 2 && (holes == 1 || holes == 2)) {
            score -= 5;
        }

        return score;
    }

    score_position(board, color) {
        let score = 0;

        // Score Center Column
        let center_array = [];
        for (let row of board) {
            center_array.push(row[Math.floor(board[0].length / 2)]);
        }
        let center_count = center_array.join('').split(color).length - 1;
        score += center_count * 6;
        
        // Score Horizontal
        for (let row of board) {
            for (let c = 0; c < board[0].length - (this.board_k-1); c++) {
                let rowArray = [];
                for (let i = 0; i < this.board_k; i++) {
                    rowArray.push(row[c + i]);
                }
    
                let window = rowArray.join('');
                score += this.score_window(window, color);

            }
        }

        // Score Vertical
        for (let c = 0; c < board[0].length; c++) {
            for (let r = 0; r < board.length - (this.board_k-1); r++) {
                let colArray = [];
                for (let i = 0; i < this.board_k; i++) {
                    colArray.push(board[r + i][c]);
                }
    
                let window = colArray.join('');
                score += this.score_window(window, color);
            }
        }

        // Score Diagonals
        for (let r = 0; r < board.length - (this.board_k-1); r++) {
            for (let c = 0; c < board[0].length - (this.board_k-1); c++) {
                let diagArray = [];
                for (let i = 0; i < this.board_k; i++) {
                    diagArray.push(board[r + i][c + i]);
                }
    
                let window = diagArray.join('');
                score += this.score_window(window, color);
            }
        }

        for (let r = 0; r < board.length - (this.board_k-1); r++) {
            for (let c = 0; c < board[0].length - (this.board_k-1); c++) {
                let diagArray = [];
                for (let i = 0; i < this.board_k; i++) {
                    diagArray.push(board[r + (this.board_k-1) - i][c + i]);
                }
    
                let window = diagArray.join('');
                score += this.score_window(window, color);
            }
        }
    
        return score;
    }

    opponent_color() {
        return this.color === 'W' ? 'B' : 'W';
    }

}

class CaosPlayer extends Agent {

    constructor() {
        super()
        this.board = new Board()
    }

    choiceRandom(arr) {
        return arr[(Math.floor(Math.random() * arr.length))];
    }

    winningMove(board, piece, k) {
        // Check horizontal locations for win
        if (k === 4) {
            for (let c = 0; c < board.length - 3; c++) {
                for (let r = 0; r < board.length; r++) {
                    if (
                        board[r][c] == piece &&
                        board[r][c + 1] == piece &&
                        board[r][c + 2] == piece &&
                        board[r][c + 3] == piece
                    ) {
                        return true;
                    }
                }
            }

            // Check vertical locations for win
            for (let c = 0; c < board.length; c++) {
                for (let r = 0; r < board.length - 3; r++) {
                    if (
                        board[r][c] == piece &&
                        board[r + 1][c] == piece &&
                        board[r + 2][c] == piece &&
                        board[r + 3][c] == piece
                    ) {
                        return true;
                    }
                }
            }

            // Check positively sloped diagonals
            for (let c = 0; c < board.length - 3; c++) {
                for (let r = 0; r < board.length - 3; r++) {
                    if (
                        board[r][c] == piece &&
                        board[r + 1][c + 1] == piece &&
                        board[r + 2][c + 2] == piece &&
                        board[r + 3][c + 3] == piece
                    ) {
                        return true;
                    }
                }
            }

            // Check negatively sloped diagonals
            for (let c = 0; c < board.length - 3; c++) {
                for (let r = 3; r < board.length; r++) {
                    if (
                        board[r][c] == piece &&
                        board[r - 1][c + 1] == piece &&
                        board[r - 2][c + 2] == piece &&
                        board[r - 3][c + 3] == piece
                    ) {
                        return true;
                    }
                }
            }

            return false;
        }
        
        // 5 in a row
        else if (k === 5) {
            for (let c = 0; c < board.length - 4; c++) {
                for (let r = 0; r < board.length; r++) {
                    if (
                        board[r][c] == piece &&
                        board[r][c + 1] == piece &&
                        board[r][c + 2] == piece &&
                        board[r][c + 3] == piece &&
                        board[r][c + 4] == piece
                    ) {
                        return true;
                    }
                }
            }

            // Check vertical locations for win
            for (let c = 0; c < board.length; c++) {
                for (let r = 0; r < board.length - 4; r++) {
                    if (
                        board[r][c] == piece &&
                        board[r + 1][c] == piece &&
                        board[r + 2][c] == piece &&
                        board[r + 3][c] == piece &&
                        board[r + 4][c] == piece
                    ) {
                        return true;
                    }
                }
            }

            // Check positively sloped diagonals
            for (let c = 0; c < board.length - 4; c++) {
                for (let r = 0; r < board.length - 4; r++) {
                    if (
                        board[r][c] == piece &&
                        board[r + 1][c + 1] == piece &&
                        board[r + 2][c + 2] == piece &&
                        board[r + 3][c + 3] == piece &&
                        board[r + 4][c + 4] == piece
                    ) {
                        return true;
                    }
                }
            }

            // Check negatively sloped diagonals
            for (let c = 0; c < board.length - 4; c++) {
                for (let r = 4; r < board.length; r++) {
                    if (
                        board[r][c] == piece &&
                        board[r - 1][c + 1] == piece &&
                        board[r - 2][c + 2] == piece &&
                        board[r - 3][c + 3] == piece &&
                        board[r - 4][c + 4] == piece
                    ) {
                        return true;
                    }
                }
            }

            return false;
        }

        // 6 in a row
        if (k === 6) {
            for (let c = 0; c < board.length - 5; c++) {
                for (let r = 0; r < board.length; r++) {
                    if (
                        board[r][c] == piece &&
                        board[r][c + 1] == piece &&
                        board[r][c + 2] == piece &&
                        board[r][c + 3] == piece &&
                        board[r][c + 4] == piece &&
                        board[r][c + 5] == piece
                    ) {
                        return true;
                    }
                }
            }

            // Check vertical locations for win
            for (let c = 0; c < board.length; c++) {
                for (let r = 0; r < board.length - 5; r++) {
                    if (
                        board[r][c] == piece &&
                        board[r + 1][c] == piece &&
                        board[r + 2][c] == piece &&
                        board[r + 3][c] == piece &&
                        board[r + 4][c] == piece &&
                        board[r + 5][c] == piece
                    ) {
                        return true;
                    }
                }
            }

            // Check positively sloped diagonals
            for (let c = 0; c < board.length - 5; c++) {
                for (let r = 0; r < board.length - 5; r++) {
                    if (
                        board[r][c] == piece &&
                        board[r + 1][c + 1] == piece &&
                        board[r + 2][c + 2] == piece &&
                        board[r + 3][c + 3] == piece &&
                        board[r + 4][c + 4] == piece &&
                        board[r + 5][c + 5] == piece
                    ) {
                        return true;
                    }
                }
            }

            // Check negatively sloped diagonals
            for (let c = 0; c < board.length - 5; c++) {
                for (let r = 5; r < board.length; r++) {
                    if (
                        board[r][c] == piece &&
                        board[r - 1][c + 1] == piece &&
                        board[r - 2][c + 2] == piece &&
                        board[r - 3][c + 3] == piece &&
                        board[r - 4][c + 4] == piece &&
                        board[r - 5][c + 5] == piece
                    ) {
                        return true;
                    }
                }
            }

            return false;
        }
    }

    evaluateWindow(window, piece, k) {
        let score = 0;
        const oppPiece = 'W' === piece ? 'B' : 'W';
        // 4 in a row
        if (k === 4) {
            if (window.filter(value => value === piece).length === 4) {
                score += 100;
            } else if (
                window.filter(value => value === piece).length === 3 &&
                window.filter(value => value === ' ').length === 1
            ) {
                score += 5;
            } else if (
                window.filter(value => value === piece).length === 2 &&
                window.filter(value => value === ' ').length === 2
            ) {
                score += 2;
            }

            if (
                window.filter(value => value === oppPiece).length === 3 &&
                window.filter(value => value === ' ').length === 1
            ) {
                score -= 4;
            }

            return score;
        }

        // 5 in a row
        else if (k === 5) {
            if (window.filter(value => value === piece).length === 5) {
                score += 1000;
            } else if (
                window.filter(value => value === piece).length === 4 &&
                window.filter(value => value === ' ').length === 1
            ) {
                score += 50;
            } else if (
                window.filter(value => value === piece).length === 3 &&
                window.filter(value => value === ' ').length === 2
            ) {
                score += 20;
            } else if (
                window.filter(value => value === piece).length === 2 &&
                window.filter(value => value === ' ').length === 3
            ) {
                score += 5;
            }

            if (
                window.filter(value => value === oppPiece).length === 4 &&
                window.filter(value => value === ' ').length === 1
            ) {
                score -= 25;
            }

            return score;
        }

        // 6 in a row
        else if (k === 6) {
            if (window.filter(value => value === piece).length === 6) {
                score += 1000000;
            } else if (
                window.filter(value => value === piece).length === 5 &&
                window.filter(value => value === ' ').length === 1
            ) {
                score += 100000;
            } else if (
                window.filter(value => value === piece).length === 4 &&
                window.filter(value => value === ' ').length === 2
            ) {
                score += 50000;
            } else if (
                window.filter(value => value === piece).length === 3 &&
                window.filter(value => value === ' ').length === 3
            ) {
                score += 10000;
            } else if (
                window.filter(value => value === piece).length === 2 &&
                window.filter(value => value === ' ').length === 4
            ) {
                score += 1000;
            }

            if (
                window.filter(value => value === oppPiece).length === 5 &&
                window.filter(value => value === ' ').length === 1
            ) {
                score -= 50000;
            }

            return score;
        }
    }

    scorePosition(board, piece, k) {
        let score = 0;

        if (k === 4) {
            // Score center column
            const centerArray = Array.from(board.map(row => row[Math.floor(board.length / 2)]));
            const centerCount = centerArray.filter(value => value === piece).length;
            score += centerCount * 3;

            // Score Horizontal
            for (let r = 0; r < board.length; r++) {
                const rowArray = Array.from(board[r]);
                for (let c = 0; c < board.length - 3; c++) {
                    const window = rowArray.slice(c, c + 4);
                    score += this.evaluateWindow(window, piece, k);
                }
            }

            // Score Vertical
            for (let c = 0; c < board.length; c++) {
                const colArray = Array.from(board.map(row => row[c]));
                for (let r = 0; r < board.length - 3; r++) {
                    const window = colArray.slice(r, r + 4);
                    score += this.evaluateWindow(window, piece, k);
                }
            }

            // Score positive sloped diagonal
            for (let r = 0; r < board.length - 3; r++) {
                for (let c = 0; c < board.length - 3; c++) {
                    const window = Array.from({ length: 4 }, (_, i) => board[r + i][c + i]);
                    score += this.evaluateWindow(window, piece, k);
                }
            }

            // Score negative sloped diagonal
            for (let r = 0; r < board.length - 3; r++) {
                for (let c = 0; c < board.length - 3; c++) {
                    const window = Array.from({ length: 4 }, (_, i) => board[r + 3 - i][c + i]);
                    score += this.evaluateWindow(window, piece, k);
                }
            }

            return score;
        }

        // 5 in a row
        else if (k === 5) {
            // Score center column
            const centerArray = Array.from(board.map(row => row[Math.floor(board.length / 2)]));
            const centerCount = centerArray.filter(value => value === piece).length;
            score += centerCount * 3;

            // Score Horizontal
            for (let r = 0; r < board.length; r++) {
                const rowArray = Array.from(board[r]);
                for (let c = 0; c < board.length - 4; c++) {
                    const window = rowArray.slice(c, c + 5);
                    score += this.evaluateWindow(window, piece, k);
                }
            }

            // Score Vertical
            for (let c = 0; c < board.length; c++) {
                const colArray = Array.from(board.map(row => row[c]));
                for (let r = 0; r < board.length - 4; r++) {
                    const window = colArray.slice(r, r + 5);
                    score += this.evaluateWindow(window, piece, k);
                }
            }

            // Score positive sloped diagonal
            for (let r = 0; r < board.length - 4; r++) {
                for (let c = 0; c < board.length - 4; c++) {
                    const window = Array.from({ length: 5 }, (_, i) => board[r + i][c + i]);
                    score += this.evaluateWindow(window, piece, k);
                }
            }

            // Score negative sloped diagonal
            for (let r = 0; r < board.length - 4; r++) {
                for (let c = 0; c < board.length - 4; c++) {
                    const window = Array.from({ length: 5 }, (_, i) => board[r + 4 - i][c + i]);
                    score += this.evaluateWindow(window, piece, k);
                }
            }
        
            return score;

        }

        // 6 in a row
        else if (k === 6) {
            // Score center column
            const centerArray = Array.from(board.map(row => row[Math.floor(board.length / 2)]));
            const centerCount = centerArray.filter(value => value === piece).length;
            score += centerCount * 3;

            // Score Horizontal
            for (let r = 0; r < board.length; r++) {
                const rowArray = Array.from(board[r]);
                for (let c = 0; c < board.length - 5; c++) {
                    const window = rowArray.slice(c, c + 6);
                    score += this.evaluateWindow(window, piece, k);
                }
            }

            // Score Vertical
            for (let c = 0; c < board.length; c++) {
                const colArray = Array.from(board.map(row => row[c]));
                for (let r = 0; r < board.length - 5; r++) {
                    const window = colArray.slice(r, r + 6);
                    score += this.evaluateWindow(window, piece, k);
                }
            }

            // Score positive sloped diagonal
            for (let r = 0; r < board.length - 5; r++) {
                for (let c = 0; c < board.length - 5; c++) {
                    const window = Array.from({ length: 6 }, (_, i) => board[r + i][c + i]);
                    score += this.evaluateWindow(window, piece, k);
                }
            }

            // Score negative sloped diagonal
            for (let r = 0; r < board.length - 5; r++) {
                for (let c = 0; c < board.length - 5; c++) {
                    const window = Array.from({ length: 6 }, (_, i) => board[r + 5 - i][c + i]);
                    score += this.evaluateWindow(window, piece, k);
                }
            }
            return score;
        }
    }

    isTerminalNode(board, k) {
        return (
            this.winningMove(board, 'B', k) ||
            this.winningMove(board, 'W', k) ||
            this.board.valid_moves(board).length === 0
        );
    }

    minimax(board, depth, alpha, beta, maximizingPlayer, k) {
        const validLocations = this.board.valid_moves(board);
        const isTerminal = this.isTerminalNode(board, k);
        const oppPiece = 'W' === this.color ? 'B' : 'W';


        if (depth === 0 || isTerminal) {
            if (isTerminal) {
                if (this.winningMove(board, this.color, k)) {
                    return [null, 100000000000000];
                } else if (this.winningMove(board, oppPiece, k)) {
                    return [null, -10000000000000];
                } else {
                    // Game is over, no more valid moves
                    return [null, 0];
                }
            } else {
                // Depth is zero
                return [null, this.scorePosition(board, this.color, k)];
            }
        }

        if (maximizingPlayer) {
            let value = -Infinity;
            let column = this.choiceRandom(validLocations);

            for (const col of validLocations) {
                /* const row = this.getNextOpenRow(board, col); */
                
                
                const bCopy = this.board.clone(board); // Deep copy
                /* this.dropPiece(bCopy, row, col, piece); */
                this.board.move(bCopy,col,this.color)
                const newScore = this.minimax(bCopy, depth - 1, alpha, beta, false, k)[1];

                if (newScore > value) {
                    value = newScore;
                    column = col;
                }

                alpha = Math.max(alpha, value);

                if (alpha >= beta) {
                    break;
                }
            }

            return [column, value];
        } else {
            let value = Infinity;
            let column = this.choiceRandom(validLocations);

            for (const col of validLocations) {
                
                const bCopy = this.board.clone(board) // Deep copy
                /* this.dropPiece(bCopy, row, col, oppPiece); */
                this.board.move(bCopy,col,oppPiece)
                const newScore = this.minimax(bCopy, depth - 1, alpha, beta, true, k)[1];

                if (newScore < value) {
                    value = newScore;
                    column = col;
                }

                beta = Math.min(beta, value);

                if (alpha >= beta) {
                    break;
                }
            }

            return [column, value];
        }
    }

    compute(board, time) {
        let k = Konekti.vc('k').value
        let depth = 5
        if (board.length > 12) {
            depth = 3
        }
        // console.log("Depth: ", depth);
        return this.minimax(board, depth, -Infinity, Infinity, true, k)[0]
    }


}
/*
 * Environment (Cannot be modified or any of its attributes accesed directly)
 */
class Environment extends MainClient{
	constructor(){ 
        super()
        this.board = new Board()
    }

    setPlayers(players){ this.players = players }

	// Initializes the game 
	init(){ 
        var white = Konekti.vc('W').value // Name of competitor with white pieces
        var black = Konekti.vc('B').value // Name of competitor with black pieces
        var time = 1000*parseInt(Konekti.vc('time').value) // Maximum playing time assigned to a competitor (milliseconds)
        var size = parseInt(Konekti.vc('size').value) // Size of the reversi board
        var k = parseInt(Konekti.vc('k').value) // k-pieces in row
        
        this.k = k
        this.size = size
        this.rb = this.board.init(size)
        this.board.print(this.rb)
        var b1 = this.board.clone(this.rb)
        var b2 = this.board.clone(this.rb)

        this.white = white
        this.black = black
        this.ptime = {'W':time, 'B':time}
        Konekti.vc('W_time').innerHTML = ''+time
        Konekti.vc('B_time').innerHTML = ''+time
        this.player = 'W'
        this.winner = ''

        this.players[white].init('W', b1, time)
        this.players[black].init('B', b2, time)
    }

    // Listen to play button 
	play(){ 
        var TIME = 10
        var x = this
        var board = x.board
        x.player = 'W'
        Konekti.vc('log').innerHTML = 'The winner is...'

        x.init()
        var start = -1

        function clock(){
            if(x.winner!='') return
            if(start==-1) setTimeout(clock,TIME)
            else{
                var end = Date.now()
                var ellapsed = end - start
                var remaining = x.ptime[x.player] - ellapsed
                Konekti.vc(x.player+'_time').innerHTML = remaining
                Konekti.vc((x.player=='W'?'B':'W')+'_time').innerHTML = x.ptime[x.player=='W'?'B':'W']
                
                if(remaining <= 0) x.winner = (x.player=='W'?x.black:x.white) + ' since ' + (x.player=='W'?x.white:x.black) + 'got time out'
                else setTimeout(clock,TIME) 
            }
        }
        
        function compute(){
            var w = x.player=='W'
            var id = w?x.white:x.black
            var nid = w?x.black:x.white
            var b = board.clone(x.rb)
            start = Date.now()
            var action = x.players[id].compute(b, x.ptime[x.player])
            var end = Date.now()
            var flag = board.move(x.rb, action, x.player)
            if(!flag){
                x.winner = nid + ' ...Invalid move taken by ' + id + ' on column ' + action
            }else{
                var winner = board.winner(x.rb, x.k)
                // console.log(winner)
                if(winner!= ' ') x.winner = winner
                else{
                    var ellapsed = end - start
                    x.ptime[x.player] -= ellapsed
                    Konekti.vc(x.player+'_time').innerHTML = ''+x.ptime[x.player]
                    if(x.ptime[x.player] <= 0){ 
                        x.winner = nid + ' since ' + id + ' got run of time'
                    }else{
                        x.player = w?'B':'W'
                    }
                }    
            }

            board.print(x.rb)
            start = -1
            if(x.winner=='') setTimeout(compute,TIME)
            else Konekti.vc('log').innerHTML = 'The winner is ' + x.winner
        }

        board.print(x.rb)
        setTimeout(clock, 1000)
        setTimeout(compute, 1000)
    }
}

// Drawing commands
function custom_commands(){
    return [
        { 
            "command":" ", "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":255, "blue":255, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                }

            ]},
        { 
            "command":"-", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":0, "green":0, "blue":0, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[0,0,1,1,0],
                    "y":[0,1,1,0,0]
                }
            ]
        },
        {
            "command":"B",
            "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":0, "green":0, "blue":0, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                }
            ]
        },  
        {
            "command":"W",
            "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":255, "blue":0, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                },
            ]
        }
    ] 
}
