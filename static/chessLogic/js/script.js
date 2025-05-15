let STACK_SIZE = 100; // maximum size of undo stack
let board = null;
let $board = $("#myBoard");
let game = new Chess();
let globalSum = 0; // always from black's perspective. Negative for white's perspective.
let whiteSquareGrey = "#a9a9a9";
let blackSquareGrey = "#696969";

let squareClass = "square-55d63";
let squareToHighlight = null;
let colorToHighlight = null;
let positionCount;
const isAi = JSON.parse(localStorage.getItem("isAi"));

const AiContent = `
  <div class="col-md-6">
    <h1 id="whoVSwho" class="text-align-center text-uppercase">AI <span
            class="fs-3 text-lowercase">Vs</span> You</h1>
    <div class="accordion " id="accordion">
        <div class="card">
            <div class="accordion-item" id="settingsHeading">
                <button class="accordion-button " type="button" data-bs-toggle="collapse"
                    data-bs-target="#level" aria-expanded="true" aria-controls="level">
                    <h4 class="w-100 text-align-center">Level</h4>
                </button>
            </div>
        </div>
        <div id="level" class="accordion-collapse collapse" aria-labelledby="settingsHeading"
            data-bs-parent="#accordion">
            <div class="card-body">
                <div class="row align-items-center justify-content-center">
                    <div class="d-flex flex-column p-2 w-25 gap-3" id="level-Buttons">
                        <button class="btn btn-secondary button-active" role="button"
                            aria-pressed="true" data-depth="1">Beginner</button>
                        <button class="btn btn-secondary " role="button" aria-pressed="true"
                            data-depth="2">Intermediate</button>
                        <button class="btn btn-secondary " role="button" aria-pressed="true"
                            data-depth="3">Advanced</button>
                        <button class="btn btn-secondary " role="button" aria-pressed="true"
                            data-depth="4">Expert</button>
                        <button class="btn btn-secondary " role="button" aria-pressed="true"
                            data-depth="4">Grandmaster </button>
                    </div>
                </div>
                <div class="text-align-center p-4">
                    <div class="form-group">
                        <button id="showHint" type="button" class="btn btn-primary"
                            data-bs-toggle="button" autocomplete="off">Show Suggested Move</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row my-3 text-align-center">
        <div class="col-md-12">
            <h2>Status :
                <span id="status" class="fs-4">None</span>
            </h2>
        </div>
    </div>

    <button type="button" id="compVscomp" class="w-100 btn btn-secondary" data-bs-toggle="button"
        autocomplete="off">Computer Vs Computer</button>
  </div>
`;

const FriendsContent = `
  <div class="col-md-6">
      <h1 id="whoVSwho" class="text-align-center text-uppercase">Friend <span
              class="fs-3 text-lowercase">Vs</span> You</h1>
      <div class="row my-3 text-align-center">
          <div class="col-md-12">
              <h2>Status :
                  <span id="status" class="fs-4">None</span>
              </h2>
          </div>
      </div>
      
      <button type="button" id="flipOrientationBtn" class="w-100 btn btn-secondary">Toggle Perspective</button>

      <button type="button" id="turn" class="my-3 w-100 btn btn-light">White's Turn</button>
  </div>
`;

if (isAi) {
  $("#main-content").children().first().replaceWith(AiContent);
}
if (!isAi) {
  $("#main-content").children().first().replaceWith(FriendsContent);
}

let config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
  moveSpeed: "slow",
  snapbackSpeed: 300,
  snapSpeed: 100,
  pieceTheme: "img/chesspieces/alpha/{piece}.png",
  // pieceTheme: 'img/chesspieces/uscf/{piece}.png',
};
board = Chessboard("myBoard", config);

timer = null;

let weights = {
  p: 100,
  n: 280,
  b: 320,
  r: 479,
  q: 929,
  k: 60000,
  k_e: 60000,
};
let pst_w = {
  p: [
    [100, 100, 100, 100, 105, 100, 100, 100],
    [78, 83, 86, 73, 102, 82, 85, 90],
    [7, 29, 21, 44, 40, 31, 44, 7],
    [-17, 16, -2, 15, 14, 0, 15, -13],
    [-26, 3, 10, 9, 6, 1, 0, -23],
    [-22, 9, 5, -11, -10, -2, 3, -19],
    [-31, 8, -7, -37, -36, -14, 3, -31],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-66, -53, -75, -75, -10, -55, -58, -70],
    [-3, -6, 100, -36, 4, 62, -4, -14],
    [10, 67, 1, 74, 73, 27, 62, -2],
    [24, 24, 45, 37, 33, 41, 25, 17],
    [-1, 5, 31, 21, 22, 35, 2, 0],
    [-18, 10, 13, 22, 18, 15, 11, -14],
    [-23, -15, 2, 0, 2, 0, -23, -20],
    [-74, -23, -26, -24, -19, -35, -22, -69],
  ],
  b: [
    [-59, -78, -82, -76, -23, -107, -37, -50],
    [-11, 20, 35, -42, -39, 31, 2, -22],
    [-9, 39, -32, 41, 52, -10, 28, -14],
    [25, 17, 20, 34, 26, 25, 15, 10],
    [13, 10, 17, 23, 17, 16, 0, 7],
    [14, 25, 24, 15, 8, 25, 20, 15],
    [19, 20, 11, 6, 7, 6, 20, 16],
    [-7, 2, -15, -12, -14, -15, -10, -10],
  ],
  r: [
    [35, 29, 33, 4, 37, 33, 56, 50],
    [55, 29, 56, 67, 55, 62, 34, 60],
    [19, 35, 28, 33, 45, 27, 25, 15],
    [0, 5, 16, 13, 18, -4, -9, -6],
    [-28, -35, -16, -21, -13, -29, -46, -30],
    [-42, -28, -42, -25, -25, -35, -26, -46],
    [-53, -38, -31, -26, -29, -43, -44, -53],
    [-30, -24, -18, 5, -2, -18, -31, -32],
  ],
  q: [
    [6, 1, -8, -104, 69, 24, 88, 26],
    [14, 32, 60, -10, 20, 76, 57, 24],
    [-2, 43, 32, 60, 72, 63, 43, 2],
    [1, -16, 22, 17, 25, 20, -13, -6],
    [-14, -15, -2, -5, -1, -10, -20, -22],
    [-30, -6, -13, -11, -16, -11, -16, -27],
    [-36, -18, 0, -19, -15, -15, -21, -38],
    [-39, -30, -31, -13, -31, -36, -34, -42],
  ],
  k: [
    [4, 54, 47, -99, -99, 60, 83, -62],
    [-32, 10, 55, 56, 56, 55, 10, 3],
    [-62, 12, -57, 44, -67, 28, 37, -31],
    [-55, 50, 11, -4, -19, 13, 0, -49],
    [-55, -43, -52, -28, -51, -47, -8, -50],
    [-47, -42, -43, -79, -64, -32, -29, -32],
    [-4, 3, -14, -50, -57, -18, 13, 4],
    [17, 30, -3, -14, 6, -1, 40, 18],
  ],

  // Endgame King Table
  k_e: [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -30, 0, 0, 0, 0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50],
  ],
};
let pst_b = {
  p: pst_w["p"].slice().reverse(),
  n: pst_w["n"].slice().reverse(),
  b: pst_w["b"].slice().reverse(),
  r: pst_w["r"].slice().reverse(),
  q: pst_w["q"].slice().reverse(),
  k: pst_w["k"].slice().reverse(),
  k_e: pst_w["k_e"].slice().reverse(),
};

let pstOpponent = { w: pst_b, b: pst_w };
let pstSelf = { w: pst_w, b: pst_b };

function evaluateBoard(game, move, prevSum, color) {
  if (game.in_checkmate()) {
    // Opponent is in checkmate (good for us)
    if (move.color === color) {
      return 10 ** 10;
    }
    // Our king's in checkmate (bad for us)
    else {
      return -(10 ** 10);
    }
  }

  if (game.in_draw() || game.in_threefold_repetition() || game.in_stalemate()) {
    return 0;
  }

  if (game.in_check()) {
    // Opponent is in check (good for us)
    if (move.color === color) {
      prevSum += 50;
    }
    // Our king's in check (bad for us)
    else {
      prevSum -= 50;
    }
  }

  let from = [
    8 - parseInt(move.from[1]),
    move.from.charCodeAt(0) - "a".charCodeAt(0),
  ];
  let to = [
    8 - parseInt(move.to[1]),
    move.to.charCodeAt(0) - "a".charCodeAt(0),
  ];

  // Change endgame behavior for kings
  if (prevSum < -1500) {
    if (move.piece === "k") {
      move.piece = "k_e";
    }
    // Kings can never be captured
    // else if (move.captured === 'k') {
    //   move.captured = 'k_e';
    // }
  }

  if ("captured" in move) {
    // Opponent piece was captured (good for us)
    if (move.color === color) {
      prevSum +=
        weights[move.captured] +
        pstOpponent[move.color][move.captured][to[0]][to[1]];
    }
    // Our piece was captured (bad for us)
    else {
      prevSum -=
        weights[move.captured] +
        pstSelf[move.color][move.captured][to[0]][to[1]];
    }
  }

  if (move.flags.includes("p")) {
    // NOTE: promote to queen for simplicity
    move.promotion = "q";

    // Our piece was promoted (good for us)
    if (move.color === color) {
      prevSum -=
        weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
      prevSum +=
        weights[move.promotion] +
        pstSelf[move.color][move.promotion][to[0]][to[1]];
    }
    // Opponent piece was promoted (bad for us)
    else {
      prevSum +=
        weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
      prevSum -=
        weights[move.promotion] +
        pstSelf[move.color][move.promotion][to[0]][to[1]];
    }
  } else {
    // The moved piece still exists on the updated board, so we only need to update the position value
    if (move.color !== color) {
      prevSum += pstSelf[move.color][move.piece][from[0]][from[1]];
      prevSum -= pstSelf[move.color][move.piece][to[0]][to[1]];
    } else {
      prevSum -= pstSelf[move.color][move.piece][from[0]][from[1]];
      prevSum += pstSelf[move.color][move.piece][to[0]][to[1]];
    }
  }

  return prevSum;
}

function minimax(game, depth, alpha, beta, isMaximizingPlayer, sum, color) {
  positionCount++;
  let children = game.ugly_moves({ verbose: true });

  // Sort moves randomly, so the same move isn't always picked on ties
  children.sort(function (a, b) {
    return 0.5 - Math.random();
  });

  let currMove;
  // Maximum depth exceeded or node is a terminal node (no children)
  if (depth === 0 || children.length === 0) {
    return [null, sum];
  }

  // Find maximum/minimum from list of 'children' (possible moves)
  let maxValue = Number.NEGATIVE_INFINITY;
  let minValue = Number.POSITIVE_INFINITY;
  let bestMove;
  for (let i = 0; i < children.length; i++) {
    currMove = children[i];

    // Note: in our case, the 'children' are simply modified game states
    let currPrettyMove = game.ugly_move(currMove);
    let newSum = evaluateBoard(game, currPrettyMove, sum, color);
    let [childBestMove, childValue] = minimax(
      game,
      depth - 1,
      alpha,
      beta,
      !isMaximizingPlayer,
      newSum,
      color
    );

    game.undo();

    if (isMaximizingPlayer) {
      if (childValue > maxValue) {
        maxValue = childValue;
        bestMove = currPrettyMove;
      }
      if (childValue > alpha) {
        alpha = childValue;
      }
    } else {
      if (childValue < minValue) {
        minValue = childValue;
        bestMove = currPrettyMove;
      }
      if (childValue < beta) {
        beta = childValue;
      }
    }

    // Alpha-beta pruning
    if (alpha >= beta) {
      break;
    }
  }

  if (isMaximizingPlayer) {
    return [bestMove, maxValue];
  } else {
    return [bestMove, minValue];
  }
}

function checkStatus(color) {
  if (game.in_checkmate()) {
    $("#status").html(`Checkmate! <b>${color}</b> lost.`);
  } else if (game.insufficient_material()) {
    $("#status").html(`It's a <b>draw!</b>`);
  } else if (game.in_threefold_repetition()) {
    $("#status").html(`It's a <b>draw!</b>`);
  } else if (game.in_stalemate()) {
    $("#status").html(`It's a <b>draw!</b>`);
  } else if (game.in_draw()) {
    $("#status").html(`It's a <b>draw!</b>`);
  } else if (game.in_check()) {
    $("#status").html(`<b>${color}</b> is in <b>check!</b>`);
    return false;
  } else {
    $("#status").html(`None`);
    return false;
  }
  return true;
}

// Calculates the best legal move for the given color.

function getBestMove(game, color, currSum) {
  positionCount = 0;

  let depth = parseInt($("#level-Buttons .button-active").data("depth"));

  let d = new Date().getTime();
  let [bestMove, bestMoveValue] = minimax(
    game,
    depth,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    true,
    currSum,
    color
  );
  let d2 = new Date().getTime();
  let moveTime = d2 - d;
  let positionsPerS = (positionCount * 1000) / moveTime;

  $("#position-count").text(positionCount);
  $("#time").text(moveTime / 1000);
  $("#positions-per-s").text(Math.round(positionsPerS));

  return [bestMove, bestMoveValue];
}

// Makes the best legal move for the given color.

function makeBestMove(color) {
  let move;
  if (color === "b") {
    move = getBestMove(game, color, globalSum)[0];
  } else {
    move = getBestMove(game, color, -globalSum)[0];
  }

  globalSum = evaluateBoard(game, move, globalSum, "b");
  // updateAdvantage();

  game.move(move);
  board.position(game.fen());

  if (color === "b") {
    checkStatus("black");

    // Highlight black move
    $board.find("." + squareClass).removeClass("highlight-black");
    $board.find(".square-" + move.from).addClass("highlight-black");
    squareToHighlight = move.to;
    colorToHighlight = "black";

    $board
      .find(".square-" + squareToHighlight)
      .addClass("highlight-" + colorToHighlight);
  } else {
    checkStatus("white");

    // Highlight white move
    $board.find("." + squareClass).removeClass("highlight-white");
    $board.find(".square-" + move.from).addClass("highlight-white");
    squareToHighlight = move.to;
    colorToHighlight = "white";

    $board
      .find(".square-" + squareToHighlight)
      .addClass("highlight-" + colorToHighlight);
  }
}

function compVsComp(color) {
  if (!checkStatus({ w: "white", b: "black" }[color])) {
    timer = window.setTimeout(function () {
      makeBestMove(color);
      if (color === "w") {
        color = "b";
      } else {
        color = "w";
      }
      compVsComp(color);
    }, 500);
  }
}

function reset() {
  game.reset();
  globalSum = 0;
  $board.find("." + squareClass).removeClass("highlight-white");
  $board.find("." + squareClass).removeClass("highlight-black");
  $board.find("." + squareClass).removeClass("highlight-hint");
  board.position(game.fen());

  // Kill the Computer vs. Computer callback
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

$("#compVscomp").on("click", function () {
  reset();
  compVsComp("w");
});
$("#resetBtn").on("click", function () {
  reset();
});

let undo_stack = [];

function undo() {
  let move = game.undo();
  undo_stack.push(move);

  // Maintain a maximum stack size
  if (undo_stack.length > STACK_SIZE) {
    undo_stack.shift();
  }
  board.position(game.fen());
}

$("#undoBtn").on("click", function () {
  if (game.history().length >= 2) {
    $board.find("." + squareClass).removeClass("highlight-white");
    $board.find("." + squareClass).removeClass("highlight-black");
    $board.find("." + squareClass).removeClass("highlight-hint");

    // Undo twice: Opponent's latest move, followed by player's latest move
    undo();
    window.setTimeout(function () {
      undo();
      window.setTimeout(function () {
        showHint();
      }, 250);
    }, 250);
  } else {
    alert("Nothing to undo.");
  }
});

function redo() {
  game.move(undo_stack.pop());
  board.position(game.fen());
}

$("#redoBtn").on("click", function () {
  if (undo_stack.length >= 2) {
    // Redo twice: Player's last move, followed by opponent's last move
    redo();
    window.setTimeout(function () {
      redo();
      window.setTimeout(function () {
        showHint();
      }, 250);
    }, 250);
  } else {
    alert("Nothing to redo.");
  }
});

$("#showHint").click(function () {
  if ($(this).hasClass("active")) {
    window.setTimeout(showHint, 250);
  } else {
    console.log("Button is not selected");
  }
});

$("#flipOrientationBtn").on("click", board.flip);

function showHint() {
  let showHint = document.getElementById("showHint");
  $board.find("." + squareClass).removeClass("highlight-hint");
  // Show hint (best move for white)
  if (showHint.classList.contains("active")) {
    // console.log("showing");
    let move = getBestMove(game, "w", -globalSum)[0];

    $board.find(".square-" + move.from).addClass("highlight-hint");
    $board.find(".square-" + move.to).addClass("highlight-hint");
  }
}

function removeGreySquares() {
  $("#myBoard .square-55d63").css("background", "");
}

function greySquare(square) {
  let $square = $("#myBoard .square-" + square);

  let background = whiteSquareGrey;
  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
}

function onDragStart(source, piece) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // or if it's not that side's turn
  if (
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function onDrop(source, target) {
  undo_stack = [];
  removeGreySquares();

  // see if the move is legal
  let move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // Illegal move
  if (move === null) return "snapback";

  // globalSum = evaluateBoard(game, move, globalSum, "b");
  // // updateAdvantage();

  // Highlight latest move
  $board.find("." + squareClass).removeClass("highlight-white");

  $board.find(".square-" + move.from).addClass("highlight-white");
  squareToHighlight = move.to;
  colorToHighlight = "white";

  const currentTurn = game.turn();
  const turnElement = $('#turn');
  console.log(turnElement)

  if (currentTurn === "w") {
    turnElement.removeClass('btn-dark')
    turnElement.addClass('btn-light')
    turnElement.text("White's Turn");
  } else {
    turnElement.removeClass('btn-light')
    turnElement.addClass('btn-dark')
    turnElement.text("Black's Turn");
  }

  $board
    .find(".square-" + squareToHighlight)
    .addClass("highlight-" + colorToHighlight);

  if (isAi && !checkStatus("black")) {
    window.setTimeout(function () {
      // Make the best move for black
      makeBestMove("b");
      window.setTimeout(function () {
        showHint();
      }, 250);
    }, 250);
  }
}

function onMouseoverSquare(square, piece) {
  // get list of possible moves for this square
  let moves = game.moves({
    square: square,
    verbose: true,
  });

  // exit if there are no moves available for this square
  if (moves.length === 0) return;

  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for (let i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare(square, piece) {
  removeGreySquares();
}

function onSnapEnd() {
  board.position(game.fen());
}

$("#level-Buttons button").click(function () {
  $("#level-Buttons button").removeClass("button-active");
  $(this).addClass("button-active");
  let depth = $(this).data("depth");
});
// console.log(isAi);

// console.log(checkStatus('black'))
