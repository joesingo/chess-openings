/*
 * Representation of a chess piece. Has a piece type (rook, knight etc) and a
 * colour
 */
class Piece {
    constructor(type, colour) {
        this.type = type;
        this.colour = colour;
    }

    get_image_url() {
        return `images/${this.colour}${this.type}.png`;
    }
}

/*
 * Representation of a cell in the chess board. May or may not contain a piece
 */
class Cell {
    /*
     * x and y are 0-indexed column and row indices (0th row is black's king
     * row)
     *
     * element is the <td> element representing this cell
     */
    constructor(x, y, element) {
        this.x = x;
        this.y = y;
        this.piece = null;
        this.element = element;
    }

    set_piece(piece) {
        this.piece = piece;
    }

    clear_piece() {
        this.set_piece(null);
    }

    update_element() {
        let background_image = "";
        if (this.piece) {
            let image_url = this.piece.get_image_url();
            background_image = `url('${image_url}')`;
        }
        this.element.style.backgroundImage = background_image;
    }

    /*
     * Return coordinates in algebraic chess notation
     */
    notation_coords() {
        return FILES[this.x] + (8 - this.y);
    }

    /*
     * Return [x, y] from algebraic chess notation
     */
    static coords_from_notation(notation) {
        let x = FILES.indexOf(notation[0]);
        let y = 8 - parseInt(notation[1]);
        return [x, y];
    }
}

/*
 * Representation of the entire chess board
 */
class ChessBoard {
    constructor(opening) {
        this.opening = opening;
        this.current_player = WHITE;
        this.moves_played = 0;
        this.cells = this.create_cells();
        this.finished = false;
        this.clicked_cell = null;  // the cell that the user is trying to move

        // Create table to display cells on the page
        this.table = document.createElement("table");
        for (let y=0; y<8; y++) {
            let row = document.createElement("tr");
            for (let x=0; x<8; x++) {
                // If the player is white, then display the cells as they
                // appear in the 2D array. If the player is black, reverse the
                // order of the rows and columns so that the player always
                // appears at the bottom
                let cell_x = null;
                let cell_y = null;
                if (this.opening.player_colour == WHITE) {
                    cell_x = x;
                    cell_y = y;
                }
                else {
                    cell_x = 7 - x;
                    cell_y = 7 - y;
                }

                let cell = this.cells[cell_x][cell_y];
                row.appendChild(cell.element);
                cell.update_element();
            }
            this.table.appendChild(row);
        }
    }

    start(game_area) {
        // Reset display area and add table
        game_area.innerHTML = "";
        game_area.appendChild(this.table);

        if (this.current_player != this.opening.player_colour) {
            this.do_cpu_move();
        }
    }

    /*
     * Return a 2D array of Cell objects. White pieces are always in the bottom
     * row
     */
    create_cells() {
        let cells = [];
        for (let x=0; x<8; x++) {
            cells.push([]);
            for (let y=0; y<8; y++) {
                let el = document.createElement("td");
                el.classList.add((x + y) % 2 == 0 ? "light-square" : "dark-square");
                let cell = new Cell(x, y, el);
                cells[x].push(cell);

                el.onclick = function () {
                    this.handle_click(cell);
                }.bind(this);
            }
        }

        // Fill in pieces
        let colours = [WHITE, BLACK];
        for (let i=0; i<colours.length; i++) {
            let colour = colours[i];
            // Work out y-coordinates of the front and back rows for this
            // colour
            let back = (colour == WHITE ? 7 : 0);
            let front = (colour == WHITE ? back - 1 : back + 1);

            let back_row_types = [ROOK, KNIGHT, BISHOP];
            for (let i=0; i<back_row_types.length; i++) {
                let piece = new Piece(back_row_types[i], colour);
                cells[i][back].set_piece(piece);
                cells[7 - i][back].set_piece(piece);
            }
            cells[3][back].set_piece(new Piece(QUEEN, colour));
            cells[4][back].set_piece(new Piece(KING, colour));
            for (let x=0; x<8; x++) {
                cells[x][front].set_piece(new Piece(PAWN, colour));
            }
        }
        return cells;
    }

    /*
     * Handle a cell in the board being clicked
     */
    handle_click(cell) {
        if (this.finished) {
            console.error("The opening has finished!");
            return;
        }
        if (this.current_player != this.opening.player_colour) {
            console.error("It's not your turn");
            return;
        }
        // If haven't clicked a cell yet, then this cell should be the piece to
        // move
        if (!this.clicked_cell) {
            if (!cell.piece) {
                console.error("Cannot move an empty cell");
                return;
            }
            this.clicked_cell = cell;
            this.clicked_cell.element.classList.add("selected");
            this.table.classList.add("piece-selected");
            // Stop here, since a piece has been selected
            return;
        }

        // Cannot move onto a piece with the same colour
        if (cell.piece && cell.piece.colour == this.clicked_cell.piece.colour) {
            console.error("Cannot move onto your own piece");
            return;
        }

        let user_move = {
            "src": this.clicked_cell.notation_coords(),
            "dest": cell.notation_coords()
        };
        let expected_move = this.get_next_move();
        if (this.moves_match(user_move, expected_move)) {
            // Use expected_move instead of user_move, since we might be
            // castling
            this.make_move(expected_move);
            if (!this.finished) {
                this.do_cpu_move();
            }
        }
        else {
            this.show_error("Incorrect move!");
        }
        this.clicked_cell.element.classList.remove("selected");
        this.table.classList.remove("piece-selected");
        this.clicked_cell = null;
    }

    get_next_move() {
        return this.opening.moves[this.moves_played];
    }

    /*
     * Make the CPUs move after a short delay
     */
    do_cpu_move() {
        if (this.current_player == this.opening.player_colour) {
            throw new Error("it is not the CPUs turn");
        }
        setTimeout(function() {
            this.make_move(this.get_next_move());
        }.bind(this), CPU_MOVE_DELAY);
    }

    /*
     * Make a move, where `move` is an object from the `moves` arary in an
     * opening
     */
    make_move(move) {
        this.current_player = (this.current_player == WHITE ? BLACK : WHITE);
        this.moves_played += 1;

        // Make an array of the actual piece movements. May be more than one
        // movement when castling!
        let movements = [move];
        if (move.castle_move) {
            movements.push(move.castle_move);
        }
        for (let i=0; i<movements.length; i++) {
            let src = movements[i].src;
            let dest = movements[i].dest;
            let src_coords = Cell.coords_from_notation(src);
            let dest_coords = Cell.coords_from_notation(dest);
            let src_cell = this.cells[src_coords[0]][src_coords[1]];
            let dest_cell = this.cells[dest_coords[0]][dest_coords[1]];

            dest_cell.set_piece(src_cell.piece);
            src_cell.clear_piece();

            // Update table
            src_cell.update_element();
            dest_cell.update_element();
        }

        if (this.moves_played == this.opening.moves.length) {
            this.finished = true;
            // Wait the CPU move time to display alert
            setTimeout(function() {
                alert("You did it!");
            }, CPU_MOVE_DELAY);
        }
    }

    /*
     * Return true if the given moves match
     *
     * Each move is an object with keys "src" and "dest", e.g.
     * {"src": "e2", "dest": "e4"}
     */
    moves_match(move1, move2) {
        return move1.src == move2.src && move1.dest == move2.dest;
    }

    /*
     * Show an error message to the user
     */
    show_error(msg) {
        alert(msg);
    }
}

/*
 * Class to orchestrate the whole app
 */
class ChessOpeningsApp {
    constructor(game_area) {
        this.game_area = document.getElementById("game-area");

        // Create the dropdown listing the available openings
        let dropdown = document.getElementById("opening-dropdown");
        for (let opening_name in OPENINGS) {
            let option = document.createElement("option");
            option.setAttribute("value", opening_name);
            option.innerText = opening_name;
            dropdown.add(option);
        }
        // Start an opening when 'Go' button is pressed
        let go_button = document.getElementById("go-button");
        go_button.onclick = function() {
            let opening = OPENINGS[dropdown.value];
            this.go(opening);
        }.bind(this);
    }

    go(opening) {
        let chess_board = new ChessBoard(opening);
        chess_board.start(this.game_area);
    }
}

let app = new ChessOpeningsApp();
