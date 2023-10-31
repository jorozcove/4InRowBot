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
}

class MinimaxPlayer extends Agent {
    constructor(maxDepth=null) {
        super();
        this.board = new Board();
        this.maxDepth = maxDepth;
        this.move_number = 0;
    }

    compute(board, time) {

        this.board_k = k

        // make first move in the center
        if (this.move_number === 0) {
            this.move_number++;
            return Math.floor(board[0].length / 2);
        }


        if (!this.maxDepth) {
            let valid_moves = this.board.valid_moves(board)
            let best_score = -Infinity;
            let best_move = null;
            let score;

            let scores = []

            for(let col of valid_moves){
                let temp_board = this.board.clone(board)
                this.board.move(temp_board, col, this.color)
                score = this.score_position(temp_board, this.color)
                scores.push(score)
                if (score > best_score) {
                    best_score = score;
                    best_move = col;
                }
            }

            this.move_number++;
            return best_move;
        }
        
        let value = this.minimax(board, 0, -Infinity, Infinity, true)[0];
        // let value = this.negamax(board, 0, -Infinity, Infinity, this.color)[0];
        // console.log(this.color, value)

        return value;
    }

    isTerminalMode(board) {
        return this.board.winner(board, this.board_k) !== ' ' || this.board.valid_moves(board).length <= 0;
    }

    negamax(board, depth, alpha, beta) {
        let valid_moves = this.board.valid_moves(board)
        const moves = this.board.valid_moves(board)
        let best_move = Math.floor(moves.length * Math.random());
        let score;

        if (depth >= this.maxDepth || this.isTerminalMode(board)) {
            if (this.isTerminalMode(board)) {
                if (this.board.winner(board, this.board_k) === this.color) {
                    return [null, Infinity];
                } else if (this.board.winner(board, this.board_k) === this.opponent_color()) {
                    return [null, -Infinity];
                } else {
                    return [null, 0];
                }
            }
            return [null, this.score_position(board, this.color)];
        }

        let scores = []

        let best_score = -Infinity;
        for(let col of valid_moves){
            let temp_board = this.board.clone(board)
            this.board.move(temp_board, col, this.color)
            score = -this.minimax(temp_board, depth + 1, -alpha, -beta)[1]
            scores.push(score)
            if (score > best_score) {
                best_score = score;
                best_move = col;
            }
            alpha = Math.max(alpha, score);
            if (alpha >= beta) {
                break;
            }
        }

        return [best_move, best_score];

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
                score = this.minimax(temp_board, depth + 1, alpha, beta, false)[1]
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
            score = this.minimax(temp_board, depth + 1, alpha, beta, true)[1]
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

    score_4(window, color) {
        let score = 0
        // 4 in a row
        if (window.split(color).length - 1 === 4) {
            score += 10500;
        }
        // 3 in a row
        else if (window.split(color).length - 1 === 3 && window.split(' ').length - 1 === 1) {
            score += 15;
        }
        // 2 in a row
        else if (window.split(color).length - 1 === 2 && window.split(' ').length - 1 === 2) {
            score += 5;
        }

        //opponent 2 in a row
        if (window.split(this.opponent_color()).length - 1 === 2 && window.split(' ').length - 1 === 2) {
            score -= 6;
        }

        //opponent 3 in a row
        if (window.split(this.opponent_color()).length - 1 === 3 && window.split(' ').length - 1 === 1) {
            score -= 200;
        }

        //opponent 4 in a row
        if (window.split(this.opponent_color()).length - 1 >= 4) {
            score -= 10000;
        }
        return score
    }

    score_5(window, color) {
        let score = this.score_4(window, color)
        // 5 in a row
        if (window.split(color).length - 1 >= 5) {
            score += 100000;
        }
        //opponent 5 in a row
        if (window.split(this.opponent_color()).length - 1 >= 5) {
            score -= 100000;
        }
        return score
    }

    score_6(window, color) {
        let score = this.score_5(window, color)
        // 6 in a row
        if (window.split(color).length - 1 >= 6) {
            score += 1000000;
        }
        //opponent 6 in a row
        if (window.split(this.opponent_color()).length - 1 >= 6) {
            score -= 1000000;
        }
        return score
    }

    score_window(window, color) {
        let score = 0;

        if (window.length === 4) {
            score += this.score_4(window, color)
        } else if (window.length === 5) {
            score += this.score_5(window, color)
        } else if (window.length === 6) {
            score += this.score_6(window, color)
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


const k = 4
const size = 7 

// Put two agents to play
function play_game(w_depth, b_depth){

    let board = new Board()
    let m1 = new MinimaxPlayer(w_depth)
    let m2 = new MinimaxPlayer(b_depth)

    m1.init('W', board, k)
    m2.init('B', board, k)

    let b = board.init(size)

    let turn = 0
    let winner = ' '
    let moves = []

    while(winner==' ' && moves.length<size*size){
        if(turn%2==0) var move = m1.compute(b)
        else var move = m2.compute(b)
        if(!board.move(b, move, turn%2==0?'W':'B')) break;
        moves.push(move)
        winner = board.winner(b, k)
        turn++
    }

    let val
    if (winner === 'W') {
        val = 1
    } else if (winner === 'B') {
        val = -1
    } else {
        val = 0
    }

    // print depths and winner
    console.log( " W: ", w_depth, " B: ", b_depth, " Winner: ", winner, " Moves: ", moves.length, " Val: ", val)
    
    return val

}

const max_d = 5
let val
let val_row = []
let val_matrix = []

for(var i=1; i<=max_d; i++){
    for(var j=1; j<=max_d; j++){
        if(i!=j){
            val = play_game(i, j)
            val_row.push(val)
        }
        else val_row.push(0)
    }
    val_matrix.push(val_row)
    val_row = []
}

let total_score = {}

// {
//     '1' : sum(row_1) - sum(col_1),
//     '2' : sum(row_2) - sum(col_2),
//     ...
// }

for(var i=0; i<val_matrix.length; i++){
    total_score[i+1] = val_matrix[i].reduce((a, b) => a + b, 0) - val_matrix.map(x => x[i]).reduce((a, b) => a + b, 0)
}

console.log(val_matrix)
console.log(total_score)
