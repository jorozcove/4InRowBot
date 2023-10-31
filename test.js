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
            score += 10000;
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
        let score = 0
        // 5 in a row
        if (window.split(color).length - 1 === 5) {
            score += 100000;
        }

        // 4 in a row
        if (window.split(color).length - 1 === 4 && window.split(' ').length - 1 === 1) {
            score += 15;
        }
        // 3 in a row
        else if (window.split(color).length - 1 === 3 && window.split(' ').length - 1 === 1) {
            score += 5;
        }
        // 2 in a row
        else if (window.split(color).length - 1 === 2 && window.split(' ').length - 1 === 2) {
            score += 2;
        }

        //opponent 2 in a row
        if (window.split(this.opponent_color()).length - 1 === 2 && window.split(' ').length - 1 === 2) {
            score -= 3;
        }

        //opponent 3 in a row
        if (window.split(this.opponent_color()).length - 1 === 3 && window.split(' ').length - 1 === 1) {
            score -= 20;
        }

        //opponent 4 in a row
        if (window.split(this.opponent_color()).length - 1 >= 4 && window.split(' ').length - 1 === 1) {
            score -= 200;
        }

        //opponent 5 in a row
        if (window.split(this.opponent_color()).length - 1 >= 5) {
            score -= 100000;
        }

        return score
    }

    score_6(window, color) {
        let score = 0
        // 6 in a row
        if (window.split(color).length - 1 === 6) {
            score += 100000;
        }

        // 5 in a row
        if (window.split(color).length - 1 === 5 && window.split(' ').length - 1 === 1) {
            score += 15;
        }

        // 4 in a row
        if (window.split(color).length - 1 === 4 && window.split(' ').length - 1 === 1) {
            score += 5;
        }
        // 3 in a row
        else if (window.split(color).length - 1 === 3 && window.split(' ').length - 1 === 1) {
            score += 2;
        }
        // 2 in a row
        else if (window.split(color).length - 1 === 2 && window.split(' ').length - 1 === 2) {
            score += 1;
        }

        //opponent 2 in a row
        if (window.split(this.opponent_color()).length - 1 === 2 && window.split(' ').length - 1 === 2) {
            score -= 2;
        }

        //opponent 3 in a row
        if (window.split(this.opponent_color()).length - 1 === 3 && window.split(' ').length - 1 === 1) {
            score -= 16;
        }

        //opponent 4 in a row
        if (window.split(this.opponent_color()).length - 1 >= 4 && window.split(' ').length - 1 === 1) {
            score -= 25;
        }

        //opponent 5 in a row
        if (window.split(this.opponent_color()).length - 1 >= 5 && window.split(' ').length - 1 === 1) {
            score -= 200;
        }

        //opponent 6 in a row
        if (window.split(this.opponent_color()).length - 1 >= 6) {
            score -= 100000;
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

class CaosPlayer extends Agent {

    constructor(depth = 5) {
        super()
        this.board = new Board()
        this.depth = depth
    }

    choiceRandom(arr) {
        return arr[(Math.floor(Math.random() * arr.length))];
    }


    winningMove(board, piece) {
        // Check horizontal locations for win
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

    evaluateWindow(window, piece) {
        let score = 0;
        const oppPiece = 'W' === piece ? 'B' : 'W';

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

    scorePosition(board, piece) {
        let score = 0;

        // Score center column
        const centerArray = Array.from(board.map(row => row[Math.floor(board.length / 2)]));
        const centerCount = centerArray.filter(value => value === piece).length;
        score += centerCount * 3;

        // Score Horizontal
        for (let r = 0; r < board.length; r++) {
            const rowArray = Array.from(board[r]);
            for (let c = 0; c < board.length - 3; c++) {
                const window = rowArray.slice(c, c + 4);
                score += this.evaluateWindow(window, piece);
            }
        }

        // Score Vertical
        for (let c = 0; c < board.length; c++) {
            const colArray = Array.from(board.map(row => row[c]));
            for (let r = 0; r < board.length - 3; r++) {
                const window = colArray.slice(r, r + 4);
                score += this.evaluateWindow(window, piece);
            }
        }

        // Score positive sloped diagonal
        for (let r = 0; r < board.length - 3; r++) {
            for (let c = 0; c < board.length - 3; c++) {
                const window = Array.from({ length: 4 }, (_, i) => board[r + i][c + i]);
                score += this.evaluateWindow(window, piece);
            }
        }

        for (let r = 0; r < board.length - 3; r++) {
            for (let c = 0; c < board.length - 3; c++) {
                const window = Array.from({ length: 4 }, (_, i) => board[r + 3 - i][c + i]);
                score += this.evaluateWindow(window, piece);
            }
        }

        return score;
    }

    isTerminalNode(board) {
        return (
            this.winningMove(board, 'B') ||
            this.winningMove(board, 'W') ||
            this.board.valid_moves(board).length === 0
        );
    }

    minimax(board, depth, alpha, beta, maximizingPlayer) {
        const validLocations = this.board.valid_moves(board);
        const isTerminal = this.isTerminalNode(board);
        const oppPiece = 'W' === this.color ? 'B' : 'W';


        if (depth === 0 || isTerminal) {
            if (isTerminal) {
                if (this.winningMove(board, this.color)) {
                    return [null, 100000000000000];
                } else if (this.winningMove(board, oppPiece)) {
                    return [null, -10000000000000];
                } else {
                    // Game is over, no more valid moves
                    return [null, 0];
                }
            } else {
                // Depth is zero
                return [null, this.scorePosition(board, this.color)];
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
                const newScore = this.minimax(bCopy, depth - 1, alpha, beta, false)[1];

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
                const newScore = this.minimax(bCopy, depth - 1, alpha, beta, true)[1];

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
        /* for (var i = 0; i < 50000000; i++) { } // Making it very slow to test time restriction
        for (var i = 0; i < 50000000; i++) { } // Making it very slow to test time restriction */
        // console.table(board)
        return this.minimax(board, this.depth, -Infinity, Infinity, true)[0]
    }


}

const k = 4
const size = 7
const max_d = 6

// Put two agents od same class to play
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


function get_score_progression(){
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
}

// get_score_progression()

// Put two agents of different classes to play
function play_game2(m1, m2){

    let board = new Board()
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
    console.log( " Winner: ", winner, " Moves: ", moves.length, " Val: ", val)
    
    return val

}

// const m1 = new MinimaxPlayer(5)
// const m2 = new CaosPlayer(5)
// play_game2(m1,m2)


// put two different agents to play with all the possible depth combinations
function play_all_games(){
    let val
    minmax_wins = {}
    caos_wins = {}


    for(var i=1; i<=max_d; i++){
        val = play_game2(new CaosPlayer(i), new MinimaxPlayer(i))
        if(val==1) caos_wins[i] = (caos_wins[i] || 0) + 1
        else if(val==-1) minmax_wins[i] = (minmax_wins[i] || 0) + 1

        console.log("---------------")
        
        val = play_game2(new MinimaxPlayer(i), new CaosPlayer(i))
        if(val==1) minmax_wins[i] = (minmax_wins[i] || 0) + 1
        else if(val==-1) caos_wins[i] = (caos_wins[i] || 0) + 1
            
    }

    console.log("Minimax Wins: ", minmax_wins)
    console.log("Caos Wins: ", caos_wins)

}

    



// play_all_games()

play_game2(new MinimaxPlayer(1), new CaosPlayer(1))