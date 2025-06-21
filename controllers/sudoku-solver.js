class SudokuSolver {
  /**

   * Validates a puzzle string. Checks for presence, invalid characters, and length.

   * @param {string} puzzleString - The puzzle string to validate.

   * @returns {{valid: boolean, error?: string}} - An object indicating if the puzzle is valid, and an error message if not.

   */

  validate(puzzleString) {
    if (!puzzleString) {
      return { valid: false, error: "Required field missing" };
    }

    if (/[^1-9.]/.test(puzzleString)) {
      return { valid: false, error: "Invalid characters in puzzle" };
    }

    if (puzzleString.length !== 81) {
      return {
        valid: false,

        error: "Expected puzzle to be 81 characters long",
      };
    }

    return { valid: true };
  }

  /**

   * Converts a letter-based row ('A'-'I') to a number (0-8).

   * @param {string} row - The row letter.

   * @returns {number} - The zero-based row index.

   */

  letterToNumber(row) {
    return row.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
  }

  /**

   * Creates a 9x9 grid from an 81-character puzzle string.

   * @param {string} puzzleString - The puzzle string.

   * @returns {Array<Array<string|number>>} - The 9x9 grid.

   */

  stringToGrid(puzzleString) {
    const grid = [];

    let row = [];

    for (let i = 0; i < 81; i++) {
      row.push(puzzleString[i]);

      if (row.length === 9) {
        grid.push(row);

        row = [];
      }
    }

    return grid;
  }

  /**

   * Checks if placing a value in a given row would cause a conflict.

   * @param {string} puzzleString - The 81-character puzzle string.

   * @param {string} row - The row to check (A-I).

   * @param {string} column - The column to check (1-9).

   * @param {string} value - The value to check (1-9).

   * @returns {boolean} - True if placement is valid (no conflict), false otherwise.

   */

  // A helper to convert the puzzle string to a 9x9 grid (assuming you have this)
  // For example:

  stringToGrid(puzzleString) {
    const grid = [];
    for (let i = 0; i < 9; i++) {
      grid.push(puzzleString.substring(i * 9, i * 9 + 9).split(""));
    }
    return grid;
  }
  letterToNumber(letter) {
    return letter.charCodeAt(0) - "A".charCodeAt(0);
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const grid = this.stringToGrid(puzzleString);
    const rowIndex = this.letterToNumber(row);
    const colIndex = parseInt(column, 10) - 1; // Convert column '1' to index 0

    // Check if 'value' already exists in the row, including the current cell's original content
    for (let c = 0; c < 9; c++) {
      // If the cell is the one we're trying to place into,
      // and its *original* value is the same as 'value',
      // it means this 'value' already exists in this row.
      // We still consider this a 'conflict' based on the test's expectation.
      // The condition `grid[rowIndex][c] === value` will handle both:
      // 1. If 'value' is present in *another* cell in the row.
      // 2. If 'value' is present in the *current* cell.
      if (grid[rowIndex][c] === value) {
        // For a general 'check' function, if the value is already at the coordinate
        // and it's the *only* instance in the row/col/region, it would be valid.
        // BUT, the test `Check a puzzle placement with multiple placement conflicts` expects
        // that if '1' is at A1, and we check '1' at A1, it counts as a conflict.
        // This implies: "is this number '1' *already occupying* this row/column/region?"
        // And the answer for A1, row A, col 1, region 1 is YES.
        // So, simply finding the value is enough to flag a conflict.
        return false; // Conflict found
      }
    }
    return true; // No conflict in row
  }

  checkColPlacement(puzzleString, row, column, value) {
    const grid = this.stringToGrid(puzzleString);
    const rowIndex = this.letterToNumber(row);
    const colIndex = parseInt(column, 10) - 1;

    for (let r = 0; r < 9; r++) {
      if (grid[r][colIndex] === value) {
        return false; // Conflict found
      }
    }
    return true; // No conflict in column
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const grid = this.stringToGrid(puzzleString);
    const rowIndex = this.letterToNumber(row);
    const colIndex = parseInt(column, 10) - 1;

    const startRow = Math.floor(rowIndex / 3) * 3;
    const startCol = Math.floor(colIndex / 3) * 3;

    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (grid[r][c] === value) {
          return false; // Conflict found
        }
      }
    }
    return true; // No conflict in region
  }
  /**

   * Solves the Sudoku puzzle using a backtracking algorithm.

   * @param {string} puzzleString - The 81-character puzzle string.

   * @returns {string|false} - The solved puzzle string, or false if unsolvable.

   */

  solve(puzzleString) {
    const grid = this.stringToGrid(puzzleString);

    // Cleaner pre-validation of the board state.

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== ".") {
          const val = grid[r][c];

          // Temporarily remove the value to check against the rest of the puzzle

          grid[r][c] = ".";

          if (
            !this.checkRowPlacement(
              grid.flat().join(""),

              String.fromCharCode(65 + r),

              (c + 1).toString(),

              val,
            ) ||
            !this.checkColPlacement(
              grid.flat().join(""),

              String.fromCharCode(65 + r),

              (c + 1).toString(),

              val,
            ) ||
            !this.checkRegionPlacement(
              grid.flat().join(""),

              String.fromCharCode(65 + r),

              (c + 1).toString(),

              val,
            )
          ) {
            return false; // Invalid initial puzzle
          }

          grid[r][c] = val; // Restore the value
        }
      }
    }

    const solveGrid = (currentGrid) => {
      const find = findEmpty(currentGrid);

      if (!find) {
        return currentGrid;
      }

      const [row, col] = find;

      for (let num = 1; num <= 9; num++) {
        if (isValidPlacement(currentGrid, row, col, num.toString())) {
          currentGrid[row][col] = num.toString();

          if (solveGrid(currentGrid)) {
            return currentGrid;
          }

          currentGrid[row][col] = ".";
        }
      }

      return false;
    };

    const findEmpty = (g) => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (g[r][c] === ".") {
            return [r, c];
          }
        }
      }

      return null;
    };

    const isValidPlacement = (g, row, col, num) => {
      for (let x = 0; x < 9; x++) {
        if (g[row][x] === num) return false;
      }

      for (let x = 0; x < 9; x++) {
        if (g[x][col] === num) return false;
      }

      const startRow = Math.floor(row / 3) * 3;

      const startCol = Math.floor(col / 3) * 3;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (g[i + startRow][j + startCol] === num) return false;
        }
      }

      return true;
    };

    const solvedGrid = solveGrid(grid);

    if (!solvedGrid) {
      return false;
    }

    return solvedGrid.flat().join("");
  }
}

module.exports = SudokuSolver;
